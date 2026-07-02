import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/usage'

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Login required.' }, { status: 401 })
  const { id } = await params
  const admin = createSupabaseAdminClient()
  if (!admin) return NextResponse.json({ error: 'Supabase is not configured.' }, { status: 503 })
  const { error } = await admin.from('saved_guides').upsert({ user_id: user.id, guide_id: id })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
