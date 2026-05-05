'use client'

import { useEffect, useState } from 'react'
import { SupporterBadge } from '@/components/SupportersBadge'

type BonusAction = {
  id: string
  label: string
  description: string | null
  icon: string
  url: string | null
  bonus_chances: number
  action_type: string
}

export default function BonusSection({
  editionId,
  entryId,
  referralToken,
  locale,
  paymentSuccess = false,
}: {
  editionId: string
  entryId: string
  referralToken: string
  locale: string
  paymentSuccess?: boolean
}) {
  const [actions, setActions] = useState<BonusAction[]>([])
  const [completedIds, setCompletedIds] = useState<string[]>([])
  const [totalChances, setTotalChances] = useState(1)
  const [totalPaid, setTotalPaid] = useState(0)
  const [loading, setLoading] = useState(true)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [amount, setAmount] = useState(5)
  const [payLoading, setPayLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [youtubeStatus, setYoutubeStatus] = useState<'success' | 'not_subscribed' | 'error' | 'cancelled' | null>(null)

  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://citgive.com'
  const referralUrl = `${siteUrl}?ref=${referralToken}`

  useEffect(() => {
    fetch(`/api/bonus/actions?edition_id=${editionId}&entry_id=${entryId}`)
      .then(r => r.json())
      .then(d => {
        setActions(d.actions ?? [])
        setCompletedIds(d.completedIds ?? [])
        setTotalChances(d.totalChances ?? 1)
        setTotalPaid(d.totalPaid ?? 0)
        setLoading(false)
      })
  }, [editionId, entryId])

  // Handle YouTube OAuth return
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const yt = params.get('youtube')
    const actionId = params.get('action_id')

    if (yt) {
      setYoutubeStatus(yt as typeof youtubeStatus)
      if (yt === 'success' && actionId) {
        setCompletedIds(prev => prev.includes(actionId) ? prev : [...prev, actionId])
        // Refresh chances from server
        fetch(`/api/bonus/actions?edition_id=${editionId}&entry_id=${entryId}`)
          .then(r => r.json())
          .then(d => { if (d.totalChances) setTotalChances(d.totalChances) })
      }
      // Clean URL
      const clean = new URL(window.location.href)
      clean.searchParams.delete('youtube')
      clean.searchParams.delete('action_id')
      window.history.replaceState({}, '', clean.toString())
    }
  }, [editionId, entryId])

  function handleYoutubeAction(action: BonusAction) {
    const returnUrl = typeof window !== 'undefined' ? window.location.href : '/'
    window.location.href = `/api/bonus/youtube/start?entry_id=${entryId}&action_id=${action.id}&return_url=${encodeURIComponent(returnUrl)}`
  }

  async function handleComplete(actionId: string) {
    if (completedIds.includes(actionId) || pendingId === actionId) return
    setPendingId(actionId)
    const res = await fetch('/api/bonus/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entry_id: entryId, bonus_action_id: actionId }),
    })
    const data = await res.json()
    if (res.ok || data.alreadyDone) {
      setCompletedIds(prev => [...prev, actionId])
      if (data.newChances) setTotalChances(data.newChances)
    }
    setPendingId(null)
  }

  async function handlePay() {
    setPayLoading(true)
    const res = await fetch('/api/payment/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entry_id: entryId, amount_eur: amount }),
    })
    const data = await res.json()
    if (data.url) {
      window.location.href = data.url
    } else {
      alert(data.error || 'Erreur paiement')
      setPayLoading(false)
    }
  }

  function copyReferral() {
    navigator.clipboard.writeText(referralUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const hasCompletedAction = completedIds.length > 0
  const isSupporter = totalPaid > 0 || hasCompletedAction

  if (loading) {
    return (
      <div className="text-center py-8 text-gray-500 text-sm animate-pulse">
        Chargement des bonus...
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-slide-in">

      {/* Confirmation paiement */}
      {paymentSuccess && (
        <div className="bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-500/40 rounded-xl px-5 py-4 flex items-center gap-4">
          <span className="text-3xl shrink-0">💎</span>
          <div>
            <p className="font-bold text-purple-300 text-base">Paiement reçu — Badge Supporter activé !</p>
            <p className="text-gray-400 text-xs mt-0.5">
              Tes chances ont été mises à jour. Tu apparais maintenant dans la section Supporters.
            </p>
          </div>
        </div>
      )}

      {/* Confirmation abonnement YouTube */}
      {youtubeStatus === 'success' && (
        <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/40 rounded-xl px-5 py-4 flex items-center gap-4">
          <span className="text-3xl shrink-0">✅</span>
          <div>
            <p className="font-bold text-green-300 text-base">Abonnement vérifié — Chances ajoutées !</p>
            <p className="text-gray-400 text-xs mt-0.5">Merci de soutenir la chaîne CIT !</p>
          </div>
        </div>
      )}

      {youtubeStatus === 'not_subscribed' && (
        <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/40 rounded-xl px-5 py-4 flex items-center gap-4">
          <span className="text-3xl shrink-0">⚠️</span>
          <div>
            <p className="font-bold text-red-300 text-base">Abonnement non détecté</p>
            <p className="text-gray-400 text-xs mt-0.5">
              Abonne-toi à la chaîne YouTube puis réessaie.
            </p>
          </div>
        </div>
      )}

      {/* Header avec badge */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-gold-400/10 border border-gold-400/30 rounded-full px-4 py-1.5 mb-3">
          <span className="text-gold-400 text-sm font-bold">🎯 BONUS — AUGMENTE TES CHANCES</span>
        </div>
        <div className="bg-cit-card border border-cit-border rounded-2xl px-6 py-4 inline-flex items-center gap-3">
          <span className="font-bangers text-4xl text-gold-400">{totalChances}</span>
          <div className="text-left">
            <p className="text-white font-bold text-sm">chances actuelles</p>
            <p className="text-gray-500 text-xs">= {totalChances}x plus de chances de gagner</p>
          </div>
        </div>
        {isSupporter && (
          <div className="mt-3">
            <SupporterBadge amount={totalPaid} />
          </div>
        )}
      </div>

      {/* Bonus actions */}
      {actions.length > 0 && (
        <div className="space-y-3">
          {actions.map(action => {
            const done = completedIds.includes(action.id)
            const pending = pendingId === action.id
            const isYoutube = action.action_type === 'youtube'

            return (
              <div
                key={action.id}
                className={`flex items-center justify-between gap-4 rounded-xl px-4 py-3 border transition-all ${
                  done
                    ? 'bg-green-500/10 border-green-500/30'
                    : 'bg-cit-card border-cit-border hover:border-gold-400/50'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-2xl shrink-0">{action.icon}</span>
                  <div className="min-w-0">
                    <p className={`font-bold text-sm ${done ? 'text-green-400' : 'text-white'}`}>
                      {action.label}
                    </p>
                    {action.description && (
                      <p className="text-gray-500 text-xs truncate">{action.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`font-bangers text-lg ${done ? 'text-green-400' : 'text-gold-400'}`}>
                    {done ? '✓' : `+${action.bonus_chances}`}
                  </span>
                  {!done && isYoutube && (
                    <button
                      onClick={() => handleYoutubeAction(action)}
                      className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                    >
                      S&apos;abonner
                    </button>
                  )}
                  {!done && !isYoutube && action.url && (
                    <>
                      <a
                        href={action.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setTimeout(() => handleComplete(action.id), 3000)}
                        className="bg-gold-400 text-cit-dark text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-gold-300 transition-colors"
                      >
                        Rejoindre
                      </a>
                    </>
                  )}
                  {!done && !isYoutube && !action.url && (
                    <button
                      onClick={() => handleComplete(action.id)}
                      disabled={pending}
                      className="bg-gold-400 text-cit-dark text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-gold-300 transition-colors disabled:opacity-60"
                    >
                      {pending ? '...' : 'Valider'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Referral */}
      <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔗</span>
            <div>
              <p className="font-bold text-white text-sm">Partager avec un ami</p>
              <p className="text-gray-500 text-xs">Ton ami s&apos;inscrit → tu gagnes +3 chances (cumulable)</p>
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

      {/* Payment boost */}
      <div className="fire-border rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">💎</span>
          <div>
            <p className="font-bold text-white text-sm">Boost de chances — 1€ = +100 chances</p>
            <p className="text-gray-500 text-xs">
              Multiplie tes chances + obtiens le badge{' '}
              <span className="text-purple-300 font-bold">💎 Supporter</span> affiché publiquement si tu gagnes
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
          <span className="text-gray-400">Chances ajoutées :</span>
          <span className="text-gold-400 font-bangers text-base">+{amount * 100}</span>
        </div>

        {totalPaid > 0 && (
          <p className="text-xs text-green-400 mb-2">✓ Tu as déjà boosted pour {totalPaid}€ ({totalPaid * 100} chances)</p>
        )}

        <button
          onClick={handlePay}
          disabled={payLoading}
          className="btn-fire w-full rounded-xl py-3 font-bangers text-xl text-cit-dark disabled:opacity-60"
        >
          <span>{payLoading ? 'Redirection...' : `BOOSTER POUR ${amount}€ → +${amount * 100} CHANCES`}</span>
        </button>

        <p className="text-xs text-gray-600 text-center mt-2">
          Paiement sécurisé Stripe • Visa / Mastercard / CB •{' '}
          <a href="/cgv" target="_blank" className="underline hover:text-gray-400 transition-colors">
            Aucune récompense garantie — CGV
          </a>
        </p>
      </div>
    </div>
  )
}
