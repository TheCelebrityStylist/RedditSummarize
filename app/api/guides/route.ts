import { NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/usage'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ guides: [] })
  const admin = createSupabaseAdminClient()
  if (!admin) return NextResponse.json({ guides: [] })
  const { data, error } = await admin.from('guides').select('id, reddit_url, subreddit, thread_title, comment_count_analyzed, created_at').eq('user_id', user.id).order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ guides: data })
}
