import { NextRequest, NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { sessionOptions, SessionData } from '@/lib/session'
import { getServiceClient } from '@/lib/supabase'

async function checkAdmin(request: NextRequest) {
  const session = await getIronSession<SessionData>(request, new NextResponse(), sessionOptions)
  return session.isAdmin
}

// GET /api/admin/premium-entries?edition_id=xxx
export async function GET(request: NextRequest) {
  if (!await checkAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const edition_id = searchParams.get('edition_id')
  if (!edition_id) return NextResponse.json({ error: 'edition_id required' }, { status: 400 })

  const db = getServiceClient()
  const { data: entries } = await db
    .from('premium_entries')
    .select('*, subscriptions(tier, amount_eur)')
    .eq('edition_id', edition_id)
    .order('created_at', { ascending: false })

  const all = entries ?? []
  return NextResponse.json({
    entries: all,
    count: all.length,
    total_chances: all.reduce((sum: number, e: any) => sum + (e.chances ?? 1), 0),
  })
}

// POST /api/admin/premium-entries/draw — tirage premium
export async function POST(request: NextRequest) {
  if (!await checkAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { edition_id } = await request.json()
  if (!edition_id) return NextResponse.json({ error: 'edition_id required' }, { status: 400 })

  const db = getServiceClient()

  const { data: edition } = await db
    .from('editions')
    .select('id, is_drawn, is_premium')
    .eq('id', edition_id)
    .single()

  if (!edition) return NextResponse.json({ error: 'Edition not found' }, { status: 404 })
  if (!edition.is_premium) return NextResponse.json({ error: 'Not a premium edition' }, { status: 400 })
  if (edition.is_drawn) return NextResponse.json({ error: 'Already drawn' }, { status: 409 })

  const { data: entries } = await db
    .from('premium_entries')
    .select('id, email, roblox_username, chances')
    .eq('edition_id', edition_id)

  if (!entries || entries.length === 0) {
    return NextResponse.json({ error: 'No entries' }, { status: 400 })
  }

  // Tirage pondéré
  const totalChances = entries.reduce((sum, e) => sum + e.chances, 0)
  let rand = Math.random() * totalChances
  let winner = entries[0]
  for (const entry of entries) {
    rand -= entry.chances
    if (rand <= 0) { winner = entry; break }
  }

  // Enregistrement dans winners
  await db.from('winners').insert({
    edition_id,
    entry_id: winner.id,
    total_chances: totalChances,
  })

  await db.from('editions').update({ is_drawn: true }).eq('id', edition_id)

  return NextResponse.json({ winner, total_chances: totalChances })
}
