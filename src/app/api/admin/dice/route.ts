import { NextRequest, NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { sessionOptions, SessionData } from '@/lib/session'
import { getServiceClient } from '@/lib/supabase'
import { DICE_COLORS, MAX_DICE, isDiceColor } from '@/lib/dice'
import { readSiteConfig, writeSiteConfig } from '@/lib/siteConfig'

async function checkAdmin(request: NextRequest) {
  const session = await getIronSession<SessionData>(request, new NextResponse(), sessionOptions)
  return session.isAdmin
}

const DEFAULT_CONFIG = {
  enabled_colors: [...DICE_COLORS],
  forced_colors: Array(MAX_DICE).fill(null),
}

// GET /api/admin/dice — config actuelle du Color Dice
export async function GET(request: NextRequest) {
  if (!await checkAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const stored = await readSiteConfig<typeof DEFAULT_CONFIG>('dice.json')
  return NextResponse.json({ config: stored ?? DEFAULT_CONFIG })
}

// PUT /api/admin/dice — met à jour couleurs autorisées / forcées
export async function PUT(request: NextRequest) {
  if (!await checkAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()

  const enabled_colors = (Array.isArray(body.enabled_colors) ? body.enabled_colors : []).filter(isDiceColor)
  if (enabled_colors.length === 0) {
    return NextResponse.json({ error: 'Au moins une couleur doit être activée' }, { status: 400 })
  }

  const forced_colors = Array.from({ length: MAX_DICE }, (_, i) => {
    const c = Array.isArray(body.forced_colors) ? body.forced_colors[i] : null
    return isDiceColor(c) ? c : null
  })

  const error = await writeSiteConfig(getServiceClient(), 'dice.json', { enabled_colors, forced_colors })
  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json({ success: true })
}
