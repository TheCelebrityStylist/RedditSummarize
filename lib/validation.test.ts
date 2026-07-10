import { describe, expect, it } from 'vitest'
import { normalizeRedditUrl, redditUrlSchema } from './validation'
describe('Reddit URL handling', () => {
  it('accepts supported thread hosts', () => expect(redditUrlSchema.safeParse('https://old.reddit.com/r/travel/comments/abc123/title/').success).toBe(true))
  it('accepts short share links', () => expect(redditUrlSchema.safeParse('https://redd.it/abc123').success).toBe(true))
  it('rejects lookalike domains', () => expect(redditUrlSchema.safeParse('https://reddit.com.evil.test/r/a/comments/b').success).toBe(false))
  it('normalizes host and removes tracking', () => expect(normalizeRedditUrl('https://m.reddit.com/r/a/comments/b/title/?utm_source=x#x')).toBe('https://www.reddit.com/r/a/comments/b/title'))
})
