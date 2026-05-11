import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'

// GET /api/subscription/status?email=xxx
export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get('email')
  if (!email) return NextResponse.json({ subscription: null })

  const db = getServiceClient()
  const { data } = await db
    .from('subscriptions')
    .select('id, tier, status, giveaways_remaining, bonus_chances')
    .eq('email', email)
    .in('status', ['active'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  return NextResponse.json({ subscription: data ?? null })
}
