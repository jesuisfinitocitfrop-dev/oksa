import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getIronSession } from 'iron-session'
import { sessionOptions, SessionData } from '@/lib/session'
import { getServiceClient } from '@/lib/supabase'

const DEFAULT_BONUS_ACTIONS = [
  { label: "S'abonner à CIT", description: null, icon: '▶️', url: 'https://youtube.com/@CITlevrai', bonus_chances: 5, action_type: 'youtube', sort_order: 0 },
  { label: 'Rejoindre le Discord', description: null, icon: '💬', url: 'https://discord.gg/QmNt77eB6h', bonus_chances: 5, action_type: 'discord', sort_order: 1 },
  { label: 'Regarde une pub', description: '33', icon: '📺', url: 'https://plump-plastic.com/0mtgIQ', bonus_chances: 100, action_type: 'pub', sort_order: 2 },
  { label: '1 clic = 1 chance de plus', description: null, icon: '🖱️', url: 'https://plump-plastic.com/0mtgIQ', bonus_chances: 1, action_type: 'pub_click', sort_order: 3 },
]

async function checkAdmin(request: NextRequest) {
  const session = await getIronSession<SessionData>(request, new NextResponse(), sessionOptions)
  return session.isAdmin
}

export async function POST(request: NextRequest) {
  if (!await checkAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { title, title_en, title_es, prize_name, prize_image_url, end_date, draw_date, is_premium } = body

  if (!title || !prize_name || !end_date || !draw_date) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const db = getServiceClient()

  // Fetch bonus actions from current active edition before deactivating
  const { data: currentActive } = await db
    .from('editions')
    .select('id')
    .eq('is_active', true)
    .limit(1)
    .single()

  let previousActions: any[] = []
  if (currentActive) {
    const { data } = await db
      .from('bonus_actions')
      .select('label, description, icon, url, bonus_chances, action_type, sort_order')
      .eq('edition_id', currentActive.id)
      .eq('is_active', true)
      .order('sort_order')
    previousActions = data ?? []
  }

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
    is_premium: is_premium ?? false,
  }).select().single()

  if (error) {
    return NextResponse.json({ error: 'Failed to create edition' }, { status: 500 })
  }

  // Copy bonus actions from previous edition, or create defaults
  const actionsSource = previousActions.length > 0 ? previousActions : DEFAULT_BONUS_ACTIONS
  await db.from('bonus_actions').insert(
    actionsSource.map(a => ({ ...a, edition_id: data.id, is_active: true }))
  )

  revalidatePath('/', 'layout')

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
