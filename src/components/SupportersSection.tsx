'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Supporter = {
  roblox_username: string
  total: number
}

const PODIUM = {
  1: { bg: 'from-yellow-400 to-yellow-600', border: 'border-yellow-400', text: 'text-yellow-300', height: 'h-32', medal: '🥇' },
  2: { bg: 'from-gray-300 to-gray-500', border: 'border-gray-300', text: 'text-gray-200', height: 'h-20', medal: '🥈' },
  3: { bg: 'from-amber-600 to-amber-800', border: 'border-amber-600', text: 'text-amber-400', height: 'h-14', medal: '🥉' },
}

export default function SupportersSection({ editionId }: { editionId: string }) {
  const [supporters, setSupporters] = useState<Supporter[]>([])

  async function fetchSupporters() {
    try {
      const res = await fetch(`/api/supporters/leaderboard?edition_id=${editionId}`)
      const data = await res.json()
      setSupporters(data.supporters ?? [])
    } catch { /* ignore */ }
  }

  useEffect(() => {
    fetchSupporters()
    const interval = setInterval(fetchSupporters, 30_000)
    return () => clearInterval(interval)
  }, [editionId])

  if (supporters.length === 0) return null

  const top3 = supporters.slice(0, 3)
  const rest = supporters.slice(3, 8)
  const maxTotal = supporters[0]?.total || 1

  // Ordre podium : 2 - 1 - 3
  const podiumOrder = [
    top3[1] ? { ...top3[1], rank: 2 } : null,
    top3[0] ? { ...top3[0], rank: 1 } : null,
    top3[2] ? { ...top3[2], rank: 3 } : null,
  ]

  return (
    <section id="supporters" className="relative z-10 py-12 md:py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <h2 className="font-bangers text-4xl md:text-5xl text-center text-white mb-2">
          💎 TOP SUPPORTERS
        </h2>
        <p className="text-gray-400 text-center text-sm mb-10">
          Ces joueurs ont boosté leurs chances et soutenu CIT
        </p>

        {/* Podium */}
        <div className="flex items-end justify-center gap-4 mb-8">
          {podiumOrder.map((s, i) => {
            if (!s) return <div key={i} className="flex-1" />
            const c = PODIUM[s.rank as 1 | 2 | 3]
            return (
              <div key={s.roblox_username} className="flex-1 flex flex-col items-center">
                <div className="mb-2 text-center">
                  <p className="text-xl mb-1">{c.medal}</p>
                  <p className={`font-bold text-xs ${c.text} truncate max-w-[90px]`}>{s.roblox_username}</p>
                  <p className="text-white font-bangers text-lg">{s.total}€</p>
                </div>
                <div className={`w-full ${c.height} bg-gradient-to-t ${c.bg} rounded-t-xl border-t-2 ${c.border} flex items-center justify-center`}>
                  <span className="font-bangers text-white/30 text-3xl">{s.rank}</span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Reste */}
        {rest.length > 0 && (
          <div className="space-y-2 mb-8">
            {rest.map((s, i) => {
              const pct = Math.round((s.total / maxTotal) * 100)
              return (
                <div key={s.roblox_username} className="flex items-center gap-3 bg-cit-card border border-cit-border rounded-xl px-4 py-2.5">
                  <span className="font-bangers text-xl text-gray-600 w-6 shrink-0">#{i + 4}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-white text-sm truncate">{s.roblox_username}</span>
                      <span className="font-bangers text-gold-400 text-sm shrink-0 ml-2">{s.total}€</span>
                    </div>
                    <div className="h-1 bg-cit-dark rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className="text-center">
          <Link
            href="/supporters"
            className="inline-flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors border border-purple-500/30 rounded-full px-4 py-2 hover:border-purple-400/50"
          >
            Voir le classement complet →
          </Link>
        </div>
      </div>
    </section>
  )
}
