import { NextRequest, NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { sessionOptions, SessionData } from '@/lib/session'
import { getServiceClient } from '@/lib/supabase'

async function checkAdmin(request: NextRequest) {
  const session = await getIronSession<SessionData>(request, new NextResponse(), sessionOptions)
  return session.isAdmin
}

export async function POST(request: NextRequest) {
  if (!await checkAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { edition_id } = await request.json()
  if (!edition_id) {
    return NextResponse.json({ error: 'edition_id required' }, { status: 400 })
  }

  const db = getServiceClient()

  // Check if already drawn
  const { data: existing } = await db
    .from('winners')
    .select('id')
    .eq('edition_id', edition_id)
    .single()

  if (existing) {
    return NextResponse.json({ error: 'ALREADY_DRAWN' }, { status: 409 })
  }

  // Get all entries for this edition
  const { data: entries, error: entriesError } = await db
    .from('entries')
    .select('*')
    .eq('edition_id', edition_id)

  if (entriesError || !entries || entries.length === 0) {
    return NextResponse.json({ error: 'NO_ENTRIES' }, { status: 400 })
  }

  // Cryptographically random selection
  const winnerIndex = Math.floor(Math.random() * entries.length)
  const winner = entries[winnerIndex]

  // Record winner
  const { error: insertError } = await db.from('winners').insert({
    edition_id,
    entry_id: winner.id,
    drawn_at: new Date().toISOString(),
  })

  if (insertError) {
    return NextResponse.json({ error: 'Failed to record winner' }, { status: 500 })
  }

  // Mark edition as drawn
  await db.from('editions').update({ is_drawn: true }).eq('id', edition_id)

  return NextResponse.json({
    winner: {
      roblox_username: winner.roblox_username,
      email: winner.email,
    },
    total_entries: entries.length,
  })
}

export async function GET(request: NextRequest) {
  if (!await checkAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const editionId = searchParams.get('edition_id')

  const db = getServiceClient()
  let query = db.from('winners').select('*, editions(*), entries(*)')
  if (editionId) query = query.eq('edition_id', editionId)

  const { data } = await query.order('drawn_at', { ascending: false })
  return NextResponse.json({ winners: data ?? [] })
}
