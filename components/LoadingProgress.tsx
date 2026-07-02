'use client'

import { useEffect, useState } from 'react'

const steps = ['Fetching Reddit thread', 'Reading comments', 'Finding consensus', 'Building action plan']

export function LoadingProgress({ active }: { active?: boolean }) {
  const [index, setIndex] = useState(0)
  useEffect(() => {
    if (!active) return
    const timer = setInterval(() => setIndex((current) => Math.min(current + 1, steps.length - 1)), 1200)
    return () => clearInterval(timer)
  }, [active])

  if (!active) return null
  return (
    <div className="rounded-2xl border border-line bg-white p-4 shadow-soft">
      <p className="text-sm font-semibold text-ink">{steps[index]}</p>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${((index + 1) / steps.length) * 100}%` }} />
      </div>
    </div>
  )
}
