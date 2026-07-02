import Link from 'next/link'
import { UrlInput } from '@/components/UrlInput'
import { UsageLimitBanner } from '@/components/UsageLimitBanner'

export default function DashboardPage() {
  return <main className="mx-auto max-w-5xl px-5 py-8"><header className="mb-8 flex items-center justify-between"><Link href="/" className="text-xl font-black">ThreadGuide</Link><nav className="flex gap-4 text-sm font-medium"><Link href="/saved">Saved</Link><Link href="/account">Account</Link></nav></header><section className="rounded-3xl border border-line bg-white p-6 shadow-soft"><h1 className="text-3xl font-black">Generate a guide</h1><p className="mt-2 text-slate-600">Paste a Reddit thread and ThreadGuide will extract the consensus and next steps.</p><div className="mt-6"><UrlInput compact /></div></section><div className="mt-5"><UsageLimitBanner /></div></main>
}
