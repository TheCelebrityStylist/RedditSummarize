'use client'
import { useState } from 'react'

export function SaveGuideButton({ guideId }: { guideId: string }) {
  const [label, setLabel] = useState('Save guide')
  async function save() {
    setLabel('Saving...')
    const response = await fetch(`/api/guides/${guideId}/save`, { method: 'POST' })
    setLabel(response.ok ? 'Saved' : 'Login to save')
  }
  return <button onClick={save} className="rounded-xl border border-line px-4 py-2 text-sm font-semibold hover:bg-slate-50">{label}</button>
}
