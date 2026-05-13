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
  chances: number
  referral_token: string | null
  created_at: string
}

export type Winner = {
  id: string
  edition_id: string
  entry_id: string
  drawn_at: string
  total_chances: number
  editions: Edition
  entries: Entry
}

export type BonusAction = {
  id: string
  edition_id: string
  label: string
  description: string | null
  icon: string
  url: string | null
  bonus_chances: number
  action_type: string
  is_active: boolean
  sort_order: number
  created_at: string
}

export type BonusCompletion = {
  id: string
  entry_id: string
  bonus_action_id: string
  completed_at: string
  bonus_actions?: BonusAction
}

export type Payment = {
  id: string
  entry_id: string
  edition_id: string
  amount_eur: number
  chances_added: number
  stripe_payment_id: string | null
  status: string
  created_at: string
}

export type CpagripCompletion = {
  id: string
  entry_id: string
  offer_id: string
  payout_usd: number
  chances_credited: number
  tracking_id_received: string | null
  raw_postback: Record<string, string> | null
  ip_address: string | null
  created_at: string
}

export type CpagripPostbackLog = {
  id: string
  received_at: string
  raw_body: string | null
  password_valid: boolean
  outcome: string
  error_message: string | null
  ip_address: string | null
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
