'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { DICE_COLORS, MAX_DICE, type DiceColor } from '@/lib/dice'

const COLOR_STYLES: Record<DiceColor, { gradient: string; glow: string; text: string }> = {
  red:    { gradient: 'linear-gradient(135deg, #FF6B5B 0%, #E8281B 55%, #C81E12 100%)', glow: '#EF4444', text: '#F87171' },
  orange: { gradient: 'linear-gradient(135deg, #FFC14D 0%, #F59E0B 55%, #DD8500 100%)', glow: '#F59E0B', text: '#FBBF24' },
  yellow: { gradient: 'linear-gradient(135deg, #FFF18C 0%, #FACC15 55%, #E0B40D 100%)', glow: '#FACC15', text: '#FDE047' },
  green:  { gradient: 'linear-gradient(135deg, #6EE7A0 0%, #22C55E 55%, #15803D 100%)', glow: '#22C55E', text: '#4ADE80' },
  blue:   { gradient: 'linear-gradient(135deg, #7CB8FF 0%, #3B82F6 55%, #1D4ED8 100%)', glow: '#3B82F6', text: '#60A5FA' },
  purple: { gradient: 'linear-gradient(135deg, #C77DFF 0%, #9333EA 55%, #6B21A8 100%)', glow: '#A855F7', text: '#C084FC' },
}

function randomColor(): DiceColor {
  return DICE_COLORS[Math.floor(Math.random() * DICE_COLORS.length)]
}

function Die({ color, theme, rolling, index }: { color: DiceColor; theme: string; rolling: boolean; index: number }) {
  const s = COLOR_STYLES[color]
  const neon = theme === 'neon'
  return (
    <div
      className={`relative w-20 h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center transition-transform duration-150 ${
        rolling ? 'animate-shake' : 'animate-scale-in'
      }`}
      style={{
        background: s.gradient,
        boxShadow: neon
          ? `0 0 25px ${s.glow}, 0 0 60px ${s.glow}, 0 0 100px ${s.glow}66, inset 0 2px 4px rgba(255,255,255,0.4)`
          : `0 0 18px ${s.glow}AA, 0 0 45px ${s.glow}55, inset 0 2px 4px rgba(255,255,255,0.4)`,
        border: '3px solid rgba(255,255,255,0.25)',
        animationDelay: rolling ? `${index * 0.05}s` : `${index * 0.08}s`,
      }}
    >
      <div
        className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-white"
        style={{ boxShadow: 'inset 0 -2px 4px rgba(0,0,0,0.25), 0 1px 3px rgba(0,0,0,0.3)' }}
      />
    </div>
  )
}

export default function ColorDice() {
  const t = useTranslations('dice')
  const [theme, setTheme] = useState<'bw' | 'neon'>('bw')
  const [count, setCount] = useState(3)
  const [dice, setDice] = useState<DiceColor[]>(() => Array.from({ length: 3 }, randomColor))
  const [possible, setPossible] = useState<DiceColor[]>([...DICE_COLORS])
  const [rolling, setRolling] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const roll = useCallback(async (n: number) => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setRolling(true)

    // animation : les dés cyclent au hasard pendant que le serveur tire le vrai résultat
    intervalRef.current = setInterval(() => {
      setDice(Array.from({ length: n }, randomColor))
    }, 90)

    const minDelay = new Promise(resolve => setTimeout(resolve, 1200))
    let result: { colors?: DiceColor[]; possible?: DiceColor[] } = {}
    try {
      const res = await fetch(`/api/dice/roll?count=${n}`, { cache: 'no-store' })
      if (res.ok) result = await res.json()
    } catch { /* réseau KO → on garde des couleurs aléatoires locales */ }
    await minDelay

    if (intervalRef.current) clearInterval(intervalRef.current)
    setDice(result.colors?.length ? result.colors : Array.from({ length: n }, randomColor))
    if (result.possible?.length) setPossible(result.possible)
    setRolling(false)
  }, [])

  useEffect(() => {
    roll(count)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count])

  const colorNames = possible.map(c => (
    <span key={c} className="font-bold" style={{ color: COLOR_STYLES[c].text }}>{t(`colors.${c}`)}</span>
  ))

  return (
    <div className="flex flex-col items-center">

      {/* ── Panneau de réglages ── */}
      <div className="bg-cit-card/80 border border-cit-border rounded-2xl p-4 md:p-5 mb-12 w-full max-w-md">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-1.5 text-[11px] text-gray-400 uppercase tracking-widest mb-2">
              <span className="text-red-500">●</span> {t('theme')}
            </label>
            <select
              value={theme}
              onChange={e => setTheme(e.target.value as 'bw' | 'neon')}
              className="cit-input w-full rounded-xl px-4 py-3 text-sm font-bold uppercase"
            >
              <option value="bw">{t('themeBW')}</option>
              <option value="neon">{t('themeNeon')}</option>
            </select>
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-[11px] text-gray-400 uppercase tracking-widest mb-2">
              <span>🎲</span> {t('countLabel')}
            </label>
            <select
              value={count}
              onChange={e => setCount(Number(e.target.value))}
              className="cit-input w-full rounded-xl px-4 py-3 text-sm font-bold uppercase"
            >
              {Array.from({ length: MAX_DICE }, (_, i) => i + 1).map(n => (
                <option key={n} value={n}>{t('diceCount', { count: n })}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── Les dés ── */}
      <div className="flex flex-wrap items-center justify-center gap-5 md:gap-6 mb-10 min-h-[96px]">
        {dice.map((color, i) => (
          <Die key={i} color={color} theme={theme} rolling={rolling} index={i} />
        ))}
      </div>

      {/* ── Bouton lancer ── */}
      <button
        onClick={() => roll(count)}
        disabled={rolling}
        className="btn-fire rounded-2xl px-12 md:px-16 py-4 font-bangers text-2xl md:text-3xl text-cit-dark tracking-wider disabled:opacity-70 w-full max-w-md md:w-auto"
      >
        <span>{rolling ? '...' : t('rollAgain')}</span>
      </button>

      {/* ── Couleurs possibles ── */}
      <div className="mt-12 bg-cit-card/80 border border-cit-border rounded-full px-6 py-3 text-sm text-gray-300 text-center">
        {t('possibleIntro')}{' '}
        {colorNames.map((el, i) => (
          <span key={i}>
            {el}
            {i < colorNames.length - 2 ? ', ' : i === colorNames.length - 2 ? ` ${t('and')} ` : ''}
          </span>
        ))}
        .
      </div>
    </div>
  )
}
