import { NextRequest, NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { sessionOptions, SessionData } from '@/lib/session'
import { getServiceClient } from '@/lib/supabase'
import { MAX_DICE, isDiceColor } from '@/lib/dice'

async function checkAdmin(request: NextRequest) {
  const session = await getIronSession<SessionData>(request, new NextResponse(), sessionOptions)
  return session.isAdmin
}

// GET /api/admin/dice — config actuelle du Color Dice
export async function GET(request: NextRequest) {
  if (!await checkAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = getServiceClient()
  let { data } = await db.from('dice_config').select('*').eq('id', 1).single()

  if (!data) {
    const { data: created, error } = await db
      .from('dice_config')
      .upsert({ id: 1 })
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    data = created
  }

  return NextResponse.json({ config: data })
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

  const db = getServiceClient()
  const { error } = await db
    .from('dice_config')
    .upsert({ id: 1, enabled_colors, forced_colors, updated_at: new Date().toISOString() })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
