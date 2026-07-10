import { describe, expect, it } from 'vitest'
import { guideSchema } from './guide-schema'
import { mockGuide } from './demo'
describe('guide schema', () => { it('accepts demo output', () => expect(guideSchema.safeParse(mockGuide).success).toBe(true)); it('rejects incomplete output', () => expect(guideSchema.safeParse({ overview: {} }).success).toBe(false)) })
