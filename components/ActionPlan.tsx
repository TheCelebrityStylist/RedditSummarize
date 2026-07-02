import type { GuideJson } from '@/lib/types'

export function ActionPlan({ steps }: { steps: GuideJson['action_plan'] }) {
  return <section className="rounded-3xl border border-line bg-white p-6 shadow-soft"><h2 className="text-xl font-bold">Step-by-Step Action Plan</h2><div className="mt-5 space-y-4">{steps.map((step) => <div key={step.step} className="flex gap-4"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink text-sm font-bold text-white">{step.step}</div><div><p className="font-semibold">{step.title}</p><p className="mt-1 text-sm leading-6 text-slate-600">{step.detail}</p></div></div>)}</div></section>
}
