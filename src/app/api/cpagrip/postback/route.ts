import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'

const MAX_CHANCES_PER_OFFER = 1000

function isValidUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    request.headers.get('x-real-ip') ??
    null

  let body: Record<string, string> = {}
  try {
    const text = await request.text()
    const params = new URLSearchParams(text)
    body = Object.fromEntries(params.entries())
  } catch {
    return new NextResponse('Bad Request', { status: 400 })
  }

  const db = getServiceClient()
  const { data: logRow } = await db
    .from('cpagrip_postback_log')
    .insert({
      raw_body: JSON.stringify(body),
      password_valid: false,
      outcome: 'pending',
      ip_address: ip,
    })
    .select('id')
    .single()

  const logId: string | null = logRow?.id ?? null

  async function finishLog(outcome: string, errorMsg?: string) {
    if (!logId) return
    await db
      .from('cpagrip_postback_log')
      .update({ outcome, error_message: errorMsg ?? null })
      .eq('id', logId)
  }

  const { password, payout, offer_id, tracking_id } = body

  if (!password || password !== process.env.CPAGRIP_POSTBACK_PASSWORD) {
    await finishLog('rejected', 'invalid password')
    return new NextResponse('OK', { status: 200 })
  }

  await db.from('cpagrip_postback_log').update({ password_valid: true }).eq('id', logId!)

  if (!tracking_id || !isValidUUID(tracking_id)) {
    await finishLog('rejected', `invalid tracking_id: ${tracking_id}`)
    return new NextResponse('OK', { status: 200 })
  }

  if (!offer_id || !payout) {
    await finishLog('rejected', 'missing offer_id or payout')
    return new NextResponse('OK', { status: 200 })
  }

  const payoutNum = parseFloat(payout)
  if (isNaN(payoutNum) || payoutNum <= 0) {
    await finishLog('rejected', `invalid payout: ${payout}`)
    return new NextResponse('OK', { status: 200 })
  }

  const { data: entry } = await db
    .from('entries')
    .select('id, chances, chances_from_cpagrip, edition_id')
    .eq('id', tracking_id)
    .single()

  if (!entry) {
    await finishLog('rejected', `entry not found: ${tracking_id}`)
    return new NextResponse('OK', { status: 200 })
  }

  // Check edition is still open
  const { data: edition } = await db
    .from('editions')
    .select('is_active, is_drawn')
    .eq('id', entry.edition_id)
    .single()

  if (!edition || !edition.is_active || edition.is_drawn) {
    await finishLog('rejected', 'edition closed or already drawn')
    return new NextResponse('OK', { status: 200 })
  }

  // Dedup check
  const { data: existing } = await db
    .from('cpagrip_completions')
    .select('id')
    .eq('entry_id', tracking_id)
    .eq('offer_id', offer_id)
    .maybeSingle()

  if (existing) {
    await finishLog('duplicate')
    return new NextResponse('OK', { status: 200 })
  }

  const rawChances = Math.round(payoutNum * 100)
  const chancesCredited = Math.min(rawChances, MAX_CHANCES_PER_OFFER)

  try {
    await db.from('cpagrip_completions').insert({
      entry_id: tracking_id,
      offer_id,
      payout_usd: payoutNum,
      chances_credited: chancesCredited,
      tracking_id_received: tracking_id,
      raw_postback: body,
      ip_address: ip,
    })

    await db
      .from('entries')
      .update({
        chances: (entry.chances ?? 0) + chancesCredited,
        chances_from_cpagrip: (entry.chances_from_cpagrip ?? 0) + chancesCredited,
      })
      .eq('id', tracking_id)

    await finishLog('credited')
    return new NextResponse('OK', { status: 200 })
  } catch (e) {
    await finishLog('error', String(e))
    return new NextResponse('OK', { status: 200 })
  }
}
