import type { GuideJson } from '@/lib/types'

export function ConsensusCard({ consensus }: { consensus: GuideJson['consensus'] }) {
  return <section className="rounded-3xl border border-line bg-white p-6 shadow-soft"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-bold">Consensus</h2><span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold">{consensus.confidence} confidence</span></div><p className="mt-3 leading-7 text-slate-600">{consensus.summary}</p>{consensus.is_divided && <p className="mt-3 rounded-xl bg-orange-50 p-3 text-sm text-orange-800">Thread is divided: {consensus.divided_note}</p>}</section>
}
