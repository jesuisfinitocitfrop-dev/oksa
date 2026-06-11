import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'
import { DICE_COLORS, MAX_DICE, isDiceColor, type DiceColor } from '@/lib/dice'

export const dynamic = 'force-dynamic'

// GET /api/dice/roll?count=3 — lance les dés côté serveur
// (la config admin reste secrète : le client ne voit que le résultat)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const count = Math.min(MAX_DICE, Math.max(1, Number(searchParams.get('count')) || 3))

  let enabled: DiceColor[] = [...DICE_COLORS]
  let forced: (DiceColor | null)[] = []

  try {
    const db = getServiceClient()
    const { data } = await db.from('dice_config').select('*').eq('id', 1).single()
    if (data) {
      const e = (Array.isArray(data.enabled_colors) ? data.enabled_colors : []).filter(isDiceColor)
      if (e.length > 0) enabled = e
      forced = (Array.isArray(data.forced_colors) ? data.forced_colors : []).map(
        (c: unknown) => (isDiceColor(c) ? c : null)
      )
    }
  } catch {
    // table absente ou Supabase non configuré → tirage 100% aléatoire
  }

  const colors: DiceColor[] = Array.from({ length: count }, (_, i) => {
    const forcedColor = forced[i]
    if (forcedColor) return forcedColor
    return enabled[Math.floor(Math.random() * enabled.length)]
  })

  return NextResponse.json({ colors, possible: enabled })
}
