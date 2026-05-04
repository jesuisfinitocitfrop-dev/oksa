'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter, useParams } from 'next/navigation'

export default function AdminLoginPage() {
  const t = useTranslations('admin.login')
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string

  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(false)

    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    if (res.ok) {
      router.push(`/${locale}/admin/dashboard`)
    } else {
      setError(true)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="font-bangers text-4xl">
            CIT<span className="text-fire-500">give</span>
          </p>
          <p className="text-gray-500 text-sm mt-1">Admin Panel</p>
        </div>

        <div className="fire-border rounded-2xl p-8">
          <h1 className="font-bangers text-2xl text-white mb-6 text-center">{t('title')}</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">{t('password')}</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="cit-input w-full rounded-xl px-4 py-3 text-sm"
                autoFocus
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
                <p className="text-red-400 text-sm">{t('error')}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-fire w-full rounded-xl px-6 py-3 font-bangers text-lg text-cit-dark disabled:opacity-60"
            >
              <span>{loading ? '...' : t('submit')}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
