import { NextRequest, NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { sessionOptions, SessionData } from '@/lib/session'
import { getServiceClient } from '@/lib/supabase'

async function checkAdmin(request: NextRequest) {
  const session = await getIronSession<SessionData>(request, new NextResponse(), sessionOptions)
  return session.isAdmin
}

// GET /api/admin/bonus-actions?edition_id=xxx
export async function GET(request: NextRequest) {
  if (!await checkAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const edition_id = searchParams.get('edition_id')

  const db = getServiceClient()
  let query = db.from('bonus_actions').select('*').order('sort_order')
  if (edition_id) query = query.eq('edition_id', edition_id)

  const { data } = await query
  return NextResponse.json({ actions: data ?? [] })
}

// POST /api/admin/bonus-actions — create
export async function POST(request: NextRequest) {
  if (!await checkAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { edition_id, label, description, icon, url, bonus_chances, action_type, sort_order } = body

  if (!edition_id || !label || !bonus_chances) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const db = getServiceClient()
  const { data, error } = await db
    .from('bonus_actions')
    .insert({ edition_id, label, description, icon: icon || '🎯', url, bonus_chances, action_type: action_type || 'custom', sort_order: sort_order ?? 0 })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ action: data })
}

// PUT /api/admin/bonus-actions — update
export async function PUT(request: NextRequest) {
  if (!await checkAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { id, ...updates } = body

  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const db = getServiceClient()
  const { error } = await db.from('bonus_actions').update(updates).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

// DELETE /api/admin/bonus-actions?id=xxx
export async function DELETE(request: NextRequest) {
  if (!await checkAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const db = getServiceClient()
  const { error } = await db.from('bonus_actions').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
