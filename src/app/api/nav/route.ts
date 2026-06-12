import { NextResponse } from 'next/server'
import { sanitizeNavTabs } from '@/lib/nav'
import { readSiteConfig } from '@/lib/siteConfig'

export const dynamic = 'force-dynamic'

// GET /api/nav — onglets visibles de la navbar (public)
export async function GET() {
  const stored = await readSiteConfig('nav.json')
  return NextResponse.json({ tabs: sanitizeNavTabs(stored) })
}
