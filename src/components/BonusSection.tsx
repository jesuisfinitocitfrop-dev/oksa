'use client'

import { useEffect, useState } from 'react'
import { SupporterBadge } from '@/components/SupportersBadge'

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

type BonusAction = {
  id: string
  label: string
  description: string | null
  icon: string
  url: string | null
  bonus_chances: number
  action_type: string
}

const CPAGRIP_LINKS = {
  android: 'https://singingfiles.com/show.php?l=0&u=2525665&id=72905',
  ios: 'https://singingfiles.com/show.php?l=0&u=2525665&id=70876',
  desktop: 'https://singingfiles.com/show.php?l=0&u=2525665&id=70906',
}

function getCPAGripUrl(smartLinkUrl: string | null): string {
  if (typeof window === 'undefined') return smartLinkUrl ?? ''
  const ua = navigator.userAgent
  if (/Android/i.test(ua)) return CPAGRIP_LINKS.android
  if (/iPhone|iPad|iPod/i.test(ua)) return CPAGRIP_LINKS.ios
  return CPAGRIP_LINKS.desktop
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
  const [cpagripDone, setCpagripDone] = useState(false)
  const [cpagripPending, setCpagripPending] = useState(false)
  const [smartLinkDone, setSmartLinkDone] = useState(false)
  const [smartLinkPending, setSmartLinkPending] = useState(false)
  const [pubClickCounts, setPubClickCounts] = useState<Record<string, number>>({})
  const [hardcodedPubClicks, setHardcodedPubClicks] = useState(0)
  const [hardcodedPubDone, setHardcodedPubDone] = useState(false)
  const [hardcodedPubPending, setHardcodedPubPending] = useState(false)
  // pub_click répétable — compteur de clics session + cooldown
  const [pubClickSessionCounts, setPubClickSessionCounts] = useState<Record<string, number>>({})
  const [pubClickCooldowns, setPubClickCooldowns] = useState<Record<string, boolean>>({})
  const [hardcodedPubClickCount, setHardcodedPubClickCount] = useState(0)
  const [hardcodedPubClickCooldown, setHardcodedPubClickCooldown] = useState(false)
  const [hardcodedPubClickPending, setHardcodedPubClickPending] = useState(false)

  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://citgive.com'
  const referralUrl = `${siteUrl}?ref=${referralToken}`

  useEffect(() => {
    fetch(`/api/bonus/actions?edition_id=${editionId}&entry_id=${entryId}`)
      .then(r => r.json())
      .then(d => {
        const actionsData: BonusAction[] = d.actions ?? []
        setActions(actionsData)
        setCompletedIds(d.completedIds ?? [])
        setTotalChances(d.totalChances ?? 1)
        setTotalPaid(d.totalPaid ?? 0)
        const counts: Record<string, number> = {}
        actionsData.forEach(a => {
          if (a.action_type === 'pub') {
            const key = `pub_clicks_${entryId}_${a.id}`
            counts[a.id] = parseInt(localStorage.getItem(key) || '0')
          }
        })
        setPubClickCounts(counts)
        const hClicks = parseInt(localStorage.getItem(`pub_clicks_${entryId}_hardcoded`) || '0')
        setHardcodedPubClicks(hClicks)
        setLoading(false)
      })
  }, [editionId, entryId])

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

  async function handleCPAGrip(offerType: 'cpagrip' | 'cpagrip_smart') {
    const isDone = offerType === 'cpagrip_smart' ? smartLinkDone : cpagripDone
    const isPending = offerType === 'cpagrip_smart' ? smartLinkPending : cpagripPending
    if (isDone || isPending) return
    if (offerType === 'cpagrip_smart') setSmartLinkPending(true)
    else setCpagripPending(true)
    const res = await fetch('/api/bonus/cpagrip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entry_id: entryId, offer_type: offerType }),
    })
    const data = await res.json()
    if (res.ok || data.alreadyDone) {
      if (offerType === 'cpagrip_smart') setSmartLinkDone(true)
      else setCpagripDone(true)
      if (data.newChances) setTotalChances(data.newChances)
    }
    if (offerType === 'cpagrip_smart') setSmartLinkPending(false)
    else setCpagripPending(false)
  }

  async function handleHardcodedPub() {
    if (hardcodedPubDone || hardcodedPubPending) return
    const next = hardcodedPubClicks + 1
    const key = `pub_clicks_${entryId}_hardcoded`
    if (next >= 33) {
      localStorage.removeItem(key)
      setHardcodedPubClicks(33)
      setHardcodedPubPending(true)
      const res = await fetch('/api/bonus/cpagrip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entry_id: entryId, offer_type: 'pub' }),
      })
      const data = await res.json()
      if (res.ok || data.alreadyDone) {
        setHardcodedPubDone(true)
        if (data.newChances) setTotalChances(data.newChances)
      }
      setHardcodedPubPending(false)
    } else {
      localStorage.setItem(key, String(next))
      setHardcodedPubClicks(next)
    }
  }

  async function handlePubClickAction(actionId: string | null) {
    const cooldownKey = actionId ?? 'hardcoded'
    if (pubClickCooldowns[cooldownKey] || hardcodedPubClickCooldown) return

    // Activer le cooldown de 5s
    if (actionId) {
      setPubClickCooldowns(prev => ({ ...prev, [actionId]: true }))
      setTimeout(() => setPubClickCooldowns(prev => ({ ...prev, [actionId]: false })), 5000)
    } else {
      setHardcodedPubClickCooldown(true)
      setTimeout(() => setHardcodedPubClickCooldown(false), 5000)
    }

    if (!actionId) setHardcodedPubClickPending(true)

    const body: Record<string, string> = { entry_id: entryId }
    if (actionId) body.action_id = actionId

    const res = await fetch('/api/bonus/pub-click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json()

    if (res.ok) {
      if (data.newChances) setTotalChances(data.newChances)
      if (actionId) {
        setPubClickSessionCounts(prev => ({ ...prev, [actionId]: (prev[actionId] ?? 0) + 1 }))
      } else {
        setHardcodedPubClickCount(prev => prev + 1)
      }
    }

    if (!actionId) setHardcodedPubClickPending(false)
  }

  function handlePubClick(action: BonusAction) {
    if (completedIds.includes(action.id) || pendingId === action.id) return
    const clicksRequired = parseInt(action.description || '33')
    const current = pubClickCounts[action.id] || 0
    const next = current + 1
    const key = `pub_clicks_${entryId}_${action.id}`
    if (next >= clicksRequired) {
      localStorage.removeItem(key)
      setPubClickCounts(prev => ({ ...prev, [action.id]: clicksRequired }))
      setTimeout(() => handleComplete(action.id), 500)
    } else {
      localStorage.setItem(key, String(next))
      setPubClickCounts(prev => ({ ...prev, [action.id]: next }))
    }
  }

  function copyReferral() {
    navigator.clipboard.writeText(referralUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const isSupporter = totalPaid > 0

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
            if (action.action_type === 'cpagrip' || action.action_type === 'cpagrip_smart') return null

            const done = completedIds.includes(action.id)
            const pending = pendingId === action.id

            if (action.action_type === 'pub') {
              const clicksRequired = parseInt(action.description || '33')
              const currentClicks = pubClickCounts[action.id] || 0
              const progress = Math.min((currentClicks / clicksRequired) * 100, 100)
              return (
                <div key={action.id} className={`rounded-xl border overflow-hidden transition-all ${done ? 'bg-green-500/10 border-green-500/30' : 'bg-cit-card border-cit-border'}`}>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-2xl shrink-0">📺</span>
                        <div className="min-w-0">
                          <p className={`font-bold text-sm ${done ? 'text-green-400' : 'text-white'}`}>{action.label}</p>
                          <p className="text-gray-500 text-xs">Clique {clicksRequired} fois — offre gratuite</p>
                        </div>
                      </div>
                      <span className={`font-bangers text-lg shrink-0 ${done ? 'text-green-400' : 'text-gold-400'}`}>
                        {done ? '✓' : `+${action.bonus_chances}`}
                      </span>
                    </div>
                    {done ? (
                      <p className="text-green-400 text-sm font-bold text-center">✓ Complété ! +{action.bonus_chances} chances ajoutées</p>
                    ) : (
                      <>
                        <div className="mb-3">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Progression</span>
                            <span>{currentClicks}/{clicksRequired} clics</span>
                          </div>
                          <div className="h-2.5 bg-cit-dark rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 rounded-full transition-all duration-300"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                        <a
                          href={action.url || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => handlePubClick(action)}
                          className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-2.5 rounded-lg transition-colors text-sm"
                        >
                          {pending ? '...' : 'Continuer →'}
                        </a>
                      </>
                    )}
                  </div>
                </div>
              )
            }

            if (action.action_type === 'pub_click') {
              const sessionClicks = pubClickSessionCounts[action.id] ?? 0
              const onCooldown = !!pubClickCooldowns[action.id]
              return (
                <div key={action.id} className="bg-cit-card border border-cit-border hover:border-gold-400/50 rounded-xl px-4 py-3 border transition-all">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-2xl shrink-0">🖱️</span>
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-white">{action.label}</p>
                        <p className="text-gray-500 text-xs">
                          1 clic = +{action.bonus_chances} chance{action.bonus_chances > 1 ? 's' : ''}
                          {sessionClicks > 0 && (
                            <span className="text-gold-400 ml-1">• {sessionClicks} clic{sessionClicks > 1 ? 's' : ''} (+{sessionClicks * action.bonus_chances} cette session)</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-bangers text-lg text-gold-400">+{action.bonus_chances}</span>
                      {action.url && (
                        <a
                          href={action.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setTimeout(() => handlePubClickAction(action.id), 2000)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                            onCooldown
                              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                              : 'bg-purple-600 hover:bg-purple-500 text-white'
                          }`}
                        >
                          {onCooldown ? '⏳ Attends...' : 'Cliquer →'}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )
            }

            const isYoutube = action.action_type === 'youtube'
            const isCPAGrip = action.action_type === 'cpagrip'
            const actionUrl = isCPAGrip ? getCPAGripUrl(action.url) : action.url

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
                  {action.action_type === 'discord'
                    ? <DiscordIcon className="w-7 h-7 text-indigo-400 shrink-0" />
                    : action.action_type === 'youtube'
                    ? <YouTubeIcon className="w-7 h-7 text-red-500 shrink-0" />
                    : <span className="text-2xl shrink-0">{action.icon}</span>
                  }
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
                  {!done && actionUrl && (
                    <a
                      href={actionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setTimeout(() => handleComplete(action.id), 3000)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                        isYoutube
                          ? 'bg-red-600 hover:bg-red-500 text-white'
                          : action.action_type === 'discord'
                          ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                          : action.action_type === 'cpagrip'
                          ? 'bg-green-600 hover:bg-green-500 text-white'
                          : 'bg-gold-400 hover:bg-gold-300 text-cit-dark'
                      }`}
                    >
                      {isYoutube ? "S'abonner" : action.action_type === 'cpagrip' ? 'Obtenir' : 'Rejoindre'}
                    </a>
                  )}
                  {!done && !action.url && (
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

      {/* Pub — barre de progression 33 clics */}
      {!actions.some(a => a.action_type === 'pub') && (
        <div className={`rounded-xl border overflow-hidden transition-all ${hardcodedPubDone ? 'bg-green-500/10 border-green-500/30' : 'bg-cit-card border-cit-border'}`}>
          <div className="p-4">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-2xl shrink-0">📺</span>
                <div className="min-w-0">
                  <p className={`font-bold text-sm ${hardcodedPubDone ? 'text-green-400' : 'text-white'}`}>Regarde une pub</p>
                  <p className="text-gray-500 text-xs">Clique 33 fois — offre gratuite</p>
                </div>
              </div>
              <span className={`font-bangers text-lg shrink-0 ${hardcodedPubDone ? 'text-green-400' : 'text-gold-400'}`}>
                {hardcodedPubDone ? '✓' : '+100'}
              </span>
            </div>
            {hardcodedPubDone ? (
              <p className="text-green-400 text-sm font-bold text-center">✓ Complété ! +100 chances ajoutées</p>
            ) : (
              <>
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progression</span>
                    <span>{hardcodedPubClicks}/33 clics</span>
                  </div>
                  <div className="h-2.5 bg-cit-dark rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((hardcodedPubClicks / 33) * 100, 100)}%` }}
                    />
                  </div>
                </div>
                <a
                  href="https://plump-plastic.com/0mtgIQ"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleHardcodedPub}
                  className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-2.5 rounded-lg transition-colors text-sm"
                >
                  {hardcodedPubPending ? '...' : 'Continuer →'}
                </a>
              </>
            )}
          </div>
        </div>
      )}

      {/* Pub click — répétable, 1 clic = N chances */}
      {!actions.some(a => a.action_type === 'pub_click') && (
        <div className="bg-cit-card border border-cit-border hover:border-gold-400/50 rounded-xl px-4 py-3 transition-all">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-2xl shrink-0">🖱️</span>
              <div className="min-w-0">
                <p className="font-bold text-sm text-white">1 clic = 1 chance de plus</p>
                <p className="text-gray-500 text-xs">
                  Clique autant de fois que tu veux !
                  {hardcodedPubClickCount > 0 && (
                    <span className="text-gold-400 ml-1">• {hardcodedPubClickCount} clic{hardcodedPubClickCount > 1 ? 's' : ''} (+{hardcodedPubClickCount} cette session)</span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="font-bangers text-lg text-gold-400">+1</span>
              <a
                href="https://plump-plastic.com/0mtgIQ"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setTimeout(() => handlePubClickAction(null), 2000)}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                  hardcodedPubClickCooldown
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-500 text-white'
                }`}
              >
                {hardcodedPubClickPending ? '...' : hardcodedPubClickCooldown ? '⏳ Attends...' : 'Cliquer →'}
              </a>
            </div>
          </div>
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
