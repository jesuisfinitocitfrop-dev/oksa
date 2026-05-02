'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

type Entry = {
  id: string
  email: string
  roblox_username: string
  created_at: string
}

export default function AdminEntriesPage() {
  const t = useTranslations('admin.entries')
  const params = useParams()
  const locale = params.locale as string
  const router = useRouter()

  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/admin/entries')
      .then(res => {
        if (res.status === 401) { router.push(`/${locale}/admin/login`); return null }
        return res.json()
      })
      .then(data => {
        if (data) { setEntries(data.entries ?? []); setLoading(false) }
      })
  }, [locale, router])

  function handleExport() {
    window.location.href = '/api/admin/entries?format=csv'
  }

  const filtered = entries.filter(e =>
    e.email.toLowerCase().includes(search.toLowerCase()) ||
    e.roblox_username.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href={`/${locale}/admin/dashboard`} className="text-gray-500 hover:text-white transition-colors">
            ← Retour
          </Link>
          <h1 className="font-bangers text-3xl text-white">{t('title')}</h1>
          <span className="bg-gold-400/20 text-gold-400 text-sm px-3 py-1 rounded-full font-medium">
            {t('total')} : {entries.length}
          </span>
        </div>

        <div className="flex gap-3 mb-6">
          <input
            type="text"
            placeholder="Rechercher email ou pseudo..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="cit-input flex-1 rounded-xl px-4 py-3 text-sm"
          />
          <button
            onClick={handleExport}
            className="btn-fire rounded-xl px-5 py-3 font-bold text-cit-dark text-sm"
          >
            <span>📥 {t('export')}</span>
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gold-400 font-bangers text-2xl animate-pulse">Chargement...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-500">{t('noEntries')}</div>
        ) : (
          <div className="bg-cit-card border border-cit-border rounded-2xl overflow-hidden">
            <table className="w-full admin-table">
              <thead>
                <tr className="border-b border-cit-border">
                  <th className="text-left px-5 py-3 text-gray-500 text-xs uppercase tracking-wider">#</th>
                  <th className="text-left px-5 py-3 text-gray-500 text-xs uppercase tracking-wider">{t('roblox')}</th>
                  <th className="text-left px-5 py-3 text-gray-500 text-xs uppercase tracking-wider">{t('email')}</th>
                  <th className="text-left px-5 py-3 text-gray-500 text-xs uppercase tracking-wider">{t('date')}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((entry, i) => (
                  <tr key={entry.id} className="border-b border-cit-border/50">
                    <td className="px-5 py-3 text-gray-600 text-sm">{i + 1}</td>
                    <td className="px-5 py-3">
                      <span className="font-medium text-white">{entry.roblox_username}</span>
                    </td>
                    <td className="px-5 py-3 text-gray-400 text-sm">{entry.email}</td>
                    <td className="px-5 py-3 text-gray-600 text-xs">
                      {new Date(entry.created_at).toLocaleString('fr-FR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
