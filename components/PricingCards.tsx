'use client'

export function PricingCards() {
  async function checkout() {
    const response = await fetch('/api/stripe/checkout', { method: 'POST' })
    const json = await response.json()
    if (json.url) window.location.href = json.url
  }
  return <div className="grid gap-5 md:grid-cols-2"><div className="rounded-3xl border border-line bg-white p-6 shadow-soft"><h3 className="text-2xl font-bold">Free</h3><p className="mt-2 text-slate-600">Try ThreadGuide for quick thread decisions.</p><p className="mt-6 text-4xl font-bold">$0</p><ul className="mt-6 space-y-2 text-sm text-slate-600"><li>3 guides/month</li><li>Standard thread length</li><li>Copy results</li></ul></div><div className="rounded-3xl border-2 border-ink bg-white p-6 shadow-soft"><h3 className="text-2xl font-bold">Pro</h3><p className="mt-2 text-slate-600">For frequent Reddit research and saved workflows.</p><p className="mt-6 text-4xl font-bold">$8<span className="text-base font-medium text-muted">/month</span></p><ul className="mt-6 space-y-2 text-sm text-slate-600"><li>Higher limits</li><li>Saved guides</li><li>Markdown exports</li><li>Longer thread support</li></ul><button onClick={checkout} className="mt-6 w-full rounded-xl bg-ink px-4 py-3 font-semibold text-white hover:bg-slate-800">Upgrade to Pro</button></div></div>
}
