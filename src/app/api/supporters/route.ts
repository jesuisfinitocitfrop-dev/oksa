import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'

// GET /api/supporters?edition_id=xxx
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const edition_id = searchParams.get('edition_id')

  if (!edition_id) {
    return NextResponse.json({ error: 'edition_id required' }, { status: 400 })
  }

  const db = getServiceClient()
  const { data } = await db
    .from('payments')
    .select('amount_eur, entries(roblox_username)')
    .eq('edition_id', edition_id)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(20)

  const supporters = (data ?? []).map((p: any) => ({
    roblox_username: p.entries?.roblox_username ?? '???',
    amount_eur: p.amount_eur,
  }))

  return NextResponse.json({ supporters })
}
