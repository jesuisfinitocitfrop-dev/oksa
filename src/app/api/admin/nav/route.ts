import { NextRequest, NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { sessionOptions, SessionData } from '@/lib/session'
import { getServiceClient } from '@/lib/supabase'
import { NAV_TAB_KEYS, sanitizeNavTabs } from '@/lib/nav'
import { readSiteConfig, writeSiteConfig } from '@/lib/siteConfig'

async function checkAdmin(request: NextRequest) {
  const session = await getIronSession<SessionData>(request, new NextResponse(), sessionOptions)
  return session.isAdmin
}

// GET /api/admin/nav — config de visibilité des onglets
export async function GET(request: NextRequest) {
  if (!await checkAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const stored = await readSiteConfig('nav.json')
  return NextResponse.json({ tabs: sanitizeNavTabs(stored) })
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

  const error = await writeSiteConfig(getServiceClient(), 'nav.json', visible_tabs)
  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json({ success: true })
}
