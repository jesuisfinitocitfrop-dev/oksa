import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'

const OFFERWALL_ID = process.env.CPAGRIP_OFFERWALL_ID ?? '1894841'
const COOLDOWN_MAX_STARTS = 5
const COOLDOWN_WINDOW_MS = 60 * 60 * 1000 // 1 hour

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const entry_id = searchParams.get('entry_id')

  if (!entry_id) {
    return NextResponse.json({ error: 'entry_id required' }, { status: 400 })
  }

  const db = getServiceClient()

  const { data: entry } = await db
    .from('entries')
    .select('id, edition_id')
    .eq('id', entry_id)
    .single()

  if (!entry) {
    return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
  }

  // Check edition is still open
  const { data: edition } = await db
    .from('editions')
    .select('is_active, is_drawn')
    .eq('id', entry.edition_id)
    .single()

  if (!edition || !edition.is_active || edition.is_drawn) {
    return NextResponse.json({ error: 'Edition closed' }, { status: 403 })
  }

  // Anti-fraud: cooldown — max COOLDOWN_MAX_STARTS per hour
  const since = new Date(Date.now() - COOLDOWN_WINDOW_MS).toISOString()
  const { count } = await db
    .from('cpagrip_starts')
    .select('id', { count: 'exact', head: true })
    .eq('entry_id', entry_id)
    .gte('started_at', since)

  if ((count ?? 0) >= COOLDOWN_MAX_STARTS) {
    return NextResponse.json({ error: 'cooldown', cooldown: true }, { status: 429 })
  }

  // Log this start
  await db.from('cpagrip_starts').insert({ entry_id })

  const url = `https://getafilenow.com/script_include.php?id=${OFFERWALL_ID}&tracking_id=${entry_id}`
  return NextResponse.json({ url })
}
