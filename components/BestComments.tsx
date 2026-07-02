import type { GuideJson } from '@/lib/types'

export function BestComments({ comments }: { comments: GuideJson['best_comments'] }) {
  return <section className="rounded-3xl border border-line bg-white p-6 shadow-soft"><h2 className="text-xl font-bold">Best Comments</h2><div className="mt-4 grid gap-3">{comments.map((comment, index) => <div key={index} className="rounded-2xl border border-line p-4"><p className="text-sm leading-6 text-slate-700">{comment.summary}</p><div className="mt-3 flex flex-wrap gap-2 text-xs font-medium text-muted"><span>{comment.score ?? 0} upvotes</span><span>•</span><span>{comment.why_useful}</span></div></div>)}</div></section>
}
