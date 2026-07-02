import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { createSupabaseAdminClient } from '@/lib/supabase'

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
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any
      const userId = session.metadata?.user_id
      if (userId) await admin.from('subscriptions').upsert({ user_id: userId, stripe_customer_id: session.customer, stripe_subscription_id: session.subscription, status: 'pro' })
    }
    if (event.type === 'customer.subscription.deleted' || event.type === 'customer.subscription.updated') {
      const subscription = event.data.object as any
      const status = subscription.status === 'active' || subscription.status === 'trialing' ? 'pro' : subscription.status
      await admin.from('subscriptions').update({ status, current_period_end: subscription.current_period_end ? new Date(subscription.current_period_end * 1000).toISOString() : null }).eq('stripe_subscription_id', subscription.id)
    }
    return NextResponse.json({ received: true })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Webhook error' }, { status: 400 })
  }
}
