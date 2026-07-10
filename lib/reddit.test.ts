import { describe, expect, it } from 'vitest'
import { isUsefulComment, rankComments } from './reddit'
describe('comment processing', () => {
  it('filters removed and bot comments', () => { expect(isUsefulComment('[removed]')).toBe(false); expect(isUsefulComment('I am a bot, and this action was performed automatically.')).toBe(false) })
  it('keeps concise actionable advice', () => expect(isUsefulComment('Patch test it first, then wait 24 hours.')).toBe(true))
  it('ranks relevant, useful comments', () => { const ranked = rankComments('best camera travel', '', [{ id:'a', body:'A specific travel camera recommendation with reasons and tradeoffs.', score:12, depth:0 }, { id:'b', body:'This is a sufficiently long unrelated response about cooking dinner.', score:0, depth:3 }]); expect(ranked[0].id).toBe('a') })
})
