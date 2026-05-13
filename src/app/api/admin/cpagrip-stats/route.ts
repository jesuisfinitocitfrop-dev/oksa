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

  const db = getServiceClient()

  const [
    { data: completions },
    { data: logs },
  ] = await Promise.all([
    db
      .from('cpagrip_completions')
      .select('id, entry_id, offer_id, payout_usd, chances_credited, ip_address, created_at, entries(email, roblox_username)')
      .order('created_at', { ascending: false })
      .limit(200),
    db
      .from('cpagrip_postback_log')
      .select('outcome'),
  ])

  const total_completions = completions?.length ?? 0
  const total_chances_credited = (completions ?? []).reduce((s, c) => s + (c.chances_credited ?? 0), 0)
  const total_revenue_usd = (completions ?? []).reduce((s, c) => s + (Number(c.payout_usd) ?? 0), 0)
  const avg_payout_usd = total_completions > 0 ? total_revenue_usd / total_completions : 0

  const log_outcomes: Record<string, number> = {}
  for (const log of logs ?? []) {
    const o = log.outcome ?? 'unknown'
    log_outcomes[o] = (log_outcomes[o] ?? 0) + 1
  }

  return NextResponse.json({
    total_completions,
    total_chances_credited,
    total_revenue_usd,
    avg_payout_usd,
    completions: completions ?? [],
    log_outcomes,
  })
}
