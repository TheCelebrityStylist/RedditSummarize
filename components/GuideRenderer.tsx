import type { GuideJson } from '@/lib/types'
import { ActionPlan } from './ActionPlan'
import { BestComments } from './BestComments'
import { ConsensusCard } from './ConsensusCard'
import { FAQSection } from './FAQSection'
import { ProsConsSection } from './ProsConsSection'
import { RecommendationList } from './RecommendationList'
import { ExportButton } from './ExportButton'

export function GuideRenderer({ guide }: { guide: GuideJson }) {
  return (
    <article className="space-y-5">
      <div className="rounded-3xl border border-line bg-white p-6 shadow-soft">
        <div className="mb-3 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wide text-muted">
          <span>r/{guide.overview.subreddit}</span><span>•</span><span>{guide.overview.comments_analyzed} comments analyzed</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight md:text-4xl">{guide.overview.thread_title}</h1>
        <p className="mt-4 text-lg leading-8 text-slate-600">{guide.overview.executive_summary}</p>
        {guide.safety_note && <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">{guide.safety_note}</p>}
        <div className="mt-5 flex flex-wrap gap-2"><ExportButton guide={guide} /></div>
      </div>
      <ConsensusCard consensus={guide.consensus} />
      <RecommendationList items={guide.recommendations} />
      <ProsConsSection pros={guide.pros} cons={guide.cons} />
      <BestComments comments={guide.best_comments} />
      <FAQSection items={guide.faq} />
      <ActionPlan steps={guide.action_plan} />
      <section className="rounded-3xl border border-line bg-white p-6 shadow-soft">
        <h2 className="text-xl font-bold">Contradictions / Disagreements</h2>
        <div className="mt-4 space-y-4">
          {guide.disagreements.map((item, index) => (
            <div key={index} className="rounded-2xl bg-slate-50 p-4">
              <p className="font-semibold">{item.issue}</p>
              <p className="mt-2 text-sm text-slate-600"><b>Side A:</b> {item.side_a}</p>
              <p className="mt-1 text-sm text-slate-600"><b>Side B:</b> {item.side_b}</p>
              <p className="mt-2 text-sm text-ink"><b>Practical read:</b> {item.practical_read}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="rounded-3xl border border-line bg-ink p-6 text-white shadow-soft">
        <h2 className="text-xl font-bold">Final Takeaway</h2>
        <p className="mt-3 leading-7 text-slate-200">{guide.final_takeaway}</p>
      </section>
    </article>
  )
}
