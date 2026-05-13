import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const entry_id = searchParams.get('entry_id')

  if (!entry_id) {
    return NextResponse.json({ error: 'entry_id required' }, { status: 400 })
  }

  const db = getServiceClient()

  const { data: entry } = await db
    .from('entries')
    .select('id, chances, chances_from_cpagrip, edition_id')
    .eq('id', entry_id)
    .single()

  if (!entry) {
    return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
  }

  const [
    { data: completions },
    { data: payments },
    { data: bonusCompletions },
    { data: bonusActions },
  ] = await Promise.all([
    db
      .from('cpagrip_completions')
      .select('offer_id, chances_credited, created_at')
      .eq('entry_id', entry_id)
      .order('created_at', { ascending: false }),
    db
      .from('payments')
      .select('amount_eur, chances_added')
      .eq('entry_id', entry_id)
      .eq('status', 'completed'),
    db
      .from('bonus_completions')
      .select('bonus_action_id, bonus_actions(action_type, bonus_chances, label)')
      .eq('entry_id', entry_id),
    db
      .from('bonus_actions')
      .select('id, action_type, bonus_chances, label')
      .eq('edition_id', entry.edition_id)
      .eq('is_active', true),
  ])

  const totalPaid = (payments ?? []).reduce((s, p) => s + (p.amount_eur ?? 0), 0)
  const totalPaymentChances = (payments ?? []).reduce((s, p) => s + (p.chances_added ?? 0), 0)

  const completedActionIds = (bonusCompletions ?? []).map((c: any) => c.bonus_action_id)
  const completedActions = (bonusCompletions ?? []).map((c: any) => ({
    action_type: c.bonus_actions?.action_type,
    bonus_chances: c.bonus_actions?.bonus_chances,
    label: c.bonus_actions?.label,
  }))

  const discordChances = completedActions
    .filter(a => a.action_type === 'discord')
    .reduce((s, a) => s + (a.bonus_chances ?? 0), 0)

  const youtubeChances = completedActions
    .filter(a => a.action_type === 'youtube')
    .reduce((s, a) => s + (a.bonus_chances ?? 0), 0)

  // Cooldown check — can start another offer wall session?
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const { count: recentStarts } = await db
    .from('cpagrip_starts')
    .select('id', { count: 'exact', head: true })
    .eq('entry_id', entry_id)
    .gte('started_at', since)

  return NextResponse.json({
    total_chances: entry.chances ?? 0,
    bonus_breakdown: {
      discord: discordChances,
      youtube: youtubeChances,
      cpagrip_completions: completions ?? [],
      cpagrip_total: entry.chances_from_cpagrip ?? 0,
      stripe_total: totalPaymentChances,
    },
    cpagrip_can_start: (recentStarts ?? 0) < 5,
    total_paid_eur: totalPaid,
    completed_action_ids: completedActionIds,
    active_actions: bonusActions ?? [],
  })
}
