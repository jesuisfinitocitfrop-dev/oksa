'use client'

import { useEffect, useState, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

type Entry = { email: string; roblox_username: string }

type DrawState = 'idle' | 'confirming' | 'spinning' | 'done' | 'error'

export default function AdminDrawPage() {
  const t = useTranslations('admin.draw')
  const params = useParams()
  const locale = params.locale as string
  const router = useRouter()

  const [entries, setEntries] = useState<Entry[]>([])
  const [activeEditionId, setActiveEditionId] = useState<string | null>(null)
  const [alreadyDrawn, setAlreadyDrawn] = useState(false)
  const [drawState, setDrawState] = useState<DrawState>('idle')
  const [winner, setWinner] = useState<{ roblox_username: string; email: string } | null>(null)
  const [displayName, setDisplayName] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const spinInterval = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const edRes = await fetch('/api/admin/edition')
    if (edRes.status === 401) { router.push(`/${locale}/admin/login`); return }
    const edData = await edRes.json()
    const active = (edData.editions ?? []).find((e: any) => e.is_active)

    if (!active) return
    setActiveEditionId(active.id)

    // Check if already drawn
    const winRes = await fetch(`/api/admin/draw?edition_id=${active.id}`)
    const winData = await winRes.json()
    if (winData.winners?.length > 0) {
      setAlreadyDrawn(true)
      setWinner({
        roblox_username: winData.winners[0].entries?.roblox_username,
        email: winData.winners[0].entries?.email,
      })
      setDrawState('done')
      return
    }

    // Load entries for spin display
    const entRes = await fetch(`/api/admin/entries?edition_id=${active.id}`)
    const entData = await entRes.json()
    setEntries(entData.entries ?? [])
  }

  function startSpin(resolvedWinner: { roblox_username: string; email: string }) {
    setDrawState('spinning')
    let speed = 50
    let elapsed = 0
    const total = 4000

    function tick() {
      elapsed += speed
      const randomEntry = entries[Math.floor(Math.random() * entries.length)]
      setDisplayName(randomEntry?.roblox_username ?? '???')

      if (elapsed >= total * 0.5) speed = Math.min(speed + 15, 400)

      if (elapsed >= total) {
        if (spinInterval.current) clearTimeout(spinInterval.current)
        setDisplayName(resolvedWinner.roblox_username)
        setWinner(resolvedWinner)
        setDrawState('done')
        triggerConfetti()
        return
      }
      spinInterval.current = setTimeout(tick, speed)
    }
    tick()
  }

  function triggerConfetti() {
    import('canvas-confetti').then(({ default: confetti }) => {
      confetti({ particleCount: 200, spread: 90, origin: { y: 0.5 }, colors: ['#FFD700', '#FF6B00', '#FF4500', '#FFA500'] })
      setTimeout(() => confetti({ particleCount: 100, spread: 120, origin: { y: 0.4 } }), 400)
    })
  }

  async function handleDraw() {
    if (!activeEditionId || entries.length === 0) return
    setDrawState('spinning')
    setErrorMsg('')

    const res = await fetch('/api/admin/draw', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ edition_id: activeEditionId }),
    })

    const data = await res.json()

    if (!res.ok) {
      setErrorMsg(data.error === 'ALREADY_DRAWN' ? t('alreadyDrawn') : data.error === 'NO_ENTRIES' ? t('noEntries') : 'Erreur')
      setDrawState('error')
      return
    }

    startSpin(data.winner)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <div className="flex items-center gap-4 mb-8">
          <Link href={`/${locale}/admin/dashboard`} className="text-gray-500 hover:text-white transition-colors">
            ← Retour
          </Link>
          <h1 className="font-bangers text-3xl text-white">{t('title')}</h1>
        </div>

        {/* Reel display */}
        <div className="fire-border rounded-2xl p-8 text-center mb-6">
          <div className="text-4xl mb-4">🎲</div>

          {drawState === 'idle' && (
            <>
              <p className="text-gray-400 mb-2">{t('subtitle')}</p>
              {entries.length > 0 && (
                <p className="text-gold-400 font-bangers text-2xl">{entries.length} participants</p>
              )}
              {entries.length === 0 && (
                <p className="text-red-400 text-sm">{t('noEntries')}</p>
              )}
            </>
          )}

          {drawState === 'confirming' && (
            <div className="animate-scale-in">
              <p className="text-white font-bold text-lg mb-2">{t('confirm')}</p>
              <p className="text-gray-400 text-sm mb-6">{t('confirmText')}</p>
              <div className="flex gap-3 justify-center">
                <button onClick={handleDraw} className="btn-fire rounded-xl px-6 py-3 font-bangers text-lg text-cit-dark">
                  <span>✅ {t('yes')}</span>
                </button>
                <button onClick={() => setDrawState('idle')} className="bg-cit-card border border-cit-border rounded-xl px-6 py-3 text-gray-400 hover:text-white transition-colors">
                  {t('cancel')}
                </button>
              </div>
            </div>
          )}

          {drawState === 'spinning' && (
            <div>
              <p className="text-gray-400 text-sm mb-4 animate-pulse">Tirage en cours...</p>
              <div className="bg-cit-dark rounded-xl p-4 mb-4 overflow-hidden h-16 flex items-center justify-center">
                <p className="font-bangers text-3xl text-gold-400 transition-none">{displayName}</p>
              </div>
              <div className="flex justify-center gap-1">
                {[0,1,2].map(i => (
                  <div key={i} className="w-2 h-2 bg-gold-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          )}

          {drawState === 'done' && winner && (
            <div className="winner-reveal">
              <p className="font-bangers text-gold-400 text-2xl mb-2 uppercase tracking-widest">
                🏆 {t('winner')} 🏆
              </p>
              <div className="bg-gold-400/10 border-2 border-gold-400 rounded-2xl p-6 my-4">
                <p className="font-bangers text-5xl text-gold-400 mb-1">{winner.roblox_username}</p>
                <p className="text-gray-500 text-sm">{winner.email}</p>
              </div>
              {alreadyDrawn && (
                <p className="text-xs text-gray-600 mt-2">(Tirage précédent)</p>
              )}
            </div>
          )}

          {drawState === 'error' && (
            <div className="text-red-400">
              <p>{errorMsg}</p>
            </div>
          )}
        </div>

        {(drawState === 'idle') && entries.length > 0 && (
          <button
            onClick={() => setDrawState('confirming')}
            className="btn-fire w-full rounded-2xl py-5 font-bangers text-3xl text-cit-dark tracking-wider"
          >
            <span>🎲 {t('launch')}</span>
          </button>
        )}
      </div>
    </div>
  )
}
