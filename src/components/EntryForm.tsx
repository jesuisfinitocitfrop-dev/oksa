'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import RulesModal from './RulesModal'

type Status = 'idle' | 'loading' | 'success' | 'error'

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (status === 'loading') return

    setStatus('loading')
    setErrorMsg('')

    try {
      const res = await fetch('/api/enter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, roblox_username: roblox, edition_id: editionId, locale }),
      })
      const data = await res.json()

      if (!res.ok) {
        if (data.code === 'EMAIL_EXISTS') setErrorMsg(t('errorEmail'))
        else if (data.code === 'ROBLOX_EXISTS') setErrorMsg(t('errorRoblox'))
        else setErrorMsg(t('errorGeneric'))
        setStatus('error')
      } else {
        setStatus('success')
      }
    } catch {
      setErrorMsg(t('errorGeneric'))
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="text-center py-8 animate-scale-in">
        <div className="text-6xl mb-4">🐉</div>
        <h3 className="font-bangers text-3xl text-gold-400 mb-2">{t('success')}</h3>
        <p className="text-gray-400">{t('successSub')}</p>
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
        <span>
          {status === 'loading' ? t('submitting') : t('submit')}
        </span>
      </button>

      <p className="text-xs text-gray-600 text-center">
        {t('rules')}{' '}
        <RulesModal
          className="text-gold-400 hover:underline"
          label={t('rulesLink')}
        />
      </p>
    </form>
  )
}
