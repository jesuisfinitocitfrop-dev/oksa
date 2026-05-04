import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'

// POST /api/bonus/complete
export async function POST(request: NextRequest) {
  const { entry_id, bonus_action_id } = await request.json()

  if (!entry_id || !bonus_action_id) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const db = getServiceClient()

  // Verify action exists and is active
  const { data: action } = await db
    .from('bonus_actions')
    .select('id, bonus_chances, edition_id')
    .eq('id', bonus_action_id)
    .eq('is_active', true)
    .single()

  if (!action) {
    return NextResponse.json({ error: 'Action not found' }, { status: 404 })
  }

  // Verify entry belongs to the same edition
  const { data: entry } = await db
    .from('entries')
    .select('id, chances, edition_id')
    .eq('id', entry_id)
    .single()

  if (!entry || entry.edition_id !== action.edition_id) {
    return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
  }

  // Check if already completed
  const { data: existing } = await db
    .from('bonus_completions')
    .select('id')
    .eq('entry_id', entry_id)
    .eq('bonus_action_id', bonus_action_id)
    .single()

  if (existing) {
    return NextResponse.json({ error: 'Already completed', alreadyDone: true }, { status: 409 })
  }

  // Record completion
  await db.from('bonus_completions').insert({ entry_id, bonus_action_id })

  // Add bonus chances to entry
  const newChances = entry.chances + action.bonus_chances
  await db.from('entries').update({ chances: newChances }).eq('id', entry_id)

  return NextResponse.json({ success: true, newChances, bonusAdded: action.bonus_chances })
}
