import { setRequestLocale } from 'next-intl/server'
import { getServiceClient } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import FireParticles from '@/components/FireParticles'
import Link from 'next/link'

type Supporter = { roblox_username: string; total: number; count: number }

async function getLeaderboard(): Promise<Supporter[]> {
  const db = getServiceClient()

  const { data: edition } = await db
    .from('editions')
    .select('id')
    .eq('is_active', true)
    .eq('is_drawn', false)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!edition) return []

  const { data } = await db
    .from('payments')
    .select('amount_eur, entries(roblox_username)')
    .eq('edition_id', edition.id)
    .eq('status', 'completed')

  if (!data) return []

  const map: Record<string, Supporter> = {}
  for (const p of data) {
    const username = (p.entries as any)?.roblox_username
    if (!username) continue
    if (!map[username]) map[username] = { roblox_username: username, total: 0, count: 0 }
    map[username].total += p.amount_eur ?? 0
    map[username].count += 1
  }

  return Object.values(map).sort((a, b) => b.total - a.total)
}

const MEDAL_COLORS = {
  1: { bg: 'from-yellow-400 to-yellow-600', border: 'border-yellow-400', text: 'text-yellow-400', height: 'h-40', label: '🥇' },
  2: { bg: 'from-gray-300 to-gray-500', border: 'border-gray-300', text: 'text-gray-300', height: 'h-28', label: '🥈' },
  3: { bg: 'from-amber-600 to-amber-800', border: 'border-amber-600', text: 'text-amber-500', height: 'h-20', label: '🥉' },
}

export default async function SupportersPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const supporters = await getLeaderboard()
  const top3 = supporters.slice(0, 3)
  const rest = supporters.slice(3)
  const maxTotal = supporters[0]?.total || 1

  return (
    <div className="min-h-screen relative">
      <FireParticles />
      <Navbar locale={locale} />

      <div className="relative z-10 max-w-3xl mx-auto px-4 pt-24 pb-16">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 rounded-full px-4 py-1.5 mb-4">
            <span className="text-purple-400 text-sm font-bold uppercase tracking-widest">💎 Hall of Fame</span>
          </div>
          <h1 className="font-bangers text-5xl md:text-7xl text-white mb-2">
            TOP <span className="text-gold-gradient">SUPPORTERS</span>
          </h1>
          <p className="text-gray-400 text-sm md:text-base">
            Les joueurs qui ont le plus boosté leurs chances et soutenu CIT
          </p>
        </div>

        {supporters.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-6xl mb-4">🏆</p>
            <p className="text-gray-400 text-lg">Aucun supporter pour l&apos;instant.</p>
            <p className="text-gray-600 text-sm mt-2">Sois le premier à booster tes chances !</p>
          </div>
        ) : (
          <>
            {/* Podium top 3 */}
            {top3.length > 0 && (
              <div className="flex items-end justify-center gap-4 mb-12">
                {/* Ordre : 2 - 1 - 3 */}
                {[
                  top3[1] ? { ...top3[1], rank: 2 } : null,
                  top3[0] ? { ...top3[0], rank: 1 } : null,
                  top3[2] ? { ...top3[2], rank: 3 } : null,
                ].map((s, i) => {
                  if (!s) return <div key={i} className="flex-1" />
                  const colors = MEDAL_COLORS[s.rank as 1 | 2 | 3]
                  return (
                    <div key={s.roblox_username} className="flex-1 flex flex-col items-center">
                      {/* Avatar + pseudo */}
                      <div className="mb-3 text-center">
                        <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${colors.bg} flex items-center justify-center text-2xl mb-2 mx-auto shadow-lg`}>
                          {colors.label}
                        </div>
                        <p className={`font-bold text-sm ${colors.text} truncate max-w-[100px]`}>{s.roblox_username}</p>
                        <p className="text-white font-bangers text-xl">{s.total}€</p>
                        <p className="text-gray-500 text-xs">{s.count} boost{s.count > 1 ? 's' : ''}</p>
                      </div>
                      {/* Podium block */}
                      <div className={`w-full ${colors.height} bg-gradient-to-t ${colors.bg} rounded-t-xl border-t-2 ${colors.border} flex items-center justify-center`}>
                        <span className="font-bangers text-white text-4xl opacity-40">{s.rank}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Reste du classement */}
            {rest.length > 0 && (
              <div className="space-y-2 mb-10">
                <h2 className="font-bangers text-2xl text-white mb-4">Classement complet</h2>
                {rest.map((s, i) => {
                  const rank = i + 4
                  const pct = Math.round((s.total / maxTotal) * 100)
                  return (
                    <div key={s.roblox_username} className="bg-cit-card border border-cit-border rounded-xl px-4 py-3 flex items-center gap-4">
                      <span className="font-bangers text-2xl text-gray-600 w-8 text-right shrink-0">#{rank}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-white text-sm truncate">{s.roblox_username}</span>
                          <span className="font-bangers text-gold-400 text-base shrink-0 ml-2">{s.total}€</span>
                        </div>
                        <div className="h-1.5 bg-cit-dark rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* CTA */}
        <div className="fire-border rounded-2xl p-6 text-center">
          <p className="font-bangers text-3xl text-white mb-2">BOOSTE TES CHANCES</p>
          <p className="text-gray-400 text-sm mb-5">
            1€ = +100 chances de gagner • Apparais dans ce classement
          </p>
          <Link
            href={`/${locale}#inscription`}
            className="btn-fire inline-block rounded-xl px-8 py-4 font-bangers text-xl text-cit-dark"
          >
            SUPPORTER MAINTENANT →
          </Link>
        </div>

      </div>
    </div>
  )
}
