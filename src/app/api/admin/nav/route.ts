import { NextRequest, NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { sessionOptions, SessionData } from '@/lib/session'
import { getServiceClient } from '@/lib/supabase'
import { NAV_TAB_KEYS, sanitizeNavTabs } from '@/lib/nav'

async function checkAdmin(request: NextRequest) {
  const session = await getIronSession<SessionData>(request, new NextResponse(), sessionOptions)
  return session.isAdmin
}

// GET /api/admin/nav — config de visibilité des onglets
export async function GET(request: NextRequest) {
  if (!await checkAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = getServiceClient()
  let { data } = await db.from('nav_settings').select('*').eq('id', 1).single()

  if (!data) {
    const { data: created, error } = await db
      .from('nav_settings')
      .upsert({ id: 1 })
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    data = created
  }

  return NextResponse.json({ tabs: sanitizeNavTabs(data.visible_tabs) })
}

// PUT /api/admin/nav — met à jour la visibilité des onglets
export async function PUT(request: NextRequest) {
  if (!await checkAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  if (!body.tabs || typeof body.tabs !== 'object') {
    return NextResponse.json({ error: 'tabs required' }, { status: 400 })
  }

  const visible_tabs = Object.fromEntries(
    NAV_TAB_KEYS.map(key => [key, body.tabs[key] !== false])
  )

  const db = getServiceClient()
  const { error } = await db
    .from('nav_settings')
    .upsert({ id: 1, visible_tabs, updated_at: new Date().toISOString() })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
