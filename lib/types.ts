export type ConfidenceLevel = 'High' | 'Medium' | 'Low'

export type RedditPost = {
  title: string
  body: string
  subreddit: string
  author?: string
  score?: number
  commentCount?: number
  createdUtc?: number
  permalink: string
  url: string
}

export type RedditComment = {
  id: string
  body: string
  score: number
  depth: number
  createdUtc?: number
  permalink?: string
  relevanceScore?: number
}

export type CleanThread = {
  post: RedditPost
  comments: RedditComment[]
  analyzedCount: number
  truncated: boolean
}

export type GuideJson = {
  overview: {
    thread_title: string
    subreddit: string
    comments_analyzed: number
    main_question: string
    executive_summary: string
    source_url?: string
  }
  consensus: {
    summary: string
    confidence: ConfidenceLevel
    is_divided: boolean
    divided_note?: string
  }
  recommendations: Array<{ title: string; why_it_matters: string; caveats?: string }>
  pros: Array<{ title: string; detail: string }>
  cons: Array<{ title: string; detail: string }>
  best_comments: Array<{ summary: string; score?: number; why_useful: string }>
  faq: Array<{ question: string; answer: string }>
  action_plan: Array<{ step: number; title: string; detail: string }>
  disagreements: Array<{ issue: string; side_a: string; side_b: string; practical_read: string }>
  final_takeaway: string
  safety_note?: string
}

export type GuideRecord = {
  id: string
  user_id?: string | null
  reddit_url: string
  subreddit: string
  thread_title: string
  original_post_text?: string | null
  generated_guide: GuideJson
  comment_count_analyzed: number
  created_at: string
  updated_at: string
  visibility: 'private' | 'public'
  generation_status: 'complete' | 'failed' | 'processing'
  error_message?: string | null
}

export type SubscriptionStatus = 'free' | 'pro' | 'past_due' | 'canceled'
