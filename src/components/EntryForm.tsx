'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import RulesModal from './RulesModal'
import BonusSection from './BonusSection'

type Status = 'idle' | 'loading' | 'success' | 'error' | 'returning'

export default function EntryForm({
  editionId,
  locale,
}: {
  editionId: string
  locale: string
}) {
  const t = useTranslations('form')
  const [email, setEmail] = useState('')
  const [roblox, setRoblox] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [entryId, setEntryId] = useState('')
  const [referralToken, setReferralToken] = useState('')
  const [ref, setRef] = useState('')
  const [paymentSuccess, setPaymentSuccess] = useState(false)

  // Detect return from Stripe or referral link
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const r = params.get('ref')
    const pmtStatus = params.get('payment')
    const pmtEntryId = params.get('entry_id')

    if (r) setRef(r)

    // Returning from Stripe payment — restore bonus section
    if (pmtStatus === 'success' && pmtEntryId) {
      setStatus('returning')
      setPaymentSuccess(true)
      fetch(`/api/entry?entry_id=${pmtEntryId}`)
        .then(r => r.json())
        .then(data => {
          if (data.entry_id) {
            setEntryId(data.entry_id)
            setReferralToken(data.referral_token ?? '')
            setStatus('success')
            // Clean URL without reloading
            window.history.replaceState({}, '', window.location.pathname)
            setTimeout(() => {
              document.getElementById('bonus-section')?.scrollIntoView({ behavior: 'smooth' })
            }, 200)
          } else {
            setStatus('idle')
          }
        })
        .catch(() => setStatus('idle'))
    }

    if (pmtStatus === 'cancelled') {
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (status === 'loading') return

    setStatus('loading')
    setErrorMsg('')

    try {
      const res = await fetch('/api/enter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, roblox_username: roblox, edition_id: editionId, locale, ref: ref || undefined }),
      })
      const data = await res.json()

      if (!res.ok) {
        if (data.code === 'EMAIL_EXISTS') setErrorMsg(t('errorEmail'))
        else if (data.code === 'ROBLOX_EXISTS') setErrorMsg(t('errorRoblox'))
        else setErrorMsg(t('errorGeneric'))
        setStatus('error')
      } else {
        setEntryId(data.entry_id)
        setReferralToken(data.referral_token)
        setStatus('success')
        setTimeout(() => {
          document.getElementById('bonus-section')?.scrollIntoView({ behavior: 'smooth' })
        }, 100)
      }
    } catch {
      setErrorMsg(t('errorGeneric'))
      setStatus('error')
    }
  }

  if (status === 'returning') {
    return (
      <div className="text-center py-8 animate-pulse text-gray-400 text-sm">
        Chargement de ton profil...
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="space-y-6">
        <div className="text-center py-4 animate-scale-in">
          <div className="text-5xl mb-3">🐉</div>
          <h3 className="font-bangers text-3xl text-gold-400 mb-1">{t('success')}</h3>
          <p className="text-gray-400 text-sm">{t('successSub')}</p>
        </div>

        <div id="bonus-section">
          <BonusSection
            editionId={editionId}
            entryId={entryId}
            referralToken={referralToken}
            locale={locale}
            paymentSuccess={paymentSuccess}
          />
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm text-gray-400 mb-1.5">{t('email')}</label>
        <input
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder={t('emailPlaceholder')}
          className="cit-input w-full rounded-xl px-4 py-3 text-sm"
          disabled={status === 'loading'}
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1.5">{t('roblox')}</label>
        <input
          type="text"
          required
          value={roblox}
          onChange={e => setRoblox(e.target.value)}
          placeholder={t('robloxPlaceholder')}
          className="cit-input w-full rounded-xl px-4 py-3 text-sm"
          disabled={status === 'loading'}
          minLength={3}
          maxLength={20}
        />
      </div>

      {status === 'error' && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
          <p className="text-red-400 text-sm">{errorMsg}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="btn-fire w-full rounded-xl px-6 py-4 font-bangers text-xl text-cit-dark tracking-wider disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <span>{status === 'loading' ? t('submitting') : t('submit')}</span>
      </button>

      <p className="text-xs text-gray-600 text-center">
        {t('rules')}{' '}
        <RulesModal className="text-gold-400 hover:underline" label={t('rulesLink')} />
      </p>
    </form>
  )
}
