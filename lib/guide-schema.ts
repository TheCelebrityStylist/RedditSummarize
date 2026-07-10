import { z } from 'zod'

const confidence = z.enum(['High', 'Medium', 'Low'])
export const guideSchema = z.object({
  overview: z.object({ thread_title: z.string().min(1), subreddit: z.string().min(1), comments_analyzed: z.number().int().nonnegative(), main_question: z.string().min(1), executive_summary: z.string().min(1), source_url: z.string().url().optional() }),
  consensus: z.object({ summary: z.string().min(1), confidence, is_divided: z.boolean(), divided_note: z.string().optional() }),
  recommendations: z.array(z.object({ title: z.string().min(1), why_it_matters: z.string().min(1), caveats: z.string().optional() })).min(1),
  pros: z.array(z.object({ title: z.string().min(1), detail: z.string().min(1) })),
  cons: z.array(z.object({ title: z.string().min(1), detail: z.string().min(1) })),
  best_comments: z.array(z.object({ summary: z.string().min(1), score: z.number().optional(), why_useful: z.string().min(1) })),
  faq: z.array(z.object({ question: z.string().min(1), answer: z.string().min(1) })),
  action_plan: z.array(z.object({ step: z.number().int().positive(), title: z.string().min(1), detail: z.string().min(1) })).min(1),
  disagreements: z.array(z.object({ issue: z.string().min(1), side_a: z.string().min(1), side_b: z.string().min(1), practical_read: z.string().min(1) })),
  final_takeaway: z.string().min(1), safety_note: z.string().optional()
})

export type ValidatedGuide = z.infer<typeof guideSchema>
