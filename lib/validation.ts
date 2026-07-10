import { z } from 'zod'

function withProtocol(value: string) { const v = value.trim(); return /^https?:\/\//i.test(v) ? v : `https://${v}` }
export const redditUrlSchema = z.string().trim().min(1).transform(withProtocol).pipe(z.string().url()).refine((value) => {
  const url = new URL(value); const host = url.hostname.toLowerCase().replace(/^(www|old|m|np)\./, '')
  return host === 'redd.it' ? /^\/[a-z0-9]+\/?$/i.test(url.pathname) : host === 'reddit.com' && /\/r\/[^/]+\/comments\/[a-z0-9]+/i.test(url.pathname)
}, 'Paste a Reddit thread link, for example reddit.com/r/travel/comments/…')

export function normalizeRedditUrl(input: string) {
  const parsed = new URL(withProtocol(input)); const short = parsed.hostname.toLowerCase() === 'redd.it'
  parsed.protocol = 'https:'; parsed.search = ''; parsed.hash = ''
  if (!short) parsed.hostname = 'www.reddit.com'
  return parsed.toString().replace(/\/$/, '')
}
export function redditJsonUrl(input: string) { return `${normalizeRedditUrl(input)}.json?limit=500&sort=confidence&raw_json=1` }
