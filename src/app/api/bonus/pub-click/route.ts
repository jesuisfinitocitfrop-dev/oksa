import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'

// POST /api/bonus/pub-click
// body: { entry_id, action_id? }
// Ajoute des chances à chaque clic — pas de contrainte d'unicité, répétable
export async function POST(request: NextRequest) {
  const { entry_id, action_id } = await request.json()
  if (!entry_id) return NextResponse.json({ error: 'Missing entry_id' }, { status: 400 })

  const db = getServiceClient()

  const { data: entry } = await db
    .from('entries')
    .select('id, chances, edition_id')
    .eq('id', entry_id)
    .single()

  if (!entry) return NextResponse.json({ error: 'Entry not found' }, { status: 404 })

  // Récupère le bonus_chances depuis l'action si fournie, sinon fallback 1
  let bonusChances = 1
  if (action_id) {
    const { data: action } = await db
      .from('bonus_actions')
      .select('bonus_chances')
      .eq('id', action_id)
      .maybeSingle()
    if (action) bonusChances = action.bonus_chances
  } else {
    // Action hardcodée pub_click
    const { data: action } = await db
      .from('bonus_actions')
      .select('bonus_chances')
      .eq('edition_id', entry.edition_id)
      .eq('action_type', 'pub_click')
      .eq('is_active', true)
      .maybeSingle()
    if (action) bonusChances = action.bonus_chances
  }

  const newChances = entry.chances + bonusChances
  await db.from('entries').update({ chances: newChances }).eq('id', entry_id)

  return NextResponse.json({ success: true, newChances, bonusAdded: bonusChances })
}
