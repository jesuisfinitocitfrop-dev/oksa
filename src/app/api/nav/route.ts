import { NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'
import { FALLBACK_NAV_TABS, sanitizeNavTabs } from '@/lib/nav'

export const dynamic = 'force-dynamic'

// GET /api/nav — onglets visibles de la navbar (public)
export async function GET() {
  let tabs = { ...FALLBACK_NAV_TABS }

  try {
    const db = getServiceClient()
    const { data } = await db.from('nav_settings').select('visible_tabs').eq('id', 1).single()
    if (data) tabs = sanitizeNavTabs(data.visible_tabs)
  } catch {
    // table absente ou Supabase non configuré → tous les onglets visibles
  }

  return NextResponse.json({ tabs })
}
