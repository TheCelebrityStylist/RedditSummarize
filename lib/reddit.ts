import type { CleanThread, RedditComment } from './types'
import { mockThread } from './demo'
import { extractRedditThreadId, normalizeRedditUrl, redditJsonUrl } from './validation'

const BOT_PATTERNS = [
  /\b(i am a bot|automoderator|beep boop|this action was performed automatically)\b/i,
  /\bmoderator bot\b/i
]

const DEFAULT_USER_AGENT = 'web:threadguide:v1.0 (by /u/threadguide_app)'
const REQUEST_TIMEOUT_MS = 12_000

let cachedAccessToken: { token: string; expiresAt: number } | null = null

class RedditFetchError extends Error {
  constructor(
    message: string,
    public readonly code: 'AUTH_UNAVAILABLE' | 'RATE_LIMITED' | 'THREAD_NOT_FOUND' | 'PRIVATE' | 'TIMEOUT' | 'UNAVAILABLE' | 'PARSE_ERROR',
    public readonly status: number
  ) {
    super(message)
    this.name = 'RedditFetchError'
  }
}

function cleanText(value?: string | null) {
  return (value || '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\r/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function isUsefulComment(body: string) {
  const text = cleanText(body)
  if (!text || text === '[deleted]' || text === '[removed]') return false
  if (text.length < 15) return false
  return !BOT_PATTERNS.some((pattern) => pattern.test(text))
}

function flattenComments(children: unknown[], depth = 0, acc: RedditComment[] = []) {
  for (const child of children || []) {
    if (!child || typeof child !== 'object') continue
    const listing = child as { kind?: string; data?: Record<string, unknown> }
    if (listing.kind !== 't1') continue

    const data = listing.data || {}
    const body = cleanText(typeof data.body === 'string' ? data.body : '')
    if (isUsefulComment(body)) {
      const permalink = typeof data.permalink === 'string' ? data.permalink : undefined
      acc.push({
        id: typeof data.id === 'string' ? data.id : crypto.randomUUID(),
        body,
        score: Number(data.score || 0),
        depth,
        createdUtc: typeof data.created_utc === 'number' ? data.created_utc : undefined,
        permalink: permalink ? `https://www.reddit.com${permalink}` : undefined
      })
    }

    const replies = data.replies
    if (replies && typeof replies === 'object') {
      const replyChildren = (replies as { data?: { children?: unknown[] } }).data?.children
      if (Array.isArray(replyChildren)) flattenComments(replyChildren, depth + 1, acc)
    }
  }
  return acc
}

function tokenize(value: string) {
  return new Set(value.toLowerCase().match(/[a-z0-9]{4,}/g) || [])
}

function rankComments(title: string, body: string, comments: RedditComment[]) {
  const queryTokens = tokenize(`${title} ${body}`)
  return comments
    .map((comment) => {
      const tokens = tokenize(comment.body)
      let overlap = 0
      for (const token of tokens) if (queryTokens.has(token)) overlap++
      const lengthScore = Math.min(comment.body.length / 900, 1)
      const scoreScore = Math.log10(Math.max(comment.score, 0) + 1)
      const depthScore = comment.depth === 0 ? 0.45 : comment.depth === 1 ? 0.25 : 0
      const actionabilityScore = /\b(should|recommend|avoid|try|use|buy|book|start|stop|because|instead)\b/i.test(comment.body) ? 0.35 : 0
      const relevanceScore = scoreScore * 1.6 + lengthScore * 1.1 + overlap * 0.08 + depthScore + actionabilityScore
      return { ...comment, relevanceScore }
    })
    .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))
}

async function fetchWithTimeout(url: string, init: RequestInit, attempts = 2) {
  let lastError: unknown
  for (let attempt = 0; attempt < attempts; attempt++) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
    try {
      const response = await fetch(url, { ...init, signal: controller.signal, cache: 'no-store' })
      clearTimeout(timeout)
      if (response.status >= 500 && attempt + 1 < attempts) {
        await new Promise((resolve) => setTimeout(resolve, 350 * (attempt + 1)))
        continue
      }
      return response
    } catch (error) {
      clearTimeout(timeout)
      lastError = error
      if (attempt + 1 < attempts) {
        await new Promise((resolve) => setTimeout(resolve, 350 * (attempt + 1)))
        continue
      }
    }
  }

  if (lastError instanceof Error && lastError.name === 'AbortError') {
    throw new RedditFetchError('Reddit took too long to respond. Please try again.', 'TIMEOUT', 504)
  }
  throw new RedditFetchError('Could not connect to Reddit right now. Please try again.', 'UNAVAILABLE', 503)
}

async function getRedditAccessToken() {
  const clientId = process.env.REDDIT_CLIENT_ID
  const clientSecret = process.env.REDDIT_CLIENT_SECRET
  if (!clientId || !clientSecret) return null

  if (cachedAccessToken && cachedAccessToken.expiresAt > Date.now() + 60_000) return cachedAccessToken.token

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
  const response = await fetchWithTimeout('https://www.reddit.com/api/v1/access_token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': process.env.REDDIT_USER_AGENT || DEFAULT_USER_AGENT
    },
    body: 'grant_type=client_credentials'
  })

  if (!response.ok) {
    throw new RedditFetchError('Reddit authentication is not configured correctly.', 'AUTH_UNAVAILABLE', 503)
  }

  const payload = (await response.json()) as { access_token?: string; expires_in?: number }
  if (!payload.access_token) throw new RedditFetchError('Reddit did not return an access token.', 'AUTH_UNAVAILABLE', 503)

  cachedAccessToken = {
    token: payload.access_token,
    expiresAt: Date.now() + Math.max(60, payload.expires_in || 3600) * 1000
  }
  return payload.access_token
}

async function fetchViaOAuth(url: string) {
  const token = await getRedditAccessToken()
  if (!token) return null

  const threadId = extractRedditThreadId(url)
  const response = await fetchWithTimeout(`https://oauth.reddit.com/comments/${threadId}?limit=500&sort=confidence&raw_json=1`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'User-Agent': process.env.REDDIT_USER_AGENT || DEFAULT_USER_AGENT,
      Accept: 'application/json'
    }
  })

  if (response.status === 401) {
    cachedAccessToken = null
    throw new RedditFetchError('Reddit authentication expired. Please retry.', 'AUTH_UNAVAILABLE', 503)
  }
  if (response.status === 403) throw new RedditFetchError('This thread is private, restricted, or unavailable.', 'PRIVATE', 403)
  if (response.status === 404) throw new RedditFetchError('Reddit could not find this thread.', 'THREAD_NOT_FOUND', 404)
  if (response.status === 429) throw new RedditFetchError('Reddit is rate-limiting requests. Please wait and retry.', 'RATE_LIMITED', 429)
  if (!response.ok) throw new RedditFetchError('Reddit is temporarily unavailable.', 'UNAVAILABLE', 503)

  return response.json()
}

async function fetchViaPublicJson(url: string) {
  const response = await fetchWithTimeout(redditJsonUrl(url), {
    headers: {
      'User-Agent': process.env.REDDIT_USER_AGENT || DEFAULT_USER_AGENT,
      Accept: 'application/json'
    }
  })

  if (response.status === 403) throw new RedditFetchError('This thread is private, restricted, or blocked by Reddit.', 'PRIVATE', 403)
  if (response.status === 404) throw new RedditFetchError('Reddit could not find this thread.', 'THREAD_NOT_FOUND', 404)
  if (response.status === 429) throw new RedditFetchError('Reddit is rate-limiting requests. Please wait and retry.', 'RATE_LIMITED', 429)
  if (!response.ok) throw new RedditFetchError('Reddit is temporarily unavailable.', 'UNAVAILABLE', 503)

  const contentType = response.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    throw new RedditFetchError('Reddit returned an unexpected response.', 'PARSE_ERROR', 502)
  }
  return response.json()
}

function parseThread(json: unknown, url: string): CleanThread {
  const listings = json as Array<{ data?: { children?: Array<{ data?: Record<string, unknown> }> } }>
  const postData = listings?.[0]?.data?.children?.[0]?.data
  const commentChildren = listings?.[1]?.data?.children
  if (!postData) throw new RedditFetchError('Could not parse this Reddit thread.', 'PARSE_ERROR', 502)

  const permalink = typeof postData.permalink === 'string' ? postData.permalink : ''
  const post = {
    title: cleanText(typeof postData.title === 'string' ? postData.title : ''),
    body: cleanText(typeof postData.selftext === 'string' ? postData.selftext : ''),
    subreddit: typeof postData.subreddit === 'string' ? postData.subreddit : 'unknown',
    author: typeof postData.author === 'string' ? postData.author : undefined,
    score: Number(postData.score || 0),
    commentCount: Number(postData.num_comments || 0),
    createdUtc: typeof postData.created_utc === 'number' ? postData.created_utc : undefined,
    permalink: permalink ? `https://www.reddit.com${permalink}` : normalizeRedditUrl(url),
    url: normalizeRedditUrl(url)
  }

  const allComments = flattenComments(Array.isArray(commentChildren) ? commentChildren : [])
  const ranked = rankComments(post.title, post.body, allComments)
  const maxComments = Number(process.env.MAX_COMMENTS_FOR_LLM || 180)
  const comments = ranked.slice(0, maxComments)

  if (!comments.length) {
    throw new RedditFetchError('The thread was found, but it does not contain enough useful comments to analyze.', 'PARSE_ERROR', 422)
  }

  return { post, comments, analyzedCount: comments.length, truncated: ranked.length > comments.length }
}

export async function fetchRedditThread(url: string): Promise<CleanThread> {
  const normalizedUrl = normalizeRedditUrl(url)

  if (process.env.USE_MOCK_REDDIT === 'true') return mockThread

  let oauthError: unknown
  try {
    const oauthJson = await fetchViaOAuth(normalizedUrl)
    if (oauthJson) return parseThread(oauthJson, normalizedUrl)
  } catch (error) {
    oauthError = error
  }

  try {
    const publicJson = await fetchViaPublicJson(normalizedUrl)
    return parseThread(publicJson, normalizedUrl)
  } catch (fallbackError) {
    if (oauthError instanceof RedditFetchError && oauthError.code !== 'AUTH_UNAVAILABLE') throw oauthError
    if (fallbackError instanceof RedditFetchError) throw fallbackError
    throw new RedditFetchError('Could not analyze this Reddit thread right now.', 'UNAVAILABLE', 503)
  }
}

export function compactThreadForLlm(thread: CleanThread) {
  return {
    post: thread.post,
    comments: thread.comments.map((comment, index) => ({
      rank: index + 1,
      body: comment.body.slice(0, 1400),
      score: comment.score,
      depth: comment.depth,
      permalink: comment.permalink
    })),
    analyzedCount: thread.analyzedCount,
    truncated: thread.truncated
  }
}
