import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'

// POST /api/premium/enter
// body: { email, roblox_username, edition_id, subscription_id }
export async function POST(request: NextRequest) {
  const { email, roblox_username, edition_id, subscription_id } = await request.json()

  if (!email || !roblox_username || !edition_id || !subscription_id) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const db = getServiceClient()

  // Verify subscription is active and belongs to this email
  const { data: sub } = await db
    .from('subscriptions')
    .select('id, tier, status, giveaways_remaining, bonus_chances, email')
    .eq('id', subscription_id)
    .maybeSingle()

  if (!sub || sub.status !== 'active') {
    return NextResponse.json({ error: 'SUBSCRIPTION_NOT_FOUND' }, { status: 404 })
  }

  if (sub.email !== email) {
    return NextResponse.json({ error: 'EMAIL_MISMATCH' }, { status: 403 })
  }

  if (sub.tier !== 'vip' && sub.giveaways_remaining <= 0) {
    return NextResponse.json({ error: 'NO_SLOTS' }, { status: 403 })
  }

  // Check if already entered this premium edition
  const { data: existing } = await db
    .from('premium_entries')
    .select('id, chances')
    .eq('edition_id', edition_id)
    .eq('email', email)
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ error: 'ALREADY_ENTERED', chances: existing.chances }, { status: 409 })
  }

  // Verify premium edition exists and is active
  const { data: edition } = await db
    .from('editions')
    .select('id, is_active, is_drawn, is_premium')
    .eq('id', edition_id)
    .maybeSingle()

  if (!edition || !edition.is_active || edition.is_drawn || !edition.is_premium) {
    return NextResponse.json({ error: 'EDITION_NOT_FOUND' }, { status: 404 })
  }

  const chances = 1 + sub.bonus_chances

  const { data: entry, error } = await db
    .from('premium_entries')
    .insert({ edition_id, subscription_id, email, roblox_username, chances })
    .select('id')
    .single()

  if (error || !entry) {
    return NextResponse.json({ error: 'DB_ERROR' }, { status: 500 })
  }

  // Decrement remaining giveaway slots (not for VIP)
  if (sub.tier !== 'vip') {
    await db
      .from('subscriptions')
      .update({ giveaways_remaining: sub.giveaways_remaining - 1 })
      .eq('id', subscription_id)
  }

  return NextResponse.json({ entry_id: entry.id, chances })
}
