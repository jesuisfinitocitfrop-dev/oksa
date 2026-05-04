'use client'

import { useEffect, useState, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

function getFakeBase(createdAt: string): number {
  const elapsed = Date.now() - new Date(createdAt).getTime()
  const hours = elapsed / (1000 * 60 * 60)
  if (hours <= 0) return 134
  if (hours <= 1) return Math.round(134 + 855 * hours)
  if (hours <= 24) return Math.round(989 + 1312 * (hours - 1) / 23)
  return 2301
}

export default function ParticipantCounter({
  editionId,
  initial,
  createdAt,
}: {
  editionId: string
  initial: number
  createdAt: string
}) {
  const t = useTranslations('hero')
  const [realCount, setRealCount] = useState(initial)
  const [displayed, setDisplayed] = useState(() => getFakeBase(createdAt) + initial)

  const fetchRealCount = useCallback(async () => {
    if (!isSupabaseConfigured) return
    try {
      const { count } = await supabase
        .from('entries')
        .select('*', { count: 'exact', head: true })
        .eq('edition_id', editionId)
      if (count !== null) setRealCount(count)
    } catch { /* ignore */ }
  }, [editionId])

  // Update displayed number whenever realCount changes or every minute
  useEffect(() => {
    const update = () => setDisplayed(getFakeBase(createdAt) + realCount)
    update()
    const interval = setInterval(update, 60_000)
    return () => clearInterval(interval)
  }, [createdAt, realCount])

  // Polling fallback every 30s (works even without Supabase realtime enabled)
  useEffect(() => {
    const poll = setInterval(fetchRealCount, 30_000)
    return () => clearInterval(poll)
  }, [fetchRealCount])

  // Supabase realtime (instant updates when enabled in Supabase dashboard)
  useEffect(() => {
    if (!isSupabaseConfigured) return
    const channel = supabase
      .channel('entries-count')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'entries', filter: `edition_id=eq.${editionId}` },
        () => setRealCount(prev => prev + 1)
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [editionId])

  return (
    <div className="flex items-center gap-2 justify-center">
      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
      <span className="font-bangers text-2xl text-gold-400">{displayed.toLocaleString()}</span>
      <span className="text-gray-400 text-sm">{t('participants')}</span>
    </div>
  )
}
