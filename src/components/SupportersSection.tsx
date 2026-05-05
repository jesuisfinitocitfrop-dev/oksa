'use client'

import { useEffect, useState } from 'react'

type Supporter = {
  roblox_username: string
  amount_eur: number
}

export default function SupportersSection({ editionId }: { editionId: string }) {
  const [supporters, setSupporters] = useState<Supporter[]>([])

  async function fetchSupporters() {
    try {
      const res = await fetch(`/api/supporters?edition_id=${editionId}`)
      const data = await res.json()
      setSupporters(data.supporters ?? [])
    } catch { /* ignore */ }
  }

  useEffect(() => {
    fetchSupporters()
    // Rafraîchit toutes les 30s pour afficher les nouveaux supporters rapidement
    const interval = setInterval(fetchSupporters, 30_000)
    return () => clearInterval(interval)
  }, [editionId])

  if (supporters.length === 0) return null

  return (
    <section id="supporters" className="relative z-10 py-12 md:py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="font-bangers text-4xl md:text-5xl text-center text-white mb-2">
          💎 SUPPORTERS
        </h2>
        <p className="text-gray-400 text-center text-sm mb-8">
          Ces joueurs ont boosté leurs chances et soutenu CIT
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          {supporters.map((s, i) => (
            <div
              key={i}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/30 rounded-full px-4 py-2"
            >
              <span className="text-purple-300 font-bold text-sm">{s.roblox_username}</span>
              <span className="text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full font-bold">
                💎 {s.amount_eur}€
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
