import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const edition_id = searchParams.get('edition_id')

  if (!edition_id) {
    return NextResponse.json({ supporters: [] })
  }

  const db = getServiceClient()

  const { data } = await db
    .from('payments')
    .select('amount_eur, entries(roblox_username)')
    .eq('edition_id', edition_id)
    .eq('status', 'completed')

  if (!data) return NextResponse.json({ supporters: [] })

  const map: Record<string, { roblox_username: string; total: number; count: number }> = {}
  for (const p of data) {
    const username = (p.entries as any)?.roblox_username
    if (!username) continue
    if (!map[username]) map[username] = { roblox_username: username, total: 0, count: 0 }
    map[username].total += p.amount_eur ?? 0
    map[username].count += 1
  }

  const supporters = Object.values(map).sort((a, b) => b.total - a.total)

  return NextResponse.json({ supporters })
}
