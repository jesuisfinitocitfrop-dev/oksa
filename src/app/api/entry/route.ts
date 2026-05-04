import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'

// GET /api/entry?entry_id=xxx — récupère le referral_token d'une entrée existante
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const entry_id = searchParams.get('entry_id')

  if (!entry_id) {
    return NextResponse.json({ error: 'entry_id required' }, { status: 400 })
  }

  const db = getServiceClient()
  const { data } = await db
    .from('entries')
    .select('id, referral_token, chances, edition_id')
    .eq('id', entry_id)
    .single()

  if (!data) {
    return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
  }

  return NextResponse.json({
    entry_id: data.id,
    referral_token: data.referral_token ?? '',
    chances: data.chances ?? 2,
    edition_id: data.edition_id,
  })
}
