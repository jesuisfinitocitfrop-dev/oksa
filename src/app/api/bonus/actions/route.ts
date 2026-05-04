import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'

// GET /api/bonus/actions?edition_id=xxx&entry_id=yyy
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const edition_id = searchParams.get('edition_id')
  const entry_id = searchParams.get('entry_id')

  if (!edition_id) {
    return NextResponse.json({ error: 'edition_id required' }, { status: 400 })
  }

  const db = getServiceClient()

  const { data: actions } = await db
    .from('bonus_actions')
    .select('*')
    .eq('edition_id', edition_id)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  let completedIds: string[] = []
  if (entry_id) {
    const { data: completions } = await db
      .from('bonus_completions')
      .select('bonus_action_id')
      .eq('entry_id', entry_id)
    completedIds = (completions ?? []).map((c: any) => c.bonus_action_id)
  }

  let totalPaid = 0
  let totalChances = 2
  if (entry_id) {
    const { data: entry } = await db
      .from('entries')
      .select('chances')
      .eq('id', entry_id)
      .single()
    if (entry) totalChances = entry.chances

    const { data: payments } = await db
      .from('payments')
      .select('amount_eur')
      .eq('entry_id', entry_id)
      .eq('status', 'completed')
    totalPaid = (payments ?? []).reduce((s: number, p: any) => s + p.amount_eur, 0)
  }

  return NextResponse.json({
    actions: actions ?? [],
    completedIds,
    totalChances,
    totalPaid,
  })
}
