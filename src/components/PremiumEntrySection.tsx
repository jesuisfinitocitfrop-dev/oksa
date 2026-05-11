'use client'

import { useEffect, useState } from 'react'

const TIERS = [
  {
    id: 'starter' as const,
    price: 5,
    badge: '🎫',
    giveaways: 1,
    bonusChances: 0,
    color: 'from-blue-500/20 to-blue-600/5',
    border: 'border-blue-500/40',
    ring: 'ring-blue-500/50',
    btnColor: 'from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500',
  },
  {
    id: 'plus' as const,
    price: 9,
    badge: '💎',
    giveaways: 4,
    bonusChances: 0,
    popular: true,
    color: 'from-purple-500/20 to-purple-600/5',
    border: 'border-purple-500/40',
    ring: 'ring-purple-500/50',
    btnColor: 'from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500',
  },
  {
    id: 'vip' as const,
    price: 19,
    badge: '👑',
    giveaways: -1,
    bonusChances: 1000,
    color: 'from-amber-500/20 to-amber-600/5',
    border: 'border-amber-400/50',
    ring: 'ring-amber-400/50',
    btnColor: 'from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400',
  },
]

type SubscriptionStatus = {
  id: string
  tier: string
  status: string
  giveaways_remaining: number
  bonus_chances: number
} | null

export default function PremiumEntrySection({
  edition,
  locale,
}: {
  edition: { id: string; prize_name: string } | null
  locale: string
}) {
  const [email, setEmail] = useState('')
  const [roblox, setRoblox] = useState('')
  const [selectedTier, setSelectedTier] = useState<'starter' | 'plus' | 'vip'>('plus')
  const [loading, setLoading] = useState(false)
  const [pollLoading, setPollLoading] = useState(false)
  const [subscription, setSubscription] = useState<SubscriptionStatus>(null)
  const [enteredChances, setEnteredChances] = useState<number | null>(null)
  const [enterStatus, setEnterStatus] = useState<'idle' | 'loading' | 'success' | 'already' | 'error'>('idle')
  const [subscriptionSuccess, setSubscriptionSuccess] = useState(false)

  // Detect return from Stripe subscription checkout
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const subStatus = params.get('subscription')
    const paramEmail = params.get('email')
    const paramRoblox = params.get('roblox')
    const paramTier = params.get('tier')

    if (subStatus === 'success' && paramEmail) {
      setEmail(paramEmail)
      if (paramRoblox) setRoblox(paramRoblox)
      if (paramTier && ['starter', 'plus', 'vip'].includes(paramTier)) {
        setSelectedTier(paramTier as 'starter' | 'plus' | 'vip')
      }
      setSubscriptionSuccess(true)
      window.history.replaceState({}, '', window.location.pathname)

      // Poll for subscription (webhook may still be processing)
      setPollLoading(true)
      pollSubscription(paramEmail, 0)
    }
  }, [])

  async function pollSubscription(emailToCheck: string, attempt: number) {
    if (attempt > 10) {
      setPollLoading(false)
      return
    }
    try {
      const res = await fetch(`/api/subscription/status?email=${encodeURIComponent(emailToCheck)}`)
      const data = await res.json()
      if (data.subscription) {
        setSubscription(data.subscription)
        setPollLoading(false)
        return
      }
    } catch {}
    setTimeout(() => pollSubscription(emailToCheck, attempt + 1), 1000)
  }

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return
    setLoading(true)
    try {
      const res = await fetch('/api/subscription/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, roblox_username: roblox, tier: selectedTier, locale }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch {
      setLoading(false)
    }
  }

  async function handleEnter() {
    if (!subscription || !edition || enterStatus === 'loading') return
    setEnterStatus('loading')
    try {
      const res = await fetch('/api/premium/enter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          roblox_username: roblox,
          edition_id: edition.id,
          subscription_id: subscription.id,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setEnteredChances(data.chances)
        setEnterStatus('success')
      } else if (data.error === 'ALREADY_ENTERED') {
        setEnteredChances(data.chances)
        setEnterStatus('already')
      } else if (data.error === 'NO_SLOTS') {
        setEnterStatus('error')
      } else {
        setEnterStatus('error')
      }
    } catch {
      setEnterStatus('error')
    }
  }

  // After subscription success, show loading then entry
  if (subscriptionSuccess && pollLoading) {
    return (
      <div className="max-w-md mx-auto text-center py-10">
        <div className="text-4xl mb-4 animate-spin">⚙️</div>
        <p className="text-gray-400 text-sm">Activation de ton abonnement...</p>
      </div>
    )
  }

  if (subscriptionSuccess && subscription) {
    const tierInfo = TIERS.find(t => t.id === subscription.tier)

    if (enterStatus === 'success' || enterStatus === 'already') {
      return (
        <div className="max-w-md mx-auto text-center py-8 animate-scale-in">
          <div className="text-6xl mb-4">🎃</div>
          <h3 className="font-bangers text-3xl text-orange-400 mb-2">
            {enterStatus === 'already' ? 'Déjà inscrit !' : 'Inscrit au giveaway !'}
          </h3>
          <p className="text-gray-400 text-sm mb-2">
            Tu participes avec <span className="text-gold-400 font-bold">{enteredChances?.toLocaleString()} chance{(enteredChances ?? 1) > 1 ? 's' : ''}</span> de gagner le Headless Horseman.
          </p>
          <p className="text-gray-600 text-xs">Bonne chance ! 🤞</p>
        </div>
      )
    }

    return (
      <div className="max-w-md mx-auto animate-scale-in">
        <div className="bg-gradient-to-b from-green-500/10 to-transparent border border-green-500/30 rounded-2xl p-5 mb-5 text-center">
          <div className="text-3xl mb-2">✅</div>
          <p className="text-green-400 font-semibold text-sm">
            Abonnement {tierInfo?.id.toUpperCase()} activé !
          </p>
          <p className="text-gray-400 text-xs mt-1">
            {subscription.tier !== 'vip'
              ? `${subscription.giveaways_remaining} giveaway${subscription.giveaways_remaining > 1 ? 's' : ''} disponible${subscription.giveaways_remaining > 1 ? 's' : ''} ce mois`
              : 'Giveaways illimités + +1 000 chances par giveaway'}
          </p>
        </div>

        {edition ? (
          <div>
            <p className="text-gray-300 text-sm text-center mb-4">
              Prêt à participer au giveaway <span className="text-orange-400 font-semibold">{edition.prize_name}</span> ?
            </p>
            {enterStatus === 'error' && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-3 text-center">
                <p className="text-red-400 text-sm">Une erreur s&apos;est produite. Réessaie.</p>
              </div>
            )}
            <button
              onClick={handleEnter}
              disabled={enterStatus === 'loading'}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-bangers text-xl px-6 py-4 rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {enterStatus === 'loading' ? '⏳ Inscription...' : '🎃 PARTICIPER AU GIVEAWAY PREMIUM'}
            </button>
          </div>
        ) : (
          <p className="text-gray-500 text-sm text-center">
            Aucun giveaway premium actif pour le moment. Ton abonnement sera utilisé dès le prochain giveaway.
          </p>
        )}
      </div>
    )
  }

  // Default: subscription form
  return (
    <div className="max-w-md mx-auto">
      <h2 className="font-bangers text-2xl md:text-3xl text-white text-center mb-6">
        S&apos;ABONNER
      </h2>

      {/* Tier selector */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {TIERS.map(tier => (
          <button
            key={tier.id}
            onClick={() => setSelectedTier(tier.id)}
            className={`relative rounded-xl p-4 border text-left transition-all bg-gradient-to-b ${tier.color} ${tier.border} ${
              selectedTier === tier.id ? `ring-2 ${tier.ring} scale-[1.02]` : 'opacity-70 hover:opacity-90'
            }`}
          >
            {tier.popular && (
              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-purple-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap uppercase">
                Populaire
              </div>
            )}
            <div className="text-2xl mb-1">{tier.badge}</div>
            <div className="font-bangers text-white text-sm">{tier.id.toUpperCase()}</div>
            <div className="font-bangers text-gold-400 text-xl">{tier.price}€</div>
            <div className="text-gray-400 text-[10px]">/mois</div>
            <div className="text-gray-300 text-[10px] mt-1 leading-snug">
              {tier.giveaways === -1 ? '∞ giveaways' : `${tier.giveaways} giveaway${tier.giveaways > 1 ? 's' : ''}/mois`}
              {tier.bonusChances > 0 && <><br />+{tier.bonusChances.toLocaleString()} chances</>}
            </div>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubscribe} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Adresse email</label>
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="ton@email.com"
            className="cit-input w-full rounded-xl px-4 py-3 text-sm"
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Pseudo Roblox</label>
          <input
            type="text"
            required
            value={roblox}
            onChange={e => setRoblox(e.target.value)}
            placeholder="TonPseudoRoblox"
            className="cit-input w-full rounded-xl px-4 py-3 text-sm"
            disabled={loading}
            minLength={3}
            maxLength={20}
          />
        </div>

        {/* Selected tier summary */}
        {(() => {
          const t = TIERS.find(t => t.id === selectedTier)!
          return (
            <div className={`rounded-xl border ${t.border} bg-gradient-to-b ${t.color} px-4 py-3 text-sm text-gray-300`}>
              <span className="font-semibold text-white">{t.badge} {t.id.toUpperCase()} — {t.price}€/mois :</span>{' '}
              {t.giveaways === -1 ? 'Giveaways illimités' : `${t.giveaways} giveaway${t.giveaways > 1 ? 's' : ''} premium/mois`}
              {t.bonusChances > 0 ? ` + +${t.bonusChances.toLocaleString()} chances` : ''}
            </div>
          )
        })()}

        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-gradient-to-r ${TIERS.find(t => t.id === selectedTier)?.btnColor} text-white font-bangers text-xl px-6 py-4 rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed`}
        >
          {loading ? '⏳ Redirection...' : `🏇 S'ABONNER ${selectedTier.toUpperCase()} — ${TIERS.find(t => t.id === selectedTier)?.price}€/MOIS`}
        </button>

        <p className="text-xs text-gray-600 text-center">
          Résiliation possible à tout moment • Paiement sécurisé via Stripe
        </p>
      </form>
    </div>
  )
}
