import { NextRequest, NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { sessionOptions, SessionData } from '@/lib/session'
import { getServiceClient } from '@/lib/supabase'

async function checkAdmin(request: NextRequest) {
  const session = await getIronSession<SessionData>(request, new NextResponse(), sessionOptions)
  return session.isAdmin
}

export async function GET(request: NextRequest) {
  if (!await checkAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const editionId = searchParams.get('edition_id')
  const format = searchParams.get('format')

  const db = getServiceClient()
  let query = db.from('entries').select('*').order('created_at', { ascending: false })

  if (editionId) {
    query = query.eq('edition_id', editionId)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch entries' }, { status: 500 })
  }

  if (format === 'csv') {
    const csv = [
      'Email,Pseudo Roblox,Date inscription',
      ...(data ?? []).map((e: any) =>
        `${e.email},${e.roblox_username},${new Date(e.created_at).toISOString()}`
      ),
    ].join('\n')

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="participants.csv"',
      },
    })
  }

  return NextResponse.json({ entries: data, count: data?.length ?? 0 })
}
