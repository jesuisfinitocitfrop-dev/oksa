'use client'

import { useEffect, useRef, useState } from 'react'
import { useSearchParams, useParams } from 'next/navigation'
import Link from 'next/link'

export default function OffresPage() {
  const searchParams = useSearchParams()
  const params = useParams()
  const locale = params.locale as string

  const [entryId, setEntryId] = useState<string | null>(null)
  const [step, setStep] = useState<'info' | 'loading' | 'offerwall' | 'error'>('info')
  const [errorMsg, setErrorMsg] = useState('')
  const offerwallRef = useRef<HTMLDivElement>(null)
  const scriptInjectedRef = useRef(false)

  useEffect(() => {
    const qId = searchParams.get('entry_id')
    const stored = typeof window !== 'undefined' ? localStorage.getItem('citgive_entry_id') : null
    setEntryId(qId ?? stored)
  }, [searchParams])

  async function handleStart() {
    if (!entryId) {
      setErrorMsg('Inscription introuvable. Retourne sur la page principale.')
      setStep('error')
      return
    }

    setStep('loading')

    try {
      const res = await fetch(`/api/booster/offerwall-url?entry_id=${entryId}`)
      const data = await res.json()

      if (res.status === 429 || data.cooldown) {
        setErrorMsg('Trop de tentatives. Réessaie dans une heure.')
        setStep('error')
        return
      }

      if (!res.ok || !data.url) {
        setErrorMsg(data.error ?? 'Erreur lors du chargement des offres.')
        setStep('error')
        return
      }

      setStep('offerwall')

      // Inject CPAGrip script after state update
      setTimeout(() => {
        if (scriptInjectedRef.current || !offerwallRef.current) return
        scriptInjectedRef.current = true

        const container = offerwallRef.current
        container.innerHTML = ''

        // CPAGrip requires a specific div id
        const wallDiv = document.createElement('div')
        wallDiv.id = 'cpagrip-offerwall'
        container.appendChild(wallDiv)

        const script = document.createElement('script')
        script.type = 'text/javascript'
        script.src = data.url
        script.async = true
        container.appendChild(script)
      }, 100)
    } catch {
      setErrorMsg('Erreur réseau. Réessaie.')
      setStep('error')
    }
  }

  const boosterUrl = entryId ? `/${locale}/booster?entry_id=${entryId}` : `/${locale}/booster`

  return (
    <div className="min-h-screen bg-cit-dark text-white">
      <div className="max-w-2xl mx-auto px-4 py-8">

        {step === 'info' && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-full px-4 py-1.5 mb-4">
                <span className="text-green-400 text-sm font-bold">🎁 OFFRES PARTENAIRES</span>
              </div>
              <h1 className="font-bangers text-3xl text-white mb-2">Tu vas accéder aux offres</h1>
              <p className="text-gray-400 text-sm">Lis bien les instructions avant de commencer</p>
            </div>

            {/* How it works */}
            <div className="bg-cit-card border border-cit-border rounded-xl p-5 space-y-3">
              <p className="font-bold text-white text-sm mb-1">Comment ça marche :</p>
              {[
                'Tu choisis l\'offre qui te plaît (souvent juste un email ou une app à tester)',
                'Tu la complètes en suivant les instructions à l\'écran',
                'Tes chances sont créditées automatiquement dans 1-5 minutes',
                'Tu peux faire plusieurs offres différentes pour cumuler les chances',
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <p className="text-gray-300 text-sm">{step}</p>
                </div>
              ))}
            </div>

            {/* Warnings */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 space-y-2">
              <p className="font-bold text-amber-400 text-sm">⚠️ Important :</p>
              {[
                'Donne des infos réelles (sinon l\'offre n\'est pas validée)',
                'Ne soumets pas la même offre plusieurs fois',
                'Termine une offre avant d\'en commencer une autre',
              ].map((w, i) => (
                <p key={i} className="text-gray-400 text-sm">• {w}</p>
              ))}
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleStart}
                className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl text-lg transition-colors"
              >
                Voir les offres maintenant →
              </button>
              <Link
                href={boosterUrl}
                className="text-center text-gray-500 text-sm hover:text-gray-300 transition-colors py-2"
              >
                ← Retour
              </Link>
            </div>
          </div>
        )}

        {step === 'loading' && (
          <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <div className="w-10 h-10 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-400 animate-pulse">Chargement des offres...</p>
          </div>
        )}

        {step === 'error' && (
          <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center px-4">
            <span className="text-5xl">⚠️</span>
            <p className="text-white font-bold">{errorMsg}</p>
            <Link
              href={boosterUrl}
              className="bg-cit-card border border-cit-border text-white font-bold px-6 py-3 rounded-xl hover:border-gold-400/50 transition-colors"
            >
              ← Retour au booster
            </Link>
          </div>
        )}

        {step === 'offerwall' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-white">Offres disponibles</h2>
                <p className="text-gray-500 text-xs">Tes chances seront créditées automatiquement après validation</p>
              </div>
              <Link
                href={boosterUrl}
                className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
              >
                ← Retour
              </Link>
            </div>

            <div
              ref={offerwallRef}
              className="min-h-[600px] bg-cit-card border border-cit-border rounded-xl p-4"
            >
              <p className="text-gray-500 text-sm animate-pulse text-center pt-20">
                Chargement des offres...
              </p>
            </div>

            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 text-center">
              <p className="text-green-400 text-xs">
                ✓ Après avoir complété une offre, reviens sur cette page ou sur{' '}
                <Link href={boosterUrl} className="underline">le booster</Link>{' '}
                pour voir tes chances mises à jour.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
