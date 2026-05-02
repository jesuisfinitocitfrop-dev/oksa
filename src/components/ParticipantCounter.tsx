'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

// Returns the fake base count based on time elapsed since edition creation
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

  // Refresh displayed count every minute as fake base grows
  useEffect(() => {
    const update = () => setDisplayed(getFakeBase(createdAt) + realCount)
    update()
    const interval = setInterval(update, 60_000)
    return () => clearInterval(interval)
  }, [createdAt, realCount])

  // Real-time subscription for actual new entries
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
