import Link from 'next/link'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/usage'

export default async function SavedPage() {
  const user = await getCurrentUser()
  const admin = createSupabaseAdminClient()
  const { data } = user && admin ? await admin.from('guides').select('id, thread_title, subreddit, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50) : { data: [] }
  return <main className="mx-auto max-w-4xl px-5 py-10"><Link href="/dashboard" className="text-sm font-semibold text-muted">← Dashboard</Link><h1 className="mt-6 text-3xl font-black">Saved guides</h1><div className="mt-6 space-y-3">{data?.length ? data.map((guide: any) => <Link key={guide.id} href={`/guides/${guide.id}`} className="block rounded-2xl border border-line bg-white p-4 shadow-sm hover:shadow-soft"><p className="font-semibold">{guide.thread_title}</p><p className="mt-1 text-sm text-muted">r/{guide.subreddit}</p></Link>) : <div className="rounded-2xl border border-line bg-white p-6 text-slate-600">No saved guides yet.</div>}</div></main>
}
