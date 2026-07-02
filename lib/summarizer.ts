import OpenAI from 'openai'
import type { CleanThread, GuideJson } from './types'
import { compactThreadForLlm } from './reddit'
import { mockGuide } from './demo'

const jsonShape = `{
  "overview": {"thread_title":"", "subreddit":"", "comments_analyzed":0, "main_question":"", "executive_summary":"", "source_url":""},
  "consensus": {"summary":"", "confidence":"High|Medium|Low", "is_divided":false, "divided_note":""},
  "recommendations": [{"title":"", "why_it_matters":"", "caveats":""}],
  "pros": [{"title":"", "detail":""}],
  "cons": [{"title":"", "detail":""}],
  "best_comments": [{"summary":"", "score":0, "why_useful":""}],
  "faq": [{"question":"", "answer":""}],
  "action_plan": [{"step":1, "title":"", "detail":""}],
  "disagreements": [{"issue":"", "side_a":"", "side_b":"", "practical_read":""}],
  "final_takeaway":"",
  "safety_note":""
}`

const sensitiveSubreddits = ['skincareaddiction', 'fitness', 'personalfinance', 'legaladvice']

function safeParseGuide(raw: string): GuideJson {
  const cleaned = raw.replace(/^```json/i, '').replace(/^```/, '').replace(/```$/g, '').trim()
  return JSON.parse(cleaned) as GuideJson
}

export async function generateGuideJson(thread: CleanThread): Promise<GuideJson> {
  if (!process.env.OPENAI_API_KEY) return mockGuide

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const subreddit = thread.post.subreddit.toLowerCase()
  const needsSafetyNote = sensitiveSubreddits.includes(subreddit)
  const payload = compactThreadForLlm(thread)

  const response = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    temperature: 0.25,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `You are ThreadGuide, an expert Reddit thread analyst. Convert messy Reddit discussions into practical decision guides. Output only valid JSON matching this shape: ${jsonShape}. Do not copy long comments verbatim. Do not expose usernames. Be concrete, decision-oriented, and subreddit-aware. Mention divided consensus when relevant.`
      },
      {
        role: 'user',
        content: `Analyze this Reddit thread and produce a polished practical guide. Include a light safety note only if the topic involves medical/skincare/fitness/legal/financial advice. Needs safety note: ${needsSafetyNote}. Thread JSON:\n${JSON.stringify(payload)}`
      }
    ]
  })

  const content = response.choices[0]?.message?.content
  if (!content) throw new Error('OpenAI returned an empty guide.')
  return safeParseGuide(content)
}
