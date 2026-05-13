'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, useParams } from 'next/navigation'
import Link from 'next/link'

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.033.052a19.98 19.98 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.201 13.201 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
    </svg>
  )
}

function YouTubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  )
}

type StatusData = {
  total_chances: number
  bonus_breakdown: {
    discord: number
    youtube: number
    cpagrip_completions: Array<{ offer_id: string; chances_credited: number; created_at: string }>
    cpagrip_total: number
    stripe_total: number
  }
  cpagrip_can_start: boolean
  total_paid_eur: number
  completed_action_ids: string[]
  active_actions: Array<{
    id: string
    label: string
    description: string | null
    icon: string
    url: string | null
    bonus_chances: number
    action_type: string
  }>
}

export default function BoosterPage() {
  const searchParams = useSearchParams()
  const params = useParams()
  const locale = params.locale as string

  const [entryId, setEntryId] = useState<string | null>(null)
  const [status, setStatus] = useState<StatusData | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [copied, setCopied] = useState(false)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [amount, setAmount] = useState(5)
  const [payLoading, setPayLoading] = useState(false)
  const [prevChances, setPrevChances] = useState<number | null>(null)
  const [notification, setNotification] = useState<string | null>(null)

  const fetchStatus = useCallback(async (eid: string) => {
    const res = await fetch(`/api/booster/status?entry_id=${eid}`)
    if (res.status === 404) { setNotFound(true); setLoading(false); return }
    const data = await res.json()
    setStatus(prev => {
      if (prev && data.total_chances > prev.total_chances) {
        const diff = data.total_chances - prev.total_chances
        setNotification(`+${diff} chances créditées ! Total : ${data.total_chances} 🎉`)
        setTimeout(() => setNotification(null), 5000)
      }
      return data
    })
    setPrevChances(data.total_chances)
    setLoading(false)
  }, [])

  useEffect(() => {
    const qId = searchParams.get('entry_id')
    const stored = typeof window !== 'undefined' ? localStorage.getItem('citgive_entry_id') : null
    const id = qId ?? stored
    if (!id) { setLoading(false); return }
    setEntryId(id)
    fetchStatus(id)
  }, [searchParams, fetchStatus])

  // Poll every 8s to catch postback credits
  useEffect(() => {
    if (!entryId) return
    const interval = setInterval(() => fetchStatus(entryId), 8000)
    return () => clearInterval(interval)
  }, [entryId, fetchStatus])

  async function handleComplete(actionId: string, actionUrl: string | null) {
    if (!entryId || !status) return
    if (status.completed_action_ids.includes(actionId) || pendingId === actionId) return
    if (actionUrl) window.open(actionUrl, '_blank')
    setPendingId(actionId)
    await new Promise(r => setTimeout(r, 4000))
    const res = await fetch('/api/bonus/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entry_id: entryId, bonus_action_id: actionId }),
    })
    const data = await res.json()
    if (res.ok || data.alreadyDone) {
      await fetchStatus(entryId)
    }
    setPendingId(null)
  }

  async function handlePay() {
    if (!entryId) return
    setPayLoading(true)
    const res = await fetch('/api/payment/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entry_id: entryId, amount_eur: amount }),
    })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    else { alert(data.error || 'Erreur paiement'); setPayLoading(false) }
  }

  function copyReferral() {
    if (!entryId) return
    const url = `${window.location.origin}/${locale}?ref=${entryId}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cit-dark flex items-center justify-center">
        <p className="text-gray-500 animate-pulse">Chargement...</p>
      </div>
    )
  }

  if (!entryId || notFound) {
    return (
      <div className="min-h-screen bg-cit-dark flex flex-col items-center justify-center gap-4 px-4">
        <span className="text-5xl">🎯</span>
        <p className="text-white font-bold text-lg text-center">Tu dois d&apos;abord t&apos;inscrire au giveaway.</p>
        <Link
          href={`/${locale}`}
          className="bg-gold-400 text-cit-dark font-bold px-6 py-3 rounded-xl hover:bg-gold-300 transition-colors"
        >
          S&apos;inscrire maintenant
        </Link>
      </div>
    )
  }

  const referralUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://citgive.com'}/${locale}?ref=${entryId}`

  return (
    <div className="min-h-screen bg-cit-dark text-white">
      {/* Toast notification */}
      {notification && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white font-bold px-6 py-3 rounded-full shadow-lg animate-bounce text-sm">
          ✓ {notification}
        </div>
      )}

      <div className="max-w-lg mx-auto px-4 py-8 space-y-6">

        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-gold-400/10 border border-gold-400/30 rounded-full px-4 py-1.5 mb-3">
            <span className="text-gold-400 text-sm font-bold">🎯 BOOSTE TES CHANCES</span>
          </div>
          {/* Chances counter */}
          <div className="bg-cit-card border border-cit-border rounded-2xl px-8 py-5 inline-flex items-center gap-4">
            <span className="font-bangers text-5xl text-gold-400">{status?.total_chances ?? 0}</span>
            <div className="text-left">
              <p className="text-white font-bold">chances actuelles</p>
              <p className="text-gray-500 text-xs">{status?.total_chances ?? 0}× plus de chances de gagner</p>
            </div>
          </div>
        </div>

        {/* Actions gratuites */}
        {(status?.active_actions ?? []).filter(a => a.action_type !== 'cpagrip' && a.action_type !== 'cpagrip_smart').length > 0 && (
          <div className="space-y-3">
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Actions gratuites</p>
            {status!.active_actions
              .filter(a => a.action_type !== 'cpagrip' && a.action_type !== 'cpagrip_smart')
              .map(action => {
                const done = status!.completed_action_ids.includes(action.id)
                const pending = pendingId === action.id
                return (
                  <div
                    key={action.id}
                    className={`flex items-center justify-between gap-4 rounded-xl px-4 py-3 border transition-all ${
                      done ? 'bg-green-500/10 border-green-500/30' : 'bg-cit-card border-cit-border hover:border-gold-400/50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {action.action_type === 'discord'
                        ? <DiscordIcon className="w-7 h-7 text-indigo-400 shrink-0" />
                        : action.action_type === 'youtube'
                        ? <YouTubeIcon className="w-7 h-7 text-red-500 shrink-0" />
                        : <span className="text-2xl shrink-0">{action.icon}</span>}
                      <div className="min-w-0">
                        <p className={`font-bold text-sm ${done ? 'text-green-400' : 'text-white'}`}>{action.label}</p>
                        {action.description && <p className="text-gray-500 text-xs truncate">{action.description}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`font-bangers text-lg ${done ? 'text-green-400' : 'text-gold-400'}`}>
                        {done ? '✓' : `+${action.bonus_chances}`}
                      </span>
                      {!done && (
                        <button
                          onClick={() => handleComplete(action.id, action.url)}
                          disabled={pending}
                          className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60 ${
                            action.action_type === 'youtube'
                              ? 'bg-red-600 hover:bg-red-500 text-white'
                              : action.action_type === 'discord'
                              ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                              : 'bg-gold-400 hover:bg-gold-300 text-cit-dark'
                          }`}
                        >
                          {pending ? '...' : action.action_type === 'youtube' ? "S'abonner" : 'Rejoindre'}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
          </div>
        )}

        {/* Parrainage */}
        <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🔗</span>
              <div>
                <p className="font-bold text-white text-sm">Parrainage</p>
                <p className="text-gray-500 text-xs">Ton ami s&apos;inscrit → +3 chances (cumulable)</p>
              </div>
            </div>
            <span className="font-bangers text-lg text-indigo-400">+3 / ami</span>
          </div>
          <div className="flex gap-2 mt-3">
            <input
              readOnly
              value={referralUrl}
              className="flex-1 cit-input rounded-lg px-3 py-2 text-xs text-gray-400 truncate"
            />
            <button
              onClick={copyReferral}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
                copied ? 'bg-green-500 text-white' : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
            >
              {copied ? 'Copié !' : 'Copier'}
            </button>
          </div>
        </div>

        {/* Offres CPAGrip */}
        <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/20 border border-green-500/30 rounded-xl p-5">
          <div className="flex items-start gap-3 mb-4">
            <span className="text-3xl">🎁</span>
            <div>
              <p className="font-bold text-white">Complète des offres partenaires</p>
              <p className="text-gray-400 text-sm mt-0.5">
                Gagne de 20 à 700+ chances par offre. Plus l&apos;offre est complète, plus tu gagnes.
              </p>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-green-300">
              <span>✓</span><span>Chances créditées automatiquement après validation</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-green-300">
              <span>✓</span><span>Tu peux compléter plusieurs offres différentes</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-green-300">
              <span>✓</span>
              <span>
                {status && status.bonus_breakdown.cpagrip_completions.length > 0
                  ? `${status.bonus_breakdown.cpagrip_completions.length} offre(s) déjà complétée(s) — +${status.bonus_breakdown.cpagrip_total} chances`
                  : '50+ offres disponibles dans ta région'}
              </span>
            </div>
          </div>

          {status?.cpagrip_can_start ? (
            <Link
              href={`/${locale}/booster/offres?entry_id=${entryId}`}
              className="block w-full text-center bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl transition-colors"
            >
              Voir les offres disponibles →
            </Link>
          ) : (
            <div className="text-center py-3 bg-gray-800/50 rounded-xl text-gray-400 text-sm">
              ⏳ Limite atteinte — Réessaie dans une heure
            </div>
          )}
        </div>

        {/* Stripe supporter */}
        <div className="fire-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">💎</span>
            <div>
              <p className="font-bold text-white text-sm">Devenir Supporter — 1€ = +100 chances</p>
              <p className="text-gray-500 text-xs">
                Multiplie tes chances + badge{' '}
                <span className="text-purple-300 font-bold">💎 Supporter</span> affiché publiquement
              </p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 mb-3">
            {[5, 20, 50, 100].map(v => (
              <button
                key={v}
                onClick={() => setAmount(v)}
                className={`py-2 rounded-lg text-sm font-bold transition-all ${
                  amount === v
                    ? 'bg-gold-400 text-cit-dark'
                    : 'bg-cit-card border border-cit-border text-gray-400 hover:border-gold-400/50'
                }`}
              >
                {v}€
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 mb-3">
            <input
              type="range"
              min={1}
              max={100}
              value={amount}
              onChange={e => setAmount(Number(e.target.value))}
              className="flex-1 accent-yellow-400"
            />
          </div>

          <div className="bg-cit-dark/50 rounded-lg px-3 py-2 mb-3 flex justify-between text-sm">
            <span className="text-gray-400">Montant :</span>
            <span className="text-white font-bold">{amount}€</span>
            <span className="text-gray-400">Chances :</span>
            <span className="text-gold-400 font-bangers text-base">+{amount * 100}</span>
          </div>

          {(status?.total_paid_eur ?? 0) > 0 && (
            <p className="text-xs text-green-400 mb-2">
              ✓ Tu as déjà boosted pour {status!.total_paid_eur}€ ({status!.bonus_breakdown.stripe_total} chances)
            </p>
          )}

          <button
            onClick={handlePay}
            disabled={payLoading}
            className="btn-fire w-full rounded-xl py-3 font-bangers text-xl text-cit-dark disabled:opacity-60"
          >
            {payLoading ? 'Redirection...' : `BOOSTER POUR ${amount}€ → +${amount * 100} CHANCES`}
          </button>

          <p className="text-xs text-gray-600 text-center mt-2">
            Paiement sécurisé Stripe •{' '}
            <Link href={`/${locale}/cgv`} target="_blank" className="underline hover:text-gray-400">
              CGV
            </Link>
          </p>
        </div>

        <div className="text-center">
          <Link href={`/${locale}`} className="text-gray-500 text-sm hover:text-gray-300 transition-colors">
            ← Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  )
}
