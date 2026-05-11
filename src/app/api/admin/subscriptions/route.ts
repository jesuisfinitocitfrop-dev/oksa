import { NextRequest, NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { sessionOptions, SessionData } from '@/lib/session'
import { getServiceClient } from '@/lib/supabase'

async function checkAdmin(request: NextRequest) {
  const session = await getIronSession<SessionData>(request, new NextResponse(), sessionOptions)
  return session.isAdmin
}

// GET /api/admin/subscriptions — liste des abonnements + stats
export async function GET(request: NextRequest) {
  if (!await checkAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = getServiceClient()
  const { data: subs } = await db
    .from('subscriptions')
    .select('*')
    .order('created_at', { ascending: false })

  const all = subs ?? []
  const active = all.filter(s => s.status === 'active')

  const stats = {
    total: all.length,
    active: active.length,
    starter: active.filter(s => s.tier === 'starter').length,
    plus: active.filter(s => s.tier === 'plus').length,
    vip: active.filter(s => s.tier === 'vip').length,
    monthly_revenue: active.reduce((sum, s) => sum + (s.amount_eur ?? 0), 0),
  }

  return NextResponse.json({ subscriptions: all, stats })
}

// PUT /api/admin/subscriptions — annuler un abonnement (côté DB)
export async function PUT(request: NextRequest) {
  if (!await checkAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, status } = await request.json()
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const db = getServiceClient()
  const { error } = await db
    .from('subscriptions')
    .update({ status: status ?? 'cancelled' })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
