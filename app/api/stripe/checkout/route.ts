import { NextResponse } from 'next/server'
import { absoluteUrl } from '@/lib/utils'
import { getStripe } from '@/lib/stripe'
import { getCurrentUser } from '@/lib/usage'
import { createSupabaseAdminClient } from '@/lib/supabase'

export async function POST() {
  const stripe = getStripe()
  const priceId = process.env.STRIPE_PRO_PRICE_ID
  if (!stripe || !priceId) return NextResponse.json({ error: 'Stripe is not configured.' }, { status: 503 })
  const user = await getCurrentUser()
  if (!user?.email) return NextResponse.json({ error: 'Login required before checkout.' }, { status: 401 })

  const admin = createSupabaseAdminClient()
  const { data: subscription } = admin ? await admin.from('subscriptions').select('stripe_customer_id').eq('user_id', user.id).maybeSingle() : { data: null }
  let customerId = subscription?.stripe_customer_id as string | undefined
  if (!customerId) {
    const customer = await stripe.customers.create({ email: user.email, metadata: { user_id: user.id } })
    customerId = customer.id
    if (admin) await admin.from('subscriptions').upsert({ user_id: user.id, stripe_customer_id: customerId, status: 'free' })
  }
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: absoluteUrl('/billing/success?session_id={CHECKOUT_SESSION_ID}'),
    cancel_url: absoluteUrl('/billing/cancelled'),
    metadata: { user_id: user.id }
  })
  return NextResponse.json({ url: session.url })
}
