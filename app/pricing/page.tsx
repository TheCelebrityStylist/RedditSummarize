import Link from 'next/link'
import { PricingCards } from '@/components/PricingCards'

export default function PricingPage() { return <main className="mx-auto max-w-5xl px-5 py-10"><Link href="/" className="text-xl font-black">ThreadGuide</Link><section className="py-16 text-center"><h1 className="text-4xl font-black">Pricing built for Reddit research</h1><p className="mx-auto mt-4 max-w-2xl text-slate-600">Start free. Upgrade when ThreadGuide becomes part of your buying, travel, fitness, finance, or research workflow.</p></section><PricingCards /></main> }
