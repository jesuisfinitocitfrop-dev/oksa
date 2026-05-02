import { createClient } from '@supabase/supabase-js'

export type Edition = {
  id: string
  title: string
  title_en: string
  title_es: string
  prize_name: string
  prize_image_url: string | null
  end_date: string
  draw_date: string
  is_active: boolean
  is_drawn: boolean
  created_at: string
}

export type Entry = {
  id: string
  edition_id: string
  email: string
  roblox_username: string
  created_at: string
}

export type Winner = {
  id: string
  edition_id: string
  entry_id: string
  drawn_at: string
  editions: Edition
  entries: Entry
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder'

export const isSupabaseConfigured =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? 'placeholder'
  )
}
