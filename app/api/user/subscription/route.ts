import { NextResponse } from 'next/server'
import { getCurrentUser, getMonthlyUsage, getUserPlan } from '@/lib/usage'

export async function GET() {
  const user = await getCurrentUser()
  const plan = await getUserPlan(user?.id)
  const usage = await getMonthlyUsage(user?.id)
  const limit = plan === 'pro' ? Number(process.env.PRO_MONTHLY_GUIDES || 1000) : Number(process.env.FREE_MONTHLY_GUIDES || 3)
  return NextResponse.json({ plan, usage, limit })
}
