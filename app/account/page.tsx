import Link from 'next/link'

export default function AccountPage() { return <main className="mx-auto max-w-3xl px-5 py-10"><Link href="/dashboard" className="text-sm font-semibold text-muted">← Dashboard</Link><section className="mt-6 rounded-3xl border border-line bg-white p-6 shadow-soft"><h1 className="text-3xl font-black">Account</h1><p className="mt-3 text-slate-600">Manage subscription status, usage, and saved guide preferences. Supabase and Stripe status will appear here after keys are configured.</p></section></main> }
