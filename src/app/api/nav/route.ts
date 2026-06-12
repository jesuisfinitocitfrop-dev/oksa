import { NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'
import { sanitizeNavTabs } from '@/lib/nav'
import { readSiteConfig } from '@/lib/siteConfig'

export const dynamic = 'force-dynamic'

// GET /api/nav — onglets visibles de la navbar (public)
export async function GET() {
  const stored = await readSiteConfig(getServiceClient(), 'nav.json')
  return NextResponse.json({ tabs: sanitizeNavTabs(stored) })
}
