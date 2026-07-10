'use client'

export function PricingCards() {
  async function checkout() {
    const response = await fetch('/api/stripe/checkout', { method: 'POST' })
    const json = await response.json()
    if (json.url) window.location.href = json.url
  }
  const free=['3 guides per month','Standard threads','Consensus and recommendations','Copy results'];const pro=['250 guides per month','Longer Reddit threads','Saved guide library','Markdown exports','Regeneration','Advanced disagreement analysis'];return <div className="grid gap-5 md:grid-cols-2"><div className="rounded-3xl border border-line bg-white p-7 shadow-sm"><p className="text-sm font-bold text-muted">FOR TRYING THREADGUIDE</p><h3 className="mt-3 text-2xl font-black">Free</h3><p className="mt-5 text-4xl font-black">$0</p><ul className="mt-7 space-y-3 text-sm text-slate-600">{free.map(x=><li key={x}>✓ {x}</li>)}</ul><a href="#generator" className="mt-8 block rounded-xl border border-ink px-4 py-3 text-center font-bold">Generate free guide</a></div><div className="relative rounded-3xl border-2 border-ink bg-ink p-7 text-white shadow-soft"><span className="absolute right-5 top-5 rounded-full bg-brand px-3 py-1 text-xs font-bold">MOST USEFUL</span><p className="text-sm font-bold text-slate-400">FOR SERIOUS RESEARCH</p><h3 className="mt-3 text-2xl font-black">Pro</h3><p className="mt-5 text-4xl font-black">$8<span className="text-base font-medium text-slate-400">/month</span></p><ul className="mt-7 space-y-3 text-sm text-slate-300">{pro.map(x=><li key={x}>✓ {x}</li>)}</ul><button onClick={checkout} className="mt-8 w-full rounded-xl bg-brand px-4 py-3 font-bold text-white hover:bg-orange-600">Upgrade to Pro</button><p className="mt-3 text-center text-xs text-slate-400">Cancel anytime</p></div></div>
}
