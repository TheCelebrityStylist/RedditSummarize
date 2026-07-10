import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { createSupabaseAdminClient } from '@/lib/supabase'
import type Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const stripe = getStripe()
  const admin = createSupabaseAdminClient()
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!stripe || !admin || !secret) return NextResponse.json({ error: 'Webhook not configured.' }, { status: 503 })
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')
  if (!signature) return NextResponse.json({ error: 'Missing stripe-signature.' }, { status: 400 })

  try {
    const event = stripe.webhooks.constructEvent(body, signature, secret)
    const { data: processed } = await admin.from('webhook_events').select('event_id').eq('event_id', event.id).maybeSingle()
    if (processed) return NextResponse.json({ received: true, duplicate: true })
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.user_id
      if (userId) await admin.from('subscriptions').upsert({ user_id: userId, stripe_customer_id: session.customer, stripe_subscription_id: session.subscription, status: 'pro' })
    }
    if (event.type === 'customer.subscription.created' || event.type === 'customer.subscription.deleted' || event.type === 'customer.subscription.updated') {
      const subscription = event.data.object as Stripe.Subscription
      const status = subscription.status === 'active' || subscription.status === 'trialing' ? 'pro' : subscription.status
      const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id
      await admin.from('subscriptions').update({ status, stripe_subscription_id: subscription.id, stripe_customer_id: customerId, price_id: subscription.items.data[0]?.price.id, current_period_start: subscription.current_period_start ? new Date(subscription.current_period_start * 1000).toISOString() : null, current_period_end: subscription.current_period_end ? new Date(subscription.current_period_end * 1000).toISOString() : null, cancel_at_period_end: subscription.cancel_at_period_end }).eq('stripe_customer_id', customerId)
    }
    if (event.type === 'invoice.payment_succeeded' || event.type === 'invoice.payment_failed') {
      const invoice = event.data.object as Stripe.Invoice
      const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id
      if (customerId) await admin.from('subscriptions').update({ last_payment_status: event.type === 'invoice.payment_succeeded' ? 'paid' : 'failed' }).eq('stripe_customer_id', customerId)
    }
    await admin.from('webhook_events').insert({ event_id: event.id, event_type: event.type })
    return NextResponse.json({ received: true })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Webhook error' }, { status: 400 })
  }
}
