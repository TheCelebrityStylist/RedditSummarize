import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { fetchRedditThread } from '@/lib/reddit'
import { generateGuideJson } from '@/lib/summarizer'
import { redditUrlSchema, normalizeRedditUrl } from '@/lib/validation'
import { assertCanGenerate, getCurrentUser, recordGeneration } from '@/lib/usage'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { getCachedThread, setCachedThread } from '@/lib/cache'

const bodySchema = z.object({ redditUrl: redditUrlSchema })

export async function POST(request: NextRequest) {
  let redditUrl = ''
  try {
    const body = bodySchema.parse(await request.json())
    redditUrl = normalizeRedditUrl(body.redditUrl)
    const guestId = request.cookies.get('threadguide_guest_id')?.value || crypto.randomUUID()
    const user = await getCurrentUser()
    await assertCanGenerate(user?.id, guestId)

    const thread = getCachedThread(redditUrl) || await fetchRedditThread(redditUrl)
    setCachedThread(redditUrl, thread)
    const guide = await generateGuideJson(thread)
    const admin = createSupabaseAdminClient()
    let id = `local_${Date.now()}`

    if (admin) {
      const { data, error } = await admin.from('guides').insert({
        user_id: user?.id || null,
        reddit_url: redditUrl,
        subreddit: thread.post.subreddit,
        thread_title: thread.post.title,
        original_post_text: thread.post.body,
        generated_guide: guide,
        comment_count_analyzed: thread.analyzedCount,
        visibility: 'private',
        generation_status: 'complete'
      }).select('id').single()
      if (error) throw error
      id = data.id
    }

    await recordGeneration({ userId: user?.id, guestId, guideId: id, redditUrl, status: 'complete' })
    const response = NextResponse.json({ id, guide })
    response.cookies.set('threadguide_guest_id', guestId, { httpOnly: true, sameSite: 'lax', maxAge: 60 * 60 * 24 * 365 })
    return response
  } catch (error) {
    await recordGeneration({ redditUrl, status: 'failed', error: error instanceof Error ? error.message : 'Unknown error' })
    if (error instanceof z.ZodError) return NextResponse.json({ error: 'Invalid Reddit URL.' }, { status: 400 })
    const status = error instanceof Error && error.name === 'UsageLimitError' ? 402 : 500
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Could not generate guide.' }, { status })
  }
}
