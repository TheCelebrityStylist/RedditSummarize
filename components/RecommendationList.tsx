import type { GuideJson } from '@/lib/types'

export function RecommendationList({ items }: { items: GuideJson['recommendations'] }) {
  return <section className="rounded-3xl border border-line bg-white p-6 shadow-soft"><h2 className="text-xl font-bold">Key Recommendations</h2><ol className="mt-4 space-y-3">{items.map((item, index) => <li key={index} className="rounded-2xl bg-slate-50 p-4"><p className="font-semibold">{index + 1}. {item.title}</p><p className="mt-1 text-sm leading-6 text-slate-600">{item.why_it_matters}</p>{item.caveats && <p className="mt-2 text-sm text-slate-500"><b>Caveat:</b> {item.caveats}</p>}</li>)}</ol></section>
}
