import { NextRequest, NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { sessionOptions, SessionData } from '@/lib/session'
import { getServiceClient } from '@/lib/supabase'

async function checkAdmin(request: NextRequest) {
  const session = await getIronSession<SessionData>(request, new NextResponse(), sessionOptions)
  return session.isAdmin
}

export async function GET(request: NextRequest) {
  if (!await checkAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const edition_id = searchParams.get('edition_id')

  if (!edition_id) {
    return NextResponse.json({ error: 'Missing edition_id' }, { status: 400 })
  }

  const db = getServiceClient()

  const [
    { count: participants },
    { count: youtubeCount },
    { count: discordCount },
    { count: pubCount },
    { count: pubClickCount },
    { data: paymentsData, count: boostsCount },
  ] = await Promise.all([
    db.from('entries')
      .select('*', { count: 'exact', head: true })
      .eq('edition_id', edition_id),

    db.from('bonus_completions')
      .select('id, bonus_actions!inner(action_type, edition_id)', { count: 'exact', head: true })
      .eq('bonus_actions.action_type', 'youtube')
      .eq('bonus_actions.edition_id', edition_id),

    db.from('bonus_completions')
      .select('id, bonus_actions!inner(action_type, edition_id)', { count: 'exact', head: true })
      .eq('bonus_actions.action_type', 'discord')
      .eq('bonus_actions.edition_id', edition_id),

    db.from('bonus_completions')
      .select('id, bonus_actions!inner(action_type, edition_id)', { count: 'exact', head: true })
      .eq('bonus_actions.action_type', 'pub')
      .eq('bonus_actions.edition_id', edition_id),

    db.from('bonus_completions')
      .select('id, bonus_actions!inner(action_type, edition_id)', { count: 'exact', head: true })
      .eq('bonus_actions.action_type', 'pub_click')
      .eq('bonus_actions.edition_id', edition_id),

    db.from('payments')
      .select('amount_eur', { count: 'exact' })
      .eq('edition_id', edition_id)
      .eq('status', 'completed'),
  ])

  const boostsTotal = (paymentsData ?? []).reduce((sum, p) => sum + (p.amount_eur ?? 0), 0)

  return NextResponse.json({
    participants: participants ?? 0,
    youtube: youtubeCount ?? 0,
    discord: discordCount ?? 0,
    pub: pubCount ?? 0,
    pub_click: pubClickCount ?? 0,
    boosts_count: boostsCount ?? 0,
    boosts_total: boostsTotal,
  })
}
