'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function getTimeLeft(targetDate: string) {
  const diff = new Date(targetDate).getTime() - Date.now()
  if (diff <= 0) return null
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  }
}

function Digit({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="countdown-digit rounded-lg md:rounded-xl px-2.5 md:px-4 py-2 md:py-3 min-w-[56px] md:min-w-[80px] text-center">
        <span className="text-3xl md:text-5xl lg:text-6xl text-gold-400 leading-none tabular-nums font-black tracking-tight" style={{ fontFamily: 'Inter, system-ui, sans-serif', fontVariantNumeric: 'tabular-nums' }}>
          {value}
        </span>
      </div>
      <span className="text-[10px] md:text-xs text-gray-500 uppercase tracking-widest font-medium">
        {label}
      </span>
    </div>
  )
}

export default function CountdownTimer({ drawDate }: { drawDate: string }) {
  const t = useTranslations('countdown')
  // Start null to avoid server/client mismatch (hydration error)
  const [timeLeft, setTimeLeft] = useState<ReturnType<typeof getTimeLeft>>(null)

  useEffect(() => {
    setTimeLeft(getTimeLeft(drawDate))
    const interval = setInterval(() => setTimeLeft(getTimeLeft(drawDate)), 1000)
    return () => clearInterval(interval)
  }, [drawDate])

  // Skeleton pendant l'hydratation
  if (timeLeft === null) {
    return (
      <div className="text-center">
        <p className="text-gray-500 text-xs uppercase tracking-widest mb-3">{t('title')}</p>
        <div className="flex items-start justify-center gap-1.5 md:gap-3">
          {['--', '--', '--', '--'].map((v, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <div className="countdown-digit rounded-lg md:rounded-xl px-2.5 md:px-4 py-2 md:py-3 min-w-[56px] md:min-w-[80px] text-center">
                <span className="font-bangers text-3xl md:text-5xl text-gold-400 leading-none">{v}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!timeLeft) {
    return (
      <p className="text-fire-500 font-bangers text-2xl md:text-3xl animate-pulse text-center">
        {t('ended')}
      </p>
    )
  }

  return (
    <div className="text-center">
      <p className="text-gray-500 text-xs uppercase tracking-widest mb-3">{t('title')}</p>
      <div className="flex items-start justify-center gap-1.5 md:gap-3 lg:gap-4">
        <Digit value={pad(timeLeft.days)} label={t('days')} />
        <span className="font-bangers text-2xl md:text-4xl text-fire-500 mt-1.5 md:mt-2">:</span>
        <Digit value={pad(timeLeft.hours)} label={t('hours')} />
        <span className="font-bangers text-2xl md:text-4xl text-fire-500 mt-1.5 md:mt-2">:</span>
        <Digit value={pad(timeLeft.minutes)} label={t('minutes')} />
        <span className="font-bangers text-2xl md:text-4xl text-fire-500 mt-1.5 md:mt-2">:</span>
        <Digit value={pad(timeLeft.seconds)} label={t('seconds')} />
      </div>
    </div>
  )
}
