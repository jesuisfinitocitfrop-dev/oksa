import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const entry_id = searchParams.get('entry_id')
  const action_id = searchParams.get('action_id')
  const return_url = searchParams.get('return_url') || '/'

  if (!entry_id || !action_id) {
    return NextResponse.redirect(return_url + '?youtube=error')
  }

  const clientId = process.env.GOOGLE_CLIENT_ID
  if (!clientId) {
    return NextResponse.redirect(return_url + '?youtube=not_configured')
  }

  const appUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const redirectUri = `${appUrl}/api/bonus/youtube/callback`
  const state = Buffer.from(JSON.stringify({ entry_id, action_id, return_url })).toString('base64url')

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/youtube.readonly',
    access_type: 'online',
    state,
  })

  return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`)
}
