import { z } from 'zod'

const REDDIT_HOSTS = new Set([
  'reddit.com',
  'www.reddit.com',
  'old.reddit.com',
  'm.reddit.com',
  'np.reddit.com'
])

export function prepareRedditUrl(input: string) {
  const trimmed = input.trim()
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
}

export const redditUrlSchema = z.string().min(1).transform(prepareRedditUrl).refine((value) => {
  try {
    const url = new URL(value)
    return REDDIT_HOSTS.has(url.hostname.toLowerCase()) && /\/r\/[^/]+\/comments\/[^/]+/i.test(url.pathname)
  } catch {
    return false
  }
}, 'Enter a valid public Reddit thread URL')

export function normalizeRedditUrl(input: string) {
  const parsed = new URL(prepareRedditUrl(input))
  if (!REDDIT_HOSTS.has(parsed.hostname.toLowerCase())) throw new Error('Unsupported Reddit URL.')

  const match = parsed.pathname.match(/(\/r\/[^/]+\/comments\/[^/]+(?:\/[^/]+)?)/i)
  if (!match) throw new Error('Enter a Reddit thread URL, not a subreddit or homepage URL.')

  const canonicalPath = match[1].replace(/\/$/, '')
  return `https://www.reddit.com${canonicalPath}`
}

export function extractRedditThreadId(input: string) {
  const normalized = normalizeRedditUrl(input)
  const match = normalized.match(/\/comments\/([^/]+)/i)
  if (!match?.[1]) throw new Error('Could not determine the Reddit thread ID.')
  return match[1]
}

export function redditJsonUrl(input: string) {
  const normalized = normalizeRedditUrl(input)
  return `${normalized}.json?limit=500&sort=confidence&raw_json=1`
}
