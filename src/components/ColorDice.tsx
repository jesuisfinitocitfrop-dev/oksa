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

// Fenêtre pendant laquelle relancer compte comme un combo
const COMBO_WINDOW = 4000
// Délai sans clic après lequel on considère que le joueur a « relâché » → révélation
const RELEASE_DELAY = 650

function randomColor(): DiceColor {
  return DICE_COLORS[Math.floor(Math.random() * DICE_COLORS.length)]
}

function Die({
  color, theme, hidden, shaking, index,
}: {
  color: DiceColor; theme: string; hidden: boolean; shaking: boolean; index: number
}) {
  const s = COLOR_STYLES[color]
  const neon = theme === 'neon'

  if (hidden) {
    return (
      <div
        className={`relative w-20 h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center ${
          shaking ? 'animate-shake' : ''
        }`}
        style={{
          background: 'linear-gradient(135deg, #3A3A4E 0%, #23232F 55%, #16161E 100%)',
          boxShadow: '0 0 18px rgba(255,255,255,0.12), inset 0 2px 4px rgba(255,255,255,0.15)',
          border: '3px solid rgba(255,255,255,0.15)',
          animationDelay: `${index * 0.05}s`,
          animationIterationCount: shaking ? 'infinite' : undefined,
        }}
      >
        <span className="font-bangers text-3xl md:text-4xl text-white/70 select-none">?</span>
      </div>
    )
  }

  return (
    <div
      className="relative w-20 h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center animate-scale-in"
      style={{
        background: s.gradient,
        boxShadow: neon
          ? `0 0 25px ${s.glow}, 0 0 60px ${s.glow}, 0 0 100px ${s.glow}66, inset 0 2px 4px rgba(255,255,255,0.4)`
          : `0 0 18px ${s.glow}AA, 0 0 45px ${s.glow}55, inset 0 2px 4px rgba(255,255,255,0.4)`,
        border: '3px solid rgba(255,255,255,0.25)',
        animationDelay: `${index * 0.08}s`,
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
  const [hidden, setHidden] = useState(true)
  const [shaking, setShaking] = useState(false)

  // Combo
  const [combo, setCombo] = useState(0)
  const [jackpot, setJackpot] = useState(false)
  const comboRef = useRef(0)
  const comboTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const releaseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // identifiant de la dernière révélation : un nouveau clic invalide celle en cours
  const revealIdRef = useRef(0)

  const bumpCombo = useCallback((amount: number) => {
    if (comboTimeoutRef.current) clearTimeout(comboTimeoutRef.current)
    comboRef.current += amount
    setCombo(comboRef.current)
    comboTimeoutRef.current = setTimeout(() => {
      comboRef.current = 0
      setCombo(0)
    }, COMBO_WINDOW)
  }, [])

  // Révélation : le serveur tire les couleurs (forcées par l'admin si définies, sinon aléatoires)
  const reveal = useCallback(async (n: number) => {
    const revealId = ++revealIdRef.current
    let result: { colors?: DiceColor[]; possible?: DiceColor[] } = {}
    try {
      const res = await fetch(`/api/dice/roll?count=${n}`, { cache: 'no-store' })
      if (res.ok) result = await res.json()
    } catch { /* réseau KO → couleurs aléatoires locales */ }

    // le joueur a recliqué pendant la requête : on reste caché
    if (revealIdRef.current !== revealId) return

    const final = result.colors?.length ? result.colors : Array.from({ length: n }, randomColor)
    setDice(final)
    if (result.possible?.length) setPossible(result.possible)
    setShaking(false)
    setHidden(false)

    // JACKPOT : tous les dés de la même couleur (à partir de 2 dés)
    if (n >= 2 && final.every(c => c === final[0])) {
      setJackpot(true)
      if (comboRef.current > 0) bumpCombo(2)
      setTimeout(() => setJackpot(false), 1800)
    }
  }, [bumpCombo])

  // Chaque clic cache les dés et nourrit le combo ; la révélation
  // ne part que RELEASE_DELAY ms après le DERNIER clic (le « relâchement »)
  function handleRollClick() {
    bumpCombo(1)
    setHidden(true)
    setShaking(true)
    revealIdRef.current++ // annule une révélation en vol
    if (releaseTimerRef.current) clearTimeout(releaseTimerRef.current)
    releaseTimerRef.current = setTimeout(() => reveal(count), RELEASE_DELAY)
  }

  useEffect(() => {
    setHidden(true)
    setShaking(true)
    revealIdRef.current++
    if (releaseTimerRef.current) clearTimeout(releaseTimerRef.current)
    releaseTimerRef.current = setTimeout(() => reveal(count), RELEASE_DELAY)
    return () => {
      if (releaseTimerRef.current) clearTimeout(releaseTimerRef.current)
      if (comboTimeoutRef.current) clearTimeout(comboTimeoutRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count])

  const colorNames = possible.map(c => (
    <span key={c} className="font-bold" style={{ color: COLOR_STYLES[c].text }}>{t(`colors.${c}`)}</span>
  ))

  // Le style du combo s'intensifie avec le score
  const comboClass =
    combo >= 10
      ? 'text-5xl md:text-6xl bg-gradient-to-r from-gold-400 via-fire-400 to-fire-600 bg-clip-text text-transparent animate-shake'
      : combo >= 5
      ? 'text-4xl md:text-5xl text-gold-400'
      : 'text-3xl md:text-4xl text-white'

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
      <div className="flex flex-wrap items-center justify-center gap-5 md:gap-6 mb-8 min-h-[96px]">
        {dice.map((color, i) => (
          <Die key={i} color={color} theme={theme} hidden={hidden} shaking={shaking} index={i} />
        ))}
      </div>

      {/* ── Zone combo (hauteur réservée pour éviter les sauts) ── */}
      <div className="flex flex-col items-center justify-center min-h-[90px] mb-4">
        {jackpot && (
          <p className="font-bangers text-3xl md:text-4xl bg-gradient-to-r from-gold-300 via-gold-400 to-fire-400 bg-clip-text text-transparent animate-scale-in mb-1">
            ⭐ {t('jackpot')} ⭐
          </p>
        )}
        {combo >= 2 && (
          <>
            <p key={combo} className={`font-bangers tracking-wide animate-scale-in ${comboClass}`}>
              🔥 {t('combo', { count: combo })}
            </p>
            {/* Barre de temps : relance avant qu'elle se vide pour garder le combo */}
            <div className="w-44 h-1.5 bg-cit-border rounded-full overflow-hidden mt-2">
              <div
                key={`drain-${combo}`}
                className="h-full bg-gradient-to-r from-gold-400 to-fire-500 rounded-full combo-drain"
              />
            </div>
          </>
        )}
      </div>

      {/* ── Bouton lancer (spam = combo : les dés restent cachés tant qu'on clique) ── */}
      <button
        onClick={handleRollClick}
        className="btn-fire rounded-2xl px-12 md:px-16 py-4 font-bangers text-2xl md:text-3xl text-cit-dark tracking-wider w-full max-w-md md:w-auto select-none"
      >
        <span>{t('rollAgain')}</span>
      </button>

      {/* ── Couleurs possibles ── */}
      <div className="mt-10 bg-cit-card/80 border border-cit-border rounded-full px-6 py-3 text-sm text-gray-300 text-center">
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
