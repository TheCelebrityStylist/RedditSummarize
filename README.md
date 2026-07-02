# ThreadGuide

ThreadGuide is a Vercel-ready MVP that turns a Reddit thread URL into a structured, practical decision guide. It extracts the thread title, subreddit, post body, comments, comment scores, and repeated advice patterns, then generates a polished guide with consensus, recommendations, pros, cons, best comments, FAQ, disagreements, and a step-by-step action plan.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase auth, database, saved guides, and usage history
- Reddit JSON endpoint ingestion, with room for OAuth Reddit API expansion
- OpenAI for structured JSON summarization
- Stripe Checkout for Pro subscriptions
- Vercel-ready deployment

## MVP features

- Landing page with Reddit URL input, use cases, before/after section, pricing preview, FAQ, and CTAs
- Dashboard generation flow
- Reddit URL validation for reddit.com, www.reddit.com, old.reddit.com, and m.reddit.com links
- Reddit post/comment ingestion through `.json` endpoint
- Deleted, removed, very short, and obvious bot comments filtered out
- Comment ranking by score, length, reply depth, and keyword relevance
- Structured LLM output rendered from JSON, not a plain text blob
- Guide sections: overview, consensus, recommendations, pros, cons, best comments, FAQ, action plan, disagreements, final takeaway
- Copy and markdown export
- Saved guides table and history endpoints
- Email/password and magic link auth via Supabase
- Free usage limit: 3 guides/month
- Pro plan: $8/month via Stripe Checkout
- Stripe webhook updates subscription status
- Demo/mock mode when API keys are missing

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Copy the environment file:

```bash
cp .env.example .env.local
```

3. Add environment variables as needed:

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_key
OPENAI_MODEL=gpt-4o-mini
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
STRIPE_PRO_PRICE_ID=your_monthly_price_id
FREE_MONTHLY_GUIDES=3
PRO_MONTHLY_GUIDES=1000
```

4. Run the Supabase SQL schema:

Open Supabase SQL editor and run:

```sql
-- see supabase/schema.sql
```

5. Start the app:

```bash
npm run dev
```

Visit `http://localhost:3000`.

## Demo mode

If `OPENAI_API_KEY` is missing, ThreadGuide returns a polished mock guide.

If Supabase is missing, auth, persistence, saved guides, and usage history gracefully degrade. The app still lets you test the core UI and guide rendering flow.

## Stripe webhook setup

In Stripe Dashboard:

1. Create a monthly recurring price for `$8/month`.
2. Add the price ID to `STRIPE_PRO_PRICE_ID`.
3. Create a webhook endpoint:

```text
https://your-domain.com/api/stripe/webhook
```

4. Listen for:

```text
checkout.session.completed
customer.subscription.updated
customer.subscription.deleted
```

5. Copy the signing secret into `STRIPE_WEBHOOK_SECRET`.

For local testing:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## Vercel deployment

1. Push this project to GitHub.
2. Import the repo in Vercel.
3. Add all production environment variables.
4. Set `NEXT_PUBLIC_APP_URL` to the deployed Vercel URL or custom domain.
5. Deploy.
6. Update Stripe webhook URL to the production domain.

## Important implementation notes

- Sensitive calls are server-side only.
- OpenAI, Supabase service role, Reddit credentials, and Stripe secrets are not exposed to the client.
- LLM prompts require structured JSON output.
- Long Reddit comments are paraphrased and not reproduced verbatim.
- Skincare, fitness, financial, legal, and similar threads receive a light safety note.
- The MVP prioritizes a working product over over-engineering. For production scale, add Redis-backed rate limiting, background jobs, streaming progress, and full Reddit OAuth ingestion.

## API routes

- `POST /api/generate-guide`
- `GET /api/guides`
- `GET /api/guides/[id]`
- `POST /api/guides/[id]/save`
- `POST /api/stripe/checkout`
- `POST /api/stripe/webhook`
- `GET /api/user/subscription`
