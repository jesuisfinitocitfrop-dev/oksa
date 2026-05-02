'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

type Edition = {
  id: string
  title: string
  title_en: string
  title_es: string
  prize_name: string
  prize_image_url: string | null
  end_date: string
  draw_date: string
  is_active: boolean
  is_drawn: boolean
}

export default function AdminDashboardPage() {
  const t = useTranslations('admin.dashboard')
  const tEd = useTranslations('admin.edition')
  const params = useParams()
  const locale = params.locale as string
  const router = useRouter()

  const [editions, setEditions] = useState<Edition[]>([])
  const [entryCount, setEntryCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    title: '', title_en: '', title_es: '',
    prize_name: '', prize_image_url: '',
    end_date: '', draw_date: '',
  })
  const [creating, setCreating] = useState(false)
  const [createSuccess, setCreateSuccess] = useState(false)
  const [announcing, setAnnouncing] = useState(false)
  const [announceResult, setAnnounceResult] = useState<{ sent: number; total: number } | null>(null)
  const [announceError, setAnnounceError] = useState('')
  const [confirmAnnounce, setConfirmAnnounce] = useState(false)

  const activeEdition = editions.find(e => e.is_active && !e.is_drawn)

  useEffect(() => {
    fetchEditions()
  }, [])

  useEffect(() => {
    if (activeEdition) fetchEntryCount(activeEdition.id)
  }, [activeEdition])

  async function fetchEditions() {
    const res = await fetch('/api/admin/edition')
    if (res.status === 401) { router.push(`/${locale}/admin/login`); return }
    const data = await res.json()
    setEditions(data.editions ?? [])
    setLoading(false)
  }

  async function fetchEntryCount(editionId: string) {
    const res = await fetch(`/api/admin/entries?edition_id=${editionId}`)
    const data = await res.json()
    setEntryCount(data.count ?? 0)
  }

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push(`/${locale}/admin/login`)
  }

  async function handleAnnounce() {
    if (!activeEdition) return
    setAnnouncing(true)
    setAnnounceError('')
    setAnnounceResult(null)
    setConfirmAnnounce(false)
    try {
      const res = await fetch('/api/admin/announce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ edition_id: activeEdition.id }),
      })
      const data = await res.json()
      if (!res.ok) setAnnounceError(data.error ?? 'Erreur inconnue')
      else setAnnounceResult({ sent: data.sent, total: data.total })
    } catch {
      setAnnounceError('Erreur réseau')
    }
    setAnnouncing(false)
  }

  async function handleCreateEdition(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    const res = await fetch('/api/admin/edition', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      setCreateSuccess(true)
      setShowForm(false)
      setForm({ title: '', title_en: '', title_es: '', prize_name: '', prize_image_url: '', end_date: '', draw_date: '' })
      fetchEditions()
    }
    setCreating(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gold-400 font-bangers text-2xl animate-pulse">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-bangers text-4xl text-white">
            CIT<span className="text-fire-500">give</span>
            <span className="text-gray-400 text-2xl ml-3">— {t('title')}</span>
          </h1>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-white transition-colors border border-cit-border rounded-lg px-3 py-1.5"
          >
            {t('logout')}
          </button>
        </div>

        {/* Active edition stats */}
        {activeEdition ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-cit-card border border-cit-border rounded-xl p-4">
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">{t('currentEdition')}</p>
              <p className="font-bold text-gold-400 text-lg truncate">{activeEdition.title}</p>
            </div>
            <div className="bg-cit-card border border-cit-border rounded-xl p-4">
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">{t('totalEntries')}</p>
              <p className="font-bangers text-3xl text-white">{entryCount.toLocaleString()}</p>
            </div>
            <div className="bg-cit-card border border-cit-border rounded-xl p-4">
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">{t('endDate')}</p>
              <p className="text-white text-sm font-medium">{new Date(activeEdition.end_date).toLocaleDateString('fr-FR')}</p>
            </div>
            <div className="bg-cit-card border border-cit-border rounded-xl p-4">
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">{t('drawDate')}</p>
              <p className="text-fire-500 text-sm font-bold">{new Date(activeEdition.draw_date).toLocaleDateString('fr-FR')}</p>
            </div>
          </div>
        ) : (
          <div className="bg-cit-card border border-cit-border rounded-xl p-6 mb-8 text-center">
            <p className="text-gray-400">{t('noEdition')}</p>
          </div>
        )}

        {/* Action buttons */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <button
            onClick={() => { setShowForm(!showForm); setCreateSuccess(false) }}
            className="bg-cit-card border border-cit-border hover:border-gold-400 rounded-xl p-5 text-left transition-colors group"
          >
            <div className="text-2xl mb-2">➕</div>
            <p className="font-bold text-white group-hover:text-gold-400 transition-colors">{t('createEdition')}</p>
          </button>

          <Link
            href={`/${locale}/admin/entries`}
            className="bg-cit-card border border-cit-border hover:border-gold-400 rounded-xl p-5 text-left transition-colors group"
          >
            <div className="text-2xl mb-2">👥</div>
            <p className="font-bold text-white group-hover:text-gold-400 transition-colors">{t('manageEntries')}</p>
            {activeEdition && (
              <p className="text-gray-500 text-sm mt-1">{entryCount} participants</p>
            )}
          </Link>

          <Link
            href={`/${locale}/admin/draw`}
            className="bg-gradient-to-br from-gold-400/10 to-fire-500/10 border border-gold-400/30 hover:border-gold-400 rounded-xl p-5 text-left transition-colors group"
          >
            <div className="text-2xl mb-2">🎲</div>
            <p className="font-bold text-gold-400 group-hover:text-gold-300 transition-colors">{t('launchDraw')}</p>
          </Link>

          {activeEdition && (
            <button
              onClick={() => { setConfirmAnnounce(true); setAnnounceResult(null); setAnnounceError('') }}
              disabled={announcing}
              className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 hover:border-indigo-400 rounded-xl p-5 text-left transition-colors group disabled:opacity-60"
            >
              <div className="text-2xl mb-2">📣</div>
              <p className="font-bold text-indigo-400 group-hover:text-indigo-300 transition-colors">
                {announcing ? 'Envoi en cours...' : 'Annoncer le giveaway'}
              </p>
              <p className="text-gray-500 text-sm mt-1">Email à tous les inscrits</p>
            </button>
          )}
        </div>

        {/* Confirm announce modal */}
        {confirmAnnounce && activeEdition && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setConfirmAnnounce(false)}>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <div className="relative bg-[#12121A] border border-[#2a2a3a] rounded-2xl p-8 max-w-md w-full z-10 shadow-2xl" onClick={e => e.stopPropagation()}>
              <h3 className="font-bangers text-2xl text-white mb-2">📣 Confirmer l&apos;envoi</h3>
              <p className="text-gray-400 text-sm mb-4">
                Tu vas envoyer un email <strong className="text-white">«&nbsp;Nouveau Giveaway&nbsp;»</strong> à{' '}
                <strong className="text-indigo-400">tous les anciens inscrits</strong>.
              </p>
              <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 mb-6 text-sm text-gray-300">
                🏆 <strong>{activeEdition.prize_name}</strong> — {activeEdition.title}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleAnnounce}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-colors"
                >
                  Envoyer 🚀
                </button>
                <button
                  onClick={() => setConfirmAnnounce(false)}
                  className="flex-1 bg-cit-card border border-cit-border text-gray-400 hover:text-white py-3 rounded-xl transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Announce result */}
        {announceResult && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3 mb-6 flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <p className="text-green-400">
              <strong>{announceResult.sent}</strong> emails envoyés sur {announceResult.total} inscrits !
            </p>
          </div>
        )}
        {announceError && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-6">
            <p className="text-red-400">Erreur : {announceError}</p>
          </div>
        )}

        {/* Create edition form */}
        {showForm && (
          <div className="fire-border rounded-2xl p-6 mb-8 animate-slide-in">
            <h2 className="font-bangers text-2xl text-white mb-6">{tEd('createTitle')}</h2>
            <form onSubmit={handleCreateEdition} className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">{tEd('titleFr')} *</label>
                <input type="text" required value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                  className="cit-input w-full rounded-xl px-4 py-3 text-sm" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">{tEd('titleEn')}</label>
                <input type="text" value={form.title_en} onChange={e => setForm({...form, title_en: e.target.value})}
                  className="cit-input w-full rounded-xl px-4 py-3 text-sm" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">{tEd('titleEs')}</label>
                <input type="text" value={form.title_es} onChange={e => setForm({...form, title_es: e.target.value})}
                  className="cit-input w-full rounded-xl px-4 py-3 text-sm" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">{tEd('prizeName')} *</label>
                <input type="text" required value={form.prize_name} onChange={e => setForm({...form, prize_name: e.target.value})}
                  placeholder="Dragon Doré" className="cit-input w-full rounded-xl px-4 py-3 text-sm" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-400 mb-1.5">{tEd('prizeImage')}</label>
                <input type="url" value={form.prize_image_url} onChange={e => setForm({...form, prize_image_url: e.target.value})}
                  placeholder="https://..." className="cit-input w-full rounded-xl px-4 py-3 text-sm" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">{tEd('endDate')} *</label>
                <input type="datetime-local" required value={form.end_date} onChange={e => setForm({...form, end_date: e.target.value})}
                  className="cit-input w-full rounded-xl px-4 py-3 text-sm" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">{tEd('drawDate')} *</label>
                <input type="datetime-local" required value={form.draw_date} onChange={e => setForm({...form, draw_date: e.target.value})}
                  className="cit-input w-full rounded-xl px-4 py-3 text-sm" />
              </div>
              <div className="md:col-span-2">
                <button type="submit" disabled={creating}
                  className="btn-fire rounded-xl px-8 py-3 font-bangers text-xl text-cit-dark disabled:opacity-60">
                  <span>{creating ? '...' : tEd('create')}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {createSuccess && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3 mb-6">
            <p className="text-green-400">{tEd('success')}</p>
          </div>
        )}

        {/* Past editions */}
        {editions.length > 0 && (
          <div>
            <h2 className="font-bangers text-2xl text-white mb-4">Toutes les éditions</h2>
            <div className="space-y-2">
              {editions.map(ed => (
                <div key={ed.id} className="bg-cit-card border border-cit-border rounded-xl px-5 py-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">{ed.title}</p>
                    <p className="text-gray-500 text-sm">{ed.prize_name}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {ed.is_drawn && <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">Tiré</span>}
                    {ed.is_active && !ed.is_drawn && <span className="text-xs bg-gold-400/20 text-gold-400 px-2 py-1 rounded-full">Actif</span>}
                    {!ed.is_active && !ed.is_drawn && <span className="text-xs bg-gray-500/20 text-gray-400 px-2 py-1 rounded-full">Inactif</span>}
                    <p className="text-gray-600 text-xs">{new Date(ed.draw_date).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
