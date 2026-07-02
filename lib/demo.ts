import type { CleanThread, GuideJson } from './types'

export const mockThread: CleanThread = {
  post: {
    title: 'First solo trip to Japan — Tokyo, Kyoto, Osaka route advice?',
    body: 'I have 12 days and want a realistic route without rushing. I care about food, temples, record stores, and public transport.',
    subreddit: 'solotravel',
    author: 'demo_user',
    score: 842,
    commentCount: 397,
    createdUtc: 1735689600,
    permalink: 'https://www.reddit.com/r/solotravel/comments/demo/threadguide_demo/',
    url: 'https://www.reddit.com/r/solotravel/comments/demo/threadguide_demo/'
  },
  comments: [
    { id: '1', body: 'Do not split Tokyo into too few nights. Jet lag and transit make the first day slower than expected.', score: 512, depth: 0 },
    { id: '2', body: 'Kyoto needs at least three full days if temples and neighborhoods matter. Stay near a subway or Keihan line.', score: 431, depth: 0 },
    { id: '3', body: 'Skip a JR Pass unless you calculate the exact trains. It is no longer automatically worth it.', score: 388, depth: 1 },
    { id: '4', body: 'Pack light. Coin lockers are useful but not something you want to rely on every travel day.', score: 155, depth: 2 }
  ],
  analyzedCount: 4,
  truncated: false
}

export const mockGuide: GuideJson = {
  overview: {
    thread_title: mockThread.post.title,
    subreddit: mockThread.post.subreddit,
    comments_analyzed: 4,
    main_question: 'How to structure a 12-day solo Japan route without making it too rushed.',
    executive_summary: 'The thread strongly favors a simple Tokyo–Kyoto–Osaka route with enough time in Kyoto, no automatic JR Pass purchase, and lighter packing to reduce transit friction.',
    source_url: mockThread.post.url
  },
  consensus: {
    summary: 'Most helpful commenters agree that the route is realistic if the traveler avoids adding too many extra cities and gives Kyoto several full days.',
    confidence: 'High',
    is_divided: false
  },
  recommendations: [
    { title: 'Keep the route simple', why_it_matters: 'Tokyo, Kyoto, and Osaka already fill 12 days well, especially with day trips.', caveats: 'Add only one optional side trip after the core route is locked.' },
    { title: 'Calculate rail costs before buying a pass', why_it_matters: 'The JR Pass is often not worth it after price increases.', caveats: 'Regional passes may still help depending on exact day trips.' }
  ],
  pros: [
    { title: 'Low-friction itinerary', detail: 'The main route is connected by frequent trains and easy for a first-time solo traveler.' }
  ],
  cons: [
    { title: 'Risk of overplanning', detail: 'Too many temples, day trips, or hotel changes can make the trip feel rushed.' }
  ],
  best_comments: [
    { summary: 'A high-scoring commenter warned that jet lag makes the first Tokyo day slower than expected.', score: 512, why_useful: 'It changes how the first two days should be planned.' },
    { summary: 'Another commenter noted that Kyoto needs at least three full days for temples and neighborhoods.', score: 431, why_useful: 'It helps allocate nights realistically.' }
  ],
  faq: [
    { question: 'Should I buy a JR Pass?', answer: 'Not automatically. Calculate your exact long-distance trains first.' },
    { question: 'How many days should Kyoto get?', answer: 'At least three full days if temples, Gion, Arashiyama, and food are priorities.' }
  ],
  action_plan: [
    { step: 1, title: 'Lock the core route', detail: 'Choose Tokyo, Kyoto, and Osaka first before adding optional side trips.' },
    { step: 2, title: 'Calculate transport', detail: 'Compare individual Shinkansen tickets against any pass options.' },
    { step: 3, title: 'Book well-located stays', detail: 'Prioritize stations and neighborhoods over slightly cheaper remote hotels.' }
  ],
  disagreements: [
    { issue: 'Whether Osaka needs multiple nights', side_a: 'Some see Osaka as a great food and nightlife base.', side_b: 'Others prefer more Kyoto time and treating Osaka as a day/evening trip.', practical_read: 'Stay in Osaka if nightlife matters; otherwise bias toward Kyoto.' }
  ],
  final_takeaway: 'Build the trip around fewer hotel moves, enough Kyoto time, and calculated train costs rather than trying to see every famous city.'
}
