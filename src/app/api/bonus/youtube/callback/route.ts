import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'

const CHANNEL_ID = 'UCNEkD0KhJFnYR_cJ_7syKNg'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const stateParam = searchParams.get('state')
  const oauthError = searchParams.get('error')

  const appUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  if (oauthError || !code || !stateParam) {
    return NextResponse.redirect(`${appUrl}?youtube=cancelled`)
  }

  let state: { entry_id: string; action_id: string; return_url: string }
  try {
    state = JSON.parse(Buffer.from(stateParam, 'base64url').toString())
  } catch {
    return NextResponse.redirect(`${appUrl}?youtube=error`)
  }

  const { entry_id, action_id, return_url } = state
  const redirectBase = return_url || appUrl

  // Exchange code for access token
  const redirectUri = `${appUrl}/api/bonus/youtube/callback`
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  })

  const tokenData = await tokenRes.json()
  if (!tokenData.access_token) {
    return NextResponse.redirect(`${redirectBase}?youtube=error`)
  }

  // Check if subscribed to the channel
  const subRes = await fetch(
    `https://www.googleapis.com/youtube/v3/subscriptions?part=snippet&mine=true&forChannelId=${CHANNEL_ID}`,
    { headers: { Authorization: `Bearer ${tokenData.access_token}` } }
  )
  const subData = await subRes.json()
  const isSubscribed = (subData.items?.length ?? 0) > 0

  if (!isSubscribed) {
    return NextResponse.redirect(
      `${redirectBase}?youtube=not_subscribed&action_id=${action_id}&entry_id=${entry_id}`
    )
  }

  // Mark action complete and add chances
  const db = getServiceClient()

  const { data: existing } = await db
    .from('bonus_completions')
    .select('id')
    .eq('entry_id', entry_id)
    .eq('bonus_action_id', action_id)
    .single()

  if (!existing) {
    const { data: action } = await db
      .from('bonus_actions')
      .select('bonus_chances')
      .eq('id', action_id)
      .single()

    if (action) {
      await db.from('bonus_completions').insert({ entry_id, bonus_action_id: action_id })
      const { data: entry } = await db
        .from('entries')
        .select('chances')
        .eq('id', entry_id)
        .single()
      if (entry) {
        await db
          .from('entries')
          .update({ chances: entry.chances + action.bonus_chances })
          .eq('id', entry_id)
      }
    }
  }

  return NextResponse.redirect(
    `${redirectBase}?youtube=success&action_id=${action_id}&entry_id=${entry_id}`
  )
}
