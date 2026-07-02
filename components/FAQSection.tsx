import type { GuideJson } from '@/lib/types'

export function FAQSection({ items }: { items: GuideJson['faq'] }) {
  return <section className="rounded-3xl border border-line bg-white p-6 shadow-soft"><h2 className="text-xl font-bold">FAQ</h2><div className="mt-4 divide-y divide-line">{items.map((item, index) => <div key={index} className="py-4 first:pt-0 last:pb-0"><p className="font-semibold">{item.question}</p><p className="mt-1 text-sm leading-6 text-slate-600">{item.answer}</p></div>)}</div></section>
}
