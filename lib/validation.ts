import { z } from 'zod'

export const redditUrlSchema = z.string().url().refine((value) => {
  try {
    const url = new URL(value)
    const host = url.hostname.replace(/^www\./, '')
    const allowed = ['reddit.com', 'old.reddit.com', 'm.reddit.com']
    return allowed.includes(host) && /\/r\/[^/]+\/comments\/[^/]+/i.test(url.pathname)
  } catch {
    return false
  }
}, 'Enter a valid Reddit thread URL')

export function normalizeRedditUrl(input: string) {
  const parsed = new URL(input)
  parsed.hostname = 'www.reddit.com'
  parsed.protocol = 'https:'
  parsed.search = ''
  parsed.hash = ''
  return parsed.toString().replace(/\/$/, '')
}

export function redditJsonUrl(input: string) {
  const normalized = normalizeRedditUrl(input)
  return `${normalized}.json?limit=500&sort=confidence&raw_json=1`
}
