import { NextRequest, NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { sessionOptions, SessionData } from '@/lib/session'
import { getServiceClient } from '@/lib/supabase'
import { sendAnnouncementEmails } from '@/lib/email'

async function checkAdmin(request: NextRequest) {
  const session = await getIronSession<SessionData>(request, new NextResponse(), sessionOptions)
  return session.isAdmin
}

export async function POST(request: NextRequest) {
  if (!await checkAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { edition_id } = await request.json()
  if (!edition_id) {
    return NextResponse.json({ error: 'edition_id requis' }, { status: 400 })
  }

  const db = getServiceClient()

  // Fetch edition details
  const { data: edition, error: edErr } = await db
    .from('editions')
    .select('title, prize_name, prize_image_url, draw_date')
    .eq('id', edition_id)
    .single()

  if (edErr || !edition) {
    return NextResponse.json({ error: 'Édition introuvable' }, { status: 404 })
  }

  // Fetch all unique emails from ALL past entries
  const { data: entries, error: entErr } = await db
    .from('entries')
    .select('email')

  if (entErr) {
    return NextResponse.json({ error: 'Impossible de récupérer les emails' }, { status: 500 })
  }

  const uniqueEmails = [...new Set((entries ?? []).map((e: any) => e.email as string))]

  if (uniqueEmails.length === 0) {
    return NextResponse.json({ sent: 0, total: 0 })
  }

  try {
    const sent = await sendAnnouncementEmails(uniqueEmails, edition)
    return NextResponse.json({ sent, total: uniqueEmails.length })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Erreur envoi' }, { status: 500 })
  }
}
