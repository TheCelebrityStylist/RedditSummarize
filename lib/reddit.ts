import type { CleanThread, RedditComment } from './types'
import { mockThread } from './demo'
import { redditJsonUrl } from './validation'

const BOT_PATTERNS = [/\b(i am a bot|automoderator|beep boop|this action was performed automatically)\b/i]

function cleanText(value?: string | null) {
  return (value || '')
    .replace(/&amp;/g, '&')
    .replace(/\r/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function isUsefulComment(body: string) {
  const text = cleanText(body)
  if (!text || text === '[deleted]' || text === '[removed]') return false
  if (text.length < 25) return false
  return !BOT_PATTERNS.some((pattern) => pattern.test(text))
}

function flattenComments(children: any[], depth = 0, acc: RedditComment[] = []) {
  for (const child of children || []) {
    if (child?.kind !== 't1') continue
    const data = child.data
    const body = cleanText(data?.body)
    if (isUsefulComment(body)) {
      acc.push({
        id: data.id,
        body,
        score: Number(data.score || 0),
        depth,
        createdUtc: data.created_utc,
        permalink: data.permalink ? `https://www.reddit.com${data.permalink}` : undefined
      })
    }
    const replies = data?.replies?.data?.children
    if (Array.isArray(replies)) flattenComments(replies, depth + 1, acc)
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
      const relevanceScore = scoreScore * 1.6 + lengthScore * 1.1 + overlap * 0.08 + depthScore
      return { ...comment, relevanceScore }
    })
    .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))
}

export async function fetchRedditThread(url: string): Promise<CleanThread> {
  if (!process.env.REDDIT_CLIENT_ID && process.env.NODE_ENV !== 'production') return mockThread

  const response = await fetch(redditJsonUrl(url), {
    headers: { 'User-Agent': process.env.REDDIT_USER_AGENT || 'ThreadGuide/0.1' },
    next: { revalidate: 60 }
  })

  if (!response.ok) throw new Error('Reddit thread is unavailable, private, or rate-limited.')
  const json = await response.json()
  const postData = json?.[0]?.data?.children?.[0]?.data
  const commentChildren = json?.[1]?.data?.children
  if (!postData) throw new Error('Could not parse Reddit thread.')

  const post = {
    title: cleanText(postData.title),
    body: cleanText(postData.selftext),
    subreddit: postData.subreddit,
    author: postData.author,
    score: postData.score,
    commentCount: postData.num_comments,
    createdUtc: postData.created_utc,
    permalink: `https://www.reddit.com${postData.permalink}`,
    url
  }

  const allComments = flattenComments(commentChildren)
  const ranked = rankComments(post.title, post.body, allComments)
  const maxComments = Number(process.env.MAX_COMMENTS_FOR_LLM || 180)
  const comments = ranked.slice(0, maxComments)

  return { post, comments, analyzedCount: comments.length, truncated: ranked.length > comments.length }
}

export function compactThreadForLlm(thread: CleanThread) {
  return {
    post: thread.post,
    comments: thread.comments.map((comment, index) => ({
      rank: index + 1,
      body: comment.body.slice(0, 1400),
      score: comment.score,
      depth: comment.depth
    })),
    analyzedCount: thread.analyzedCount,
    truncated: thread.truncated
  }
}
