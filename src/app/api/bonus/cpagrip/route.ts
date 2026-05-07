import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'

const OFFER_CONFIGS: Record<string, { label: string; description: string; icon: string; url: string; sort_order: number }> = {
  cpagrip_smart: {
    label: 'Clique sur le Smart Link',
    description: 'Universel — fonctionne pour tous les pays et devices',
    icon: '🔗',
    url: 'https://getafilenow.com/1894795',
    sort_order: 97,
  },
  cpagrip: {
    label: 'Complète une offre gratuite',
    description: 'Offre adaptée à ton appareil — rapide et gratuit',
    icon: '💰',
    url: 'https://getafilenow.com/1894795',
    sort_order: 98,
  },
}

export async function POST(request: NextRequest) {
  const { entry_id, offer_type = 'cpagrip' } = await request.json()
  if (!entry_id) return NextResponse.json({ error: 'Missing entry_id' }, { status: 400 })

  const config = OFFER_CONFIGS[offer_type]
  if (!config) return NextResponse.json({ error: 'Invalid offer_type' }, { status: 400 })

  const db = getServiceClient()

  const { data: entry } = await db
    .from('entries')
    .select('id, chances, edition_id')
    .eq('id', entry_id)
    .single()

  if (!entry) return NextResponse.json({ error: 'Entry not found' }, { status: 404 })

  let { data: action } = await db
    .from('bonus_actions')
    .select('id, bonus_chances')
    .eq('edition_id', entry.edition_id)
    .eq('action_type', offer_type)
    .eq('is_active', true)
    .maybeSingle()

  if (!action) {
    const { data: created } = await db
      .from('bonus_actions')
      .insert({ edition_id: entry.edition_id, ...config, bonus_chances: 100, action_type: offer_type })
      .select('id, bonus_chances')
      .single()
    action = created
  }

  if (!action) return NextResponse.json({ error: 'Failed to setup action' }, { status: 500 })

  const { data: existing } = await db
    .from('bonus_completions')
    .select('id')
    .eq('entry_id', entry_id)
    .eq('bonus_action_id', action.id)
    .maybeSingle()

  if (existing) return NextResponse.json({ error: 'Already completed', alreadyDone: true }, { status: 409 })

  await db.from('bonus_completions').insert({ entry_id, bonus_action_id: action.id })

  const newChances = entry.chances + action.bonus_chances
  await db.from('entries').update({ chances: newChances }).eq('id', entry_id)

  return NextResponse.json({ success: true, newChances, bonusAdded: action.bonus_chances })
}
