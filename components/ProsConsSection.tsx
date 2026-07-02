import type { GuideJson } from '@/lib/types'

export function ProsConsSection({ pros, cons }: { pros: GuideJson['pros']; cons: GuideJson['cons'] }) {
  return <section className="grid gap-5 md:grid-cols-2"><div className="rounded-3xl border border-line bg-white p-6 shadow-soft"><h2 className="text-xl font-bold">Pros</h2><div className="mt-4 space-y-3">{pros.map((item, index) => <div key={index}><p className="font-semibold">{item.title}</p><p className="text-sm leading-6 text-slate-600">{item.detail}</p></div>)}</div></div><div className="rounded-3xl border border-line bg-white p-6 shadow-soft"><h2 className="text-xl font-bold">Cons / Risks</h2><div className="mt-4 space-y-3">{cons.map((item, index) => <div key={index}><p className="font-semibold">{item.title}</p><p className="text-sm leading-6 text-slate-600">{item.detail}</p></div>)}</div></div></section>
}
