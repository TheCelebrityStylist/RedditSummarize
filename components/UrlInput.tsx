'use client'

import { useState } from 'react'
import { ArrowRight, Sparkles } from 'lucide-react'

export function UrlInput({ compact = false }: { compact?: boolean }) {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit(inputUrl = url) {
    setError('')
    setLoading(true)
    try {
      const response = await fetch('/api/generate-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ redditUrl: inputUrl })
      })
      const json = await response.json()
      if (!response.ok) throw new Error(json.error || 'Could not generate guide')
      window.location.href = `/guides/${json.id}`
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  async function demo() {
    const demoUrl = 'https://www.reddit.com/r/solotravel/comments/demo/threadguide_demo/'
    setUrl(demoUrl)
    await submit(demoUrl)
  }

  return (
    <div className="w-full">
      <div className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-2 shadow-soft md:flex-row">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="Paste a Reddit thread URL..."
          className="min-h-12 flex-1 rounded-xl px-4 text-base outline-none placeholder:text-slate-400"
        />
        <button
          onClick={() => submit()}
          disabled={loading}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-ink px-5 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Generating...' : 'Generate guide'} <ArrowRight className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        {!compact && (
          <button onClick={demo} className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-ink">
            <Sparkles className="h-4 w-4" /> Try the demo thread
          </button>
        )}
        {error && <p className="text-sm font-medium text-red-600">{error}</p>}
      </div>
    </div>
  )
}
