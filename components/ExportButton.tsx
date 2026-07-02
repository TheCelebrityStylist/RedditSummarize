'use client'
import type { GuideJson } from '@/lib/types'

function toMarkdown(guide: GuideJson) {
  const lines = [`# ${guide.overview.thread_title}`, '', `**Subreddit:** r/${guide.overview.subreddit}`, `**Comments analyzed:** ${guide.overview.comments_analyzed}`, '', `## Executive Summary`, guide.overview.executive_summary, '', `## Consensus`, `${guide.consensus.summary} (${guide.consensus.confidence} confidence)`, '', `## Key Recommendations`]
  guide.recommendations.forEach((item, index) => lines.push(`${index + 1}. **${item.title}** — ${item.why_it_matters}${item.caveats ? ` Caveat: ${item.caveats}` : ''}`))
  lines.push('', '## Pros')
  guide.pros.forEach((item) => lines.push(`- **${item.title}:** ${item.detail}`))
  lines.push('', '## Cons / Risks')
  guide.cons.forEach((item) => lines.push(`- **${item.title}:** ${item.detail}`))
  lines.push('', '## FAQ')
  guide.faq.forEach((item) => lines.push(`- **${item.question}** ${item.answer}`))
  lines.push('', '## Action Plan')
  guide.action_plan.forEach((item) => lines.push(`${item.step}. **${item.title}** — ${item.detail}`))
  lines.push('', '## Final Takeaway', guide.final_takeaway)
  return lines.join('\n')
}

export function ExportButton({ guide }: { guide: GuideJson }) {
  function copy() { navigator.clipboard.writeText(toMarkdown(guide)) }
  function download() {
    const blob = new Blob([toMarkdown(guide)], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'threadguide.md'
    a.click()
    URL.revokeObjectURL(url)
  }
  return <><button onClick={copy} className="rounded-xl border border-line px-4 py-2 text-sm font-semibold hover:bg-slate-50">Copy markdown</button><button onClick={download} className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white hover:opacity-90">Export markdown</button></>
}
