import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'
import { sendConfirmationEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  const { email, roblox_username, edition_id, locale } = await request.json()

  if (!email || !roblox_username || !edition_id) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  }

  const db = getServiceClient()

  // Check edition exists and is active
  const { data: edition, error: editionError } = await db
    .from('editions')
    .select('*')
    .eq('id', edition_id)
    .eq('is_active', true)
    .eq('is_drawn', false)
    .single()

  if (editionError || !edition) {
    return NextResponse.json({ error: 'Edition not found or inactive' }, { status: 404 })
  }

  // Check end date
  if (new Date(edition.end_date) < new Date()) {
    return NextResponse.json({ error: 'Registration period ended' }, { status: 400 })
  }

  // Check duplicate email
  const { data: existingEmail } = await db
    .from('entries')
    .select('id')
    .eq('edition_id', edition_id)
    .eq('email', email.toLowerCase())
    .single()

  if (existingEmail) {
    return NextResponse.json({ code: 'EMAIL_EXISTS', error: 'Email already registered' }, { status: 409 })
  }

  // Check duplicate roblox
  const { data: existingRoblox } = await db
    .from('entries')
    .select('id')
    .eq('edition_id', edition_id)
    .ilike('roblox_username', roblox_username)
    .single()

  if (existingRoblox) {
    return NextResponse.json({ code: 'ROBLOX_EXISTS', error: 'Roblox username already registered' }, { status: 409 })
  }

  // Insert entry
  const { error: insertError } = await db.from('entries').insert({
    edition_id,
    email: email.toLowerCase(),
    roblox_username,
  })

  if (insertError) {
    console.error('Insert error:', insertError)
    return NextResponse.json({ error: 'Failed to register' }, { status: 500 })
  }

  // Send confirmation email (non-blocking)
  try {
    await sendConfirmationEmail(
      email,
      roblox_username,
      locale === 'en' ? edition.title_en : locale === 'es' ? edition.title_es : edition.title,
      edition.draw_date,
      locale ?? 'fr'
    )
  } catch (err) {
    console.error('Email send failed:', err)
  }

  return NextResponse.json({ success: true })
}
