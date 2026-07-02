import { NextResponse } from 'next/server'
import { absoluteUrl } from '@/lib/utils'
import { getStripe } from '@/lib/stripe'
import { getCurrentUser } from '@/lib/usage'

export async function POST() {
  const stripe = getStripe()
  const priceId = process.env.STRIPE_PRO_PRICE_ID
  if (!stripe || !priceId) return NextResponse.json({ error: 'Stripe is not configured.' }, { status: 503 })
  const user = await getCurrentUser()
  if (!user?.email) return NextResponse.json({ error: 'Login required before checkout.' }, { status: 401 })

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer_email: user.email,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: absoluteUrl('/account?checkout=success'),
    cancel_url: absoluteUrl('/pricing?checkout=canceled'),
    metadata: { user_id: user.id }
  })
  return NextResponse.json({ url: session.url })
}
