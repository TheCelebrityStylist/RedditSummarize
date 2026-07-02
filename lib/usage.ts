import { createSupabaseAdminClient } from './supabase'
import { createSupabaseServerClient } from './supabase-server'

export async function getCurrentUser() {
  const supabase = await createSupabaseServerClient()
  if (!supabase) return null
  const { data } = await supabase.auth.getUser()
  return data.user || null
}

export async function getUserPlan(userId?: string | null) {
  if (!userId) return 'free'
  const admin = createSupabaseAdminClient()
  if (!admin) return 'free'
  const { data } = await admin.from('subscriptions').select('status').eq('user_id', userId).maybeSingle()
  return data?.status === 'pro' ? 'pro' : 'free'
}

export async function getMonthlyUsage(userId?: string | null, guestId?: string | null) {
  const admin = createSupabaseAdminClient()
  if (!admin) return 0
  const since = new Date()
  since.setUTCDate(1)
  since.setUTCHours(0, 0, 0, 0)
  let query = admin.from('generations').select('id', { count: 'exact', head: true }).gte('created_at', since.toISOString())
  if (userId) query = query.eq('user_id', userId)
  else if (guestId) query = query.eq('guest_id', guestId)
  else return 0
  const { count } = await query
  return count || 0
}

export async function assertCanGenerate(userId?: string | null, guestId?: string | null) {
  const plan = await getUserPlan(userId)
  const usage = await getMonthlyUsage(userId, guestId)
  const limit = plan === 'pro' ? Number(process.env.PRO_MONTHLY_GUIDES || 1000) : Number(process.env.FREE_MONTHLY_GUIDES || 3)
  if (usage >= limit) {
    const error = new Error('Monthly generation limit reached. Upgrade to Pro to continue.')
    error.name = 'UsageLimitError'
    throw error
  }
  return { plan, usage, limit }
}

export async function recordGeneration(input: { userId?: string | null; guestId?: string | null; guideId?: string | null; redditUrl: string; status: 'complete' | 'failed'; error?: string }) {
  const admin = createSupabaseAdminClient()
  if (!admin) return
  await admin.from('generations').insert({
    user_id: input.userId || null,
    guest_id: input.guestId || null,
    guide_id: input.guideId || null,
    reddit_url: input.redditUrl,
    status: input.status,
    error_message: input.error || null
  })
}
