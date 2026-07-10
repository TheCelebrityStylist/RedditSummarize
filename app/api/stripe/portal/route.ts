import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/usage'
export async function POST() {
  const stripe = getStripe(); const admin = createSupabaseAdminClient(); const user = await getCurrentUser()
  if (!stripe || !admin) return NextResponse.json({ error: 'Billing is not configured.' }, { status: 503 })
  if (!user) return NextResponse.json({ error: 'Sign in to manage billing.' }, { status: 401 })
  const { data } = await admin.from('subscriptions').select('stripe_customer_id').eq('user_id', user.id).maybeSingle()
  if (!data?.stripe_customer_id) return NextResponse.json({ error: 'No billing account found.' }, { status: 404 })
  const session = await stripe.billingPortal.sessions.create({ customer: data.stripe_customer_id, return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/account` })
  return NextResponse.json({ url: session.url })
}
