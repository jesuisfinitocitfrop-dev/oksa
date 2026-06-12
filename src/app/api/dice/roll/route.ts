import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'
import { DICE_COLORS, MAX_DICE, isDiceColor, type DiceColor } from '@/lib/dice'
import { readSiteConfig } from '@/lib/siteConfig'

export const dynamic = 'force-dynamic'

// GET /api/dice/roll?count=3 — lance les dés côté serveur
// (la config admin reste secrète : le client ne voit que le résultat)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const count = Math.min(MAX_DICE, Math.max(1, Number(searchParams.get('count')) || 3))

  let enabled: DiceColor[] = [...DICE_COLORS]
  let forced: (DiceColor | null)[] = []

  const config = await readSiteConfig<{ enabled_colors?: unknown; forced_colors?: unknown }>(
    getServiceClient(),
    'dice.json'
  )
  if (config) {
    const e = (Array.isArray(config.enabled_colors) ? config.enabled_colors : []).filter(isDiceColor)
    if (e.length > 0) enabled = e
    forced = (Array.isArray(config.forced_colors) ? config.forced_colors : []).map(
      (c: unknown) => (isDiceColor(c) ? c : null)
    )
  }

  const colors: DiceColor[] = Array.from({ length: count }, (_, i) => {
    const forcedColor = forced[i]
    if (forcedColor) return forcedColor
    return enabled[Math.floor(Math.random() * enabled.length)]
  })

  return NextResponse.json({ colors, possible: enabled })
}
