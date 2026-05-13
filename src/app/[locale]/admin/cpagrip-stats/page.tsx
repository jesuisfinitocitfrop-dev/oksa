'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

type Completion = {
  id: string
  entry_id: string
  offer_id: string
  payout_usd: number
  chances_credited: number
  ip_address: string | null
  created_at: string
  entries?: { email: string; roblox_username: string }
}

type Stats = {
  total_completions: number
  total_chances_credited: number
  total_revenue_usd: number
  avg_payout_usd: number
  completions: Completion[]
  log_outcomes: Record<string, number>
}

export default function CpagripStatsPage() {
  const params = useParams()
  const locale = params.locale as string
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/admin/cpagrip-stats')
      .then(r => {
        if (r.status === 401) { router.push(`/${locale}/admin/login`); return null }
        return r.json()
      })
      .then(d => { if (d) { setStats(d); setLoading(false) } })
      .catch(() => { setError('Erreur de chargement'); setLoading(false) })
  }, [locale, router])

  if (loading) return (
    <div className="min-h-screen bg-cit-dark flex items-center justify-center">
      <p className="text-gray-500 animate-pulse">Chargement stats CPAGrip...</p>
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-cit-dark flex items-center justify-center">
      <p className="text-red-400">{error}</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-cit-dark text-white">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-bangers text-3xl text-gold-400">Stats CPAGrip</h1>
            <p className="text-gray-500 text-sm mt-1">Toutes éditions confondues</p>
          </div>
          <Link href={`/${locale}/admin/dashboard`} className="text-gray-400 text-sm hover:text-white transition-colors">
            ← Dashboard
          </Link>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Completions', value: stats?.total_completions ?? 0, color: 'text-green-400' },
            { label: 'Chances créditées', value: stats?.total_chances_credited ?? 0, color: 'text-gold-400' },
            { label: 'Revenus estimés', value: `$${(stats?.total_revenue_usd ?? 0).toFixed(2)}`, color: 'text-emerald-400' },
            { label: 'Payout moyen', value: `$${(stats?.avg_payout_usd ?? 0).toFixed(3)}`, color: 'text-blue-400' },
          ].map(kpi => (
            <div key={kpi.label} className="bg-cit-card border border-cit-border rounded-xl p-4 text-center">
              <p className={`font-bangers text-2xl ${kpi.color}`}>{kpi.value}</p>
              <p className="text-gray-500 text-xs mt-1">{kpi.label}</p>
            </div>
          ))}
        </div>

        {/* Log outcomes */}
        {stats?.log_outcomes && (
          <div className="bg-cit-card border border-cit-border rounded-xl p-5">
            <p className="font-bold text-white mb-3">Résumé des postbacks reçus</p>
            <div className="flex flex-wrap gap-3">
              {Object.entries(stats.log_outcomes).map(([outcome, count]) => (
                <div key={outcome} className={`px-3 py-1.5 rounded-full text-sm font-bold border ${
                  outcome === 'credited' ? 'bg-green-500/10 border-green-500/30 text-green-400' :
                  outcome === 'duplicate' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' :
                  outcome === 'rejected' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                  'bg-gray-500/10 border-gray-500/30 text-gray-400'
                }`}>
                  {outcome}: {count}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completions table */}
        <div className="bg-cit-card border border-cit-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-cit-border">
            <p className="font-bold text-white">
              Historique des completions ({stats?.total_completions ?? 0})
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-cit-border text-gray-500 text-xs uppercase">
                  <th className="px-4 py-3 text-left">Utilisateur</th>
                  <th className="px-4 py-3 text-left">Offer ID</th>
                  <th className="px-4 py-3 text-right">Payout</th>
                  <th className="px-4 py-3 text-right">Chances</th>
                  <th className="px-4 py-3 text-left">IP</th>
                  <th className="px-4 py-3 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {(stats?.completions ?? []).length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      Aucune completion pour le moment.
                    </td>
                  </tr>
                ) : (
                  (stats?.completions ?? []).map(c => (
                    <tr key={c.id} className="border-b border-cit-border/50 hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-white font-medium">{c.entries?.roblox_username ?? '—'}</p>
                        <p className="text-gray-500 text-xs">{c.entries?.email ?? c.entry_id.slice(0, 8) + '…'}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-400 font-mono text-xs">{c.offer_id}</td>
                      <td className="px-4 py-3 text-right text-emerald-400 font-bold">${c.payout_usd}</td>
                      <td className="px-4 py-3 text-right text-gold-400 font-bangers text-base">+{c.chances_credited}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs font-mono">{c.ip_address ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {new Date(c.created_at).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}
