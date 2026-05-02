import { NextRequest, NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { sessionOptions, SessionData } from '@/lib/session'
import { getServiceClient } from '@/lib/supabase'

async function checkAdmin(request: NextRequest) {
  const session = await getIronSession<SessionData>(request, new NextResponse(), sessionOptions)
  return session.isAdmin
}

export async function POST(request: NextRequest) {
  if (!await checkAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { title, title_en, title_es, prize_name, prize_image_url, end_date, draw_date } = body

  if (!title || !prize_name || !end_date || !draw_date) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const db = getServiceClient()

  // Deactivate previous active editions
  await db.from('editions').update({ is_active: false }).eq('is_active', true)

  const { data, error } = await db.from('editions').insert({
    title,
    title_en: title_en || title,
    title_es: title_es || title,
    prize_name,
    prize_image_url: prize_image_url || null,
    end_date,
    draw_date,
    is_active: true,
    is_drawn: false,
  }).select().single()

  if (error) {
    return NextResponse.json({ error: 'Failed to create edition' }, { status: 500 })
  }

  return NextResponse.json({ edition: data })
}

export async function GET(request: NextRequest) {
  if (!await checkAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = getServiceClient()
  const { data } = await db
    .from('editions')
    .select('*')
    .order('created_at', { ascending: false })

  return NextResponse.json({ editions: data ?? [] })
}
