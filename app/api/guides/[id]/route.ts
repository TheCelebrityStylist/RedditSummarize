import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase'

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const admin = createSupabaseAdminClient()
  if (!admin) return NextResponse.json({ error: 'Supabase is not configured.' }, { status: 503 })
  const { data, error } = await admin.from('guides').select('*').eq('id', id).maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: 'Guide not found.' }, { status: 404 })
  return NextResponse.json({ guide: data })
}
