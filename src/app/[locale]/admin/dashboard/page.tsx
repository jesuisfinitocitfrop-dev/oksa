'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { DICE_COLORS, MAX_DICE, type DiceColor } from '@/lib/dice'
import { type NavTabs, type NavTabKey } from '@/lib/nav'

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
  is_premium: boolean
}

type Subscription = {
  id: string
  email: string
  roblox_username: string | null
  tier: 'starter' | 'plus' | 'vip'
  amount_eur: number
  status: string
  giveaways_remaining: number
  bonus_chances: number
  created_at: string
}

type PremiumEntry = {
  id: string
  email: string
  roblox_username: string
  chances: number
  created_at: string
  subscriptions: { tier: string; amount_eur: number } | null
}

type BonusAction = {
  id: string
  label: string
  description: string | null
  icon: string
  url: string | null
  bonus_chances: number
  action_type: string
  sort_order: number
  is_active: boolean
}

const DICE_COLOR_META: { value: DiceColor; label: string; hex: string }[] = [
  { value: 'red', label: 'Rouge', hex: '#EF4444' },
  { value: 'orange', label: 'Orange', hex: '#F59E0B' },
  { value: 'yellow', label: 'Jaune', hex: '#FACC15' },
  { value: 'green', label: 'Vert', hex: '#22C55E' },
  { value: 'blue', label: 'Bleu', hex: '#3B82F6' },
  { value: 'purple', label: 'Violet', hex: '#A855F7' },
]

const NAV_TAB_META: { key: NavTabKey; label: string; icon: string }[] = [
  { key: 'home', label: 'Accueil', icon: '🏠' },
  { key: 'winners', label: 'Gagnants', icon: '🏆' },
  { key: 'shop', label: 'Boutique', icon: '🛍️' },
  { key: 'supporters', label: 'Supporters', icon: '💎' },
  { key: 'dice', label: 'Color Dice', icon: '🎲' },
  { key: 'premium', label: 'Premium', icon: '🏇' },
]

const ACTION_TYPES = [
  { value: 'discord', label: 'Discord', icon: '💬' },
  { value: 'youtube', label: 'YouTube', icon: '▶️' },
  { value: 'pub', label: 'Pub (multi-clics → barre)', icon: '📺' },
  { value: 'pub_click', label: 'Pub (1 clic = N chances)', icon: '🖱️' },
  { value: 'cpagrip', label: 'CPAGrip (offre)', icon: '💰' },
  { value: 'twitter', label: 'Twitter/X', icon: '🐦' },
  { value: 'share', label: 'Partage', icon: '🔗' },
  { value: 'custom', label: 'Personnalisé', icon: '🎯' },
]

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
    end_date: '', draw_date: '', is_premium: false,
  })
  const [creating, setCreating] = useState(false)
  const [createSuccess, setCreateSuccess] = useState(false)
  const [announcing, setAnnouncing] = useState(false)
  const [announceResult, setAnnounceResult] = useState<{ sent: number; total: number } | null>(null)
  const [announceError, setAnnounceError] = useState('')
  const [confirmAnnounce, setConfirmAnnounce] = useState(false)

  // Edition edit
  const [editingEdition, setEditingEdition] = useState<Edition | null>(null)
  const [editForm, setEditForm] = useState<Partial<Edition>>({})
  const [editSaving, setEditSaving] = useState(false)
  const [editSuccess, setEditSuccess] = useState(false)

  // Premium
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [subStats, setSubStats] = useState<{ total: number; active: number; starter: number; plus: number; vip: number; monthly_revenue: number } | null>(null)
  const [premiumEdition, setPremiumEdition] = useState<Edition | null>(null)
  const [premiumEntries, setPremiumEntries] = useState<PremiumEntry[]>([])
  const [premiumEntryCount, setPremiumEntryCount] = useState(0)
  const [premiumTotalChances, setPremiumTotalChances] = useState(0)
  const [premiumDrawResult, setPremiumDrawResult] = useState<{ winner: PremiumEntry; total_chances: number } | null>(null)
  const [premiumDrawing, setPremiumDrawing] = useState(false)
  const [cancellingSubId, setCancellingSubId] = useState<string | null>(null)

  // Stats
  const [stats, setStats] = useState<{
    participants: number
    youtube: number
    discord: number
    pub: number
    pub_click: number
    boosts_count: number
    boosts_total: number
  } | null>(null)

  // Bonus actions
  const [bonusActions, setBonusActions] = useState<BonusAction[]>([])
  const [showBonusForm, setShowBonusForm] = useState(false)
  const [bonusForm, setBonusForm] = useState({
    label: '', description: '', icon: '🎯', url: '',
    bonus_chances: 5, action_type: 'custom', sort_order: 0,
  })
  const [savingBonus, setSavingBonus] = useState(false)
  const [editingBonus, setEditingBonus] = useState<BonusAction | null>(null)

  // Color Dice
  const [diceEnabled, setDiceEnabled] = useState<DiceColor[]>([...DICE_COLORS])
  const [diceForced, setDiceForced] = useState<(DiceColor | null)[]>(Array(MAX_DICE).fill(null))
  const [diceLoaded, setDiceLoaded] = useState(false)
  const [diceSaving, setDiceSaving] = useState(false)
  const [diceSaved, setDiceSaved] = useState(false)
  const [diceError, setDiceError] = useState('')

  // Onglets navbar
  const [navTabs, setNavTabs] = useState<NavTabs | null>(null)
  const [navSaving, setNavSaving] = useState(false)
  const [navSaved, setNavSaved] = useState(false)
  const [navError, setNavError] = useState('')

  const activeEdition = editions.find(e => e.is_active && !e.is_drawn)

  useEffect(() => { fetchEditions(); fetchDiceConfig(); fetchNavTabs() }, [])
  useEffect(() => {
    if (activeEdition) {
      fetchEntryCount(activeEdition.id)
      fetchBonusActions(activeEdition.id)
      fetchStats(activeEdition.id)
    }
  }, [activeEdition?.id])

  useEffect(() => {
    fetchSubscriptions()
  }, [])

  useEffect(() => {
    if (premiumEdition) fetchPremiumEntries(premiumEdition.id)
  }, [premiumEdition?.id])

  async function fetchEditions() {
    const res = await fetch('/api/admin/edition')
    if (res.status === 401) { router.push(`/${locale}/admin/login`); return }
    const data = await res.json()
    const all: Edition[] = data.editions ?? []
    setEditions(all)
    const pEd = all.find(e => e.is_premium && e.is_active && !e.is_drawn) ?? null
    setPremiumEdition(pEd)
    setLoading(false)
  }

  async function fetchSubscriptions() {
    const res = await fetch('/api/admin/subscriptions')
    if (!res.ok) return
    const data = await res.json()
    setSubscriptions(data.subscriptions ?? [])
    setSubStats(data.stats ?? null)
  }

  async function fetchPremiumEntries(editionId: string) {
    const res = await fetch(`/api/admin/premium-entries?edition_id=${editionId}`)
    if (!res.ok) return
    const data = await res.json()
    setPremiumEntries(data.entries ?? [])
    setPremiumEntryCount(data.count ?? 0)
    setPremiumTotalChances(data.total_chances ?? 0)
  }

  async function handleCancelSubscription(id: string) {
    if (!confirm('Annuler cet abonnement ?')) return
    setCancellingSubId(id)
    await fetch('/api/admin/subscriptions', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'cancelled' }),
    })
    setCancellingSubId(null)
    fetchSubscriptions()
  }

  async function handlePremiumDraw() {
    if (!premiumEdition) return
    if (!confirm('Lancer le tirage du giveaway premium ? Cette action est irréversible.')) return
    setPremiumDrawing(true)
    const res = await fetch('/api/admin/premium-entries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ edition_id: premiumEdition.id }),
    })
    const data = await res.json()
    if (res.ok) {
      setPremiumDrawResult({ winner: data.winner, total_chances: data.total_chances })
      fetchEditions()
    }
    setPremiumDrawing(false)
  }

  async function fetchEntryCount(editionId: string) {
    const res = await fetch(`/api/admin/entries?edition_id=${editionId}`)
    const data = await res.json()
    setEntryCount(data.count ?? 0)
  }

  async function fetchBonusActions(editionId: string) {
    const res = await fetch(`/api/admin/bonus-actions?edition_id=${editionId}`)
    const data = await res.json()
    setBonusActions(data.actions ?? [])
  }

  async function fetchStats(editionId: string) {
    const res = await fetch(`/api/admin/stats?edition_id=${editionId}`)
    if (res.ok) {
      const data = await res.json()
      setStats(data)
    }
  }

  async function fetchDiceConfig() {
    const res = await fetch('/api/admin/dice')
    if (!res.ok) return
    const data = await res.json()
    if (data.config) {
      setDiceEnabled((data.config.enabled_colors ?? []).filter((c: string) => DICE_COLORS.includes(c as DiceColor)))
      setDiceForced(Array.from({ length: MAX_DICE }, (_, i) => {
        const c = data.config.forced_colors?.[i]
        return DICE_COLORS.includes(c) ? c : null
      }))
      setDiceLoaded(true)
    }
  }

  function toggleDiceColor(color: DiceColor) {
    setDiceSaved(false)
    setDiceEnabled(prev =>
      prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
    )
  }

  async function handleSaveDice() {
    setDiceSaving(true)
    setDiceSaved(false)
    setDiceError('')
    const res = await fetch('/api/admin/dice', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled_colors: diceEnabled, forced_colors: diceForced }),
    })
    if (res.ok) {
      setDiceSaved(true)
    } else {
      const data = await res.json().catch(() => ({}))
      setDiceError(data.error ?? 'Erreur lors de la sauvegarde')
    }
    setDiceSaving(false)
  }

  async function fetchNavTabs() {
    const res = await fetch('/api/admin/nav')
    if (!res.ok) return
    const data = await res.json()
    if (data.tabs) setNavTabs(data.tabs)
  }

  async function toggleNavTab(key: NavTabKey) {
    if (!navTabs || navSaving) return
    const updated = { ...navTabs, [key]: !navTabs[key] }
    setNavTabs(updated)
    setNavSaving(true)
    setNavSaved(false)
    setNavError('')
    const res = await fetch('/api/admin/nav', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tabs: updated }),
    })
    if (res.ok) {
      setNavSaved(true)
    } else {
      const data = await res.json().catch(() => ({}))
      setNavError(data.error ?? 'Erreur lors de la sauvegarde')
      fetchNavTabs() // recharge l'état réel en cas d'échec
    }
    setNavSaving(false)
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
      setForm({ title: '', title_en: '', title_es: '', prize_name: '', prize_image_url: '', end_date: '', draw_date: '', is_premium: false })
      fetchEditions()
    }
    setCreating(false)
  }

  function openEdit(ed: Edition) {
    setEditingEdition(ed)
    setEditForm({
      title: ed.title,
      title_en: ed.title_en,
      title_es: ed.title_es,
      prize_name: ed.prize_name,
      prize_image_url: ed.prize_image_url ?? '',
      end_date: ed.end_date.slice(0, 16),
      draw_date: ed.draw_date.slice(0, 16),
      is_premium: ed.is_premium,
      is_active: ed.is_active,
    })
    setEditSuccess(false)
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editingEdition) return
    setEditSaving(true)
    const res = await fetch(`/api/admin/edition/${editingEdition.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm),
    })
    if (res.ok) {
      setEditSuccess(true)
      fetchEditions()
      setTimeout(() => setEditingEdition(null), 1200)
    }
    setEditSaving(false)
  }

  async function handleSaveBonus(e: React.FormEvent) {
    e.preventDefault()
    if (!activeEdition) return
    setSavingBonus(true)

    if (editingBonus) {
      await fetch('/api/admin/bonus-actions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingBonus.id, ...bonusForm }),
      })
      setEditingBonus(null)
    } else {
      await fetch('/api/admin/bonus-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ edition_id: activeEdition.id, ...bonusForm }),
      })
    }

    setBonusForm({ label: '', description: '', icon: '🎯', url: '', bonus_chances: 5, action_type: 'custom', sort_order: 0 })
    setShowBonusForm(false)
    fetchBonusActions(activeEdition.id)
    setSavingBonus(false)
  }

  async function handleDeleteBonus(id: string) {
    if (!confirm('Supprimer cette action bonus ?')) return
    await fetch(`/api/admin/bonus-actions?id=${id}`, { method: 'DELETE' })
    if (activeEdition) fetchBonusActions(activeEdition.id)
  }

  function startEditBonus(action: BonusAction) {
    setEditingBonus(action)
    setBonusForm({
      label: action.label,
      description: action.description ?? '',
      icon: action.icon,
      url: action.url ?? '',
      bonus_chances: action.bonus_chances,
      action_type: action.action_type,
      sort_order: action.sort_order,
    })
    setShowBonusForm(true)
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

        {/* ── STATS DASHBOARD ───────────────────────────── */}
        {activeEdition && stats && (
          <div className="mb-8">
            <h2 className="font-bangers text-2xl text-white mb-4">📊 Statistiques en direct</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="bg-cit-card border border-cit-border rounded-xl p-4">
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">👥 Participants</p>
                <p className="font-bangers text-4xl text-gold-400">{stats.participants.toLocaleString()}</p>
                <p className="text-gray-600 text-xs mt-1">inscrits à l'édition</p>
              </div>
              <div className="bg-cit-card border border-red-500/20 rounded-xl p-4">
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">📺 YouTube</p>
                <p className="font-bangers text-4xl text-red-400">{stats.youtube.toLocaleString()}</p>
                <p className="text-gray-600 text-xs mt-1">abonnements vérifiés</p>
              </div>
              <div className="bg-cit-card border border-indigo-500/20 rounded-xl p-4">
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">💬 Discord</p>
                <p className="font-bangers text-4xl text-indigo-400">{stats.discord.toLocaleString()}</p>
                <p className="text-gray-600 text-xs mt-1">membres rejoints</p>
              </div>
              <div className="bg-cit-card border border-purple-500/20 rounded-xl p-4">
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">📺 Pub (33 clics)</p>
                <p className="font-bangers text-4xl text-purple-400">{(stats.pub ?? 0).toLocaleString()}</p>
                <p className="text-gray-600 text-xs mt-1">complétions pub</p>
              </div>
              <div className="bg-cit-card border border-purple-500/20 rounded-xl p-4">
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">🖱️ Pub (1 clic)</p>
                <p className="font-bangers text-4xl text-purple-300">{(stats.pub_click ?? 0).toLocaleString()}</p>
                <p className="text-gray-600 text-xs mt-1">clics pub</p>
              </div>
              <div className="bg-cit-card border border-purple-500/20 rounded-xl p-4">
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">💎 Boosts achetés</p>
                <p className="font-bangers text-4xl text-purple-400">{stats.boosts_count.toLocaleString()}</p>
                <p className="text-gray-600 text-xs mt-1">paiements complétés</p>
              </div>
              <div className="bg-cit-card border border-green-500/20 rounded-xl p-4">
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">💰 Revenus boosts</p>
                <p className="font-bangers text-4xl text-green-400">{stats.boosts_total}€</p>
                <p className="text-gray-600 text-xs mt-1">total collecté</p>
              </div>
              <a
                href="https://vercel.com/analytics"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-cit-card border border-cit-border rounded-xl p-4 hover:border-white/30 transition-colors group"
              >
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">🌐 Visiteurs</p>
                <p className="font-bangers text-2xl text-white group-hover:text-gold-400 transition-colors">Vercel Analytics →</p>
                <p className="text-gray-600 text-xs mt-1">voir les stats de visite</p>
              </a>
            </div>
          </div>
        )}

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
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <div
                    onClick={() => setForm({...form, is_premium: !form.is_premium})}
                    className={`w-11 h-6 rounded-full transition-colors flex items-center px-1 ${form.is_premium ? 'bg-orange-500' : 'bg-gray-600'}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${form.is_premium ? 'translate-x-5' : 'translate-x-0'}`} />
                  </div>
                  <div>
                    <span className={`text-sm font-medium ${form.is_premium ? 'text-orange-400' : 'text-gray-400'}`}>
                      🏇 Giveaway Premium (abonnement payant)
                    </span>
                    <p className="text-xs text-gray-600">Les participants devront avoir un abonnement actif</p>
                  </div>
                </label>
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

        {/* ─── BONUS ACTIONS ───────────────────────────── */}
        {activeEdition && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-bangers text-2xl text-white">🎯 Actions Bonus</h2>
                <p className="text-gray-500 text-sm">Actions que les participants peuvent faire pour augmenter leurs chances</p>
              </div>
              <button
                onClick={() => { setShowBonusForm(!showBonusForm); setEditingBonus(null); setBonusForm({ label: '', description: '', icon: '🎯', url: '', bonus_chances: 5, action_type: 'custom', sort_order: 0 }) }}
                className="bg-gold-400 text-cit-dark font-bold text-sm px-4 py-2 rounded-lg hover:bg-gold-300 transition-colors"
              >
                + Ajouter
              </button>
            </div>

            {showBonusForm && (
              <div className="bg-cit-card border border-gold-400/30 rounded-xl p-5 mb-4 animate-slide-in">
                <h3 className="font-bold text-white mb-4">{editingBonus ? 'Modifier' : 'Nouvelle'} action bonus</h3>
                <form onSubmit={handleSaveBonus} className="grid md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Libellé *</label>
                    <input required value={bonusForm.label} onChange={e => setBonusForm({...bonusForm, label: e.target.value})}
                      placeholder="Rejoindre le Discord" className="cit-input w-full rounded-lg px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Type</label>
                    <select value={bonusForm.action_type} onChange={e => {
                      const t = ACTION_TYPES.find(a => a.value === e.target.value)
                      setBonusForm({...bonusForm, action_type: e.target.value, icon: t?.icon || '🎯'})
                    }} className="cit-input w-full rounded-lg px-3 py-2 text-sm">
                      {ACTION_TYPES.map(t => (
                        <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">
                      {bonusForm.action_type === 'pub' ? 'Clics requis (ex: 33)' : 'Description'}
                    </label>
                    <input
                      value={bonusForm.description}
                      onChange={e => setBonusForm({...bonusForm, description: e.target.value})}
                      placeholder={bonusForm.action_type === 'pub' ? '33' : 'Courte description...'}
                      className="cit-input w-full rounded-lg px-3 py-2 text-sm"
                    />
                    {bonusForm.action_type === 'pub' && (
                      <p className="text-xs text-indigo-400 mt-1">→ Nombre de clics avant d&apos;obtenir les chances bonus</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">URL (optionnel)</label>
                    <input type="url" value={bonusForm.url} onChange={e => setBonusForm({...bonusForm, url: e.target.value})}
                      placeholder="https://discord.gg/..." className="cit-input w-full rounded-lg px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Icône (emoji)</label>
                    <input value={bonusForm.icon} onChange={e => setBonusForm({...bonusForm, icon: e.target.value})}
                      maxLength={4} className="cit-input w-full rounded-lg px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Chances bonus *</label>
                    <div className="flex items-center gap-2">
                      <input type="number" required min={1} max={1000} value={bonusForm.bonus_chances}
                        onChange={e => setBonusForm({...bonusForm, bonus_chances: Number(e.target.value)})}
                        className="cit-input w-full rounded-lg px-3 py-2 text-sm" />
                      <span className="text-gold-400 font-bangers text-lg whitespace-nowrap">+{bonusForm.bonus_chances}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Ordre d&apos;affichage</label>
                    <input type="number" value={bonusForm.sort_order} onChange={e => setBonusForm({...bonusForm, sort_order: Number(e.target.value)})}
                      className="cit-input w-full rounded-lg px-3 py-2 text-sm" />
                  </div>
                  <div className="md:col-span-2 flex gap-3">
                    <button type="submit" disabled={savingBonus}
                      className="bg-gold-400 hover:bg-gold-300 text-cit-dark font-bold px-6 py-2 rounded-lg transition-colors disabled:opacity-60">
                      {savingBonus ? '...' : editingBonus ? 'Sauvegarder' : 'Créer'}
                    </button>
                    <button type="button" onClick={() => { setShowBonusForm(false); setEditingBonus(null) }}
                      className="bg-cit-card border border-cit-border text-gray-400 hover:text-white px-6 py-2 rounded-lg transition-colors">
                      Annuler
                    </button>
                  </div>
                </form>
              </div>
            )}

            {bonusActions.length === 0 ? (
              <div className="bg-cit-card border border-dashed border-cit-border rounded-xl p-6 text-center text-gray-500 text-sm">
                Aucune action bonus pour cette édition. Ajoutes-en pour permettre aux participants d&apos;augmenter leurs chances.
              </div>
            ) : (
              <div className="space-y-2">
                {bonusActions.map(action => (
                  <div key={action.id} className="flex items-center justify-between gap-3 bg-cit-card border border-cit-border rounded-xl px-4 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {action.action_type === 'discord'
                        ? <DiscordIcon className="w-5 h-5 text-indigo-400 shrink-0" />
                        : action.action_type === 'youtube'
                        ? <YouTubeIcon className="w-5 h-5 text-red-500 shrink-0" />
                        : <span className="text-xl shrink-0">{action.icon}</span>
                      }
                      <div className="min-w-0">
                        <p className="font-bold text-white text-sm truncate">{action.label}</p>
                        {action.description && <p className="text-gray-500 text-xs truncate">{action.description}</p>}
                        {action.url && <p className="text-indigo-400 text-xs truncate">{action.url}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-bangers text-gold-400 text-lg">+{action.bonus_chances}</span>
                      <button onClick={() => startEditBonus(action)}
                        className="text-xs text-gray-500 hover:text-white px-2 py-1 rounded border border-cit-border hover:border-gray-500 transition-colors">
                        ✏️
                      </button>
                      <button onClick={() => handleDeleteBonus(action.id)}
                        className="text-xs text-red-500/70 hover:text-red-400 px-2 py-1 rounded border border-red-500/20 hover:border-red-500/50 transition-colors">
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── SECTION PREMIUM ─────────────────────────── */}
        <div className="mb-10">
          <h2 className="font-bangers text-2xl text-white mb-4">🏇 Giveaways Premium</h2>

          {/* Stats abonnements */}
          {subStats && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
              <div className="bg-gradient-to-b from-orange-500/10 to-transparent border border-orange-500/30 rounded-xl p-4">
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Abonnés actifs</p>
                <p className="font-bangers text-4xl text-orange-400">{subStats.active}</p>
              </div>
              <div className="bg-cit-card border border-cit-border rounded-xl p-4">
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Revenu mensuel</p>
                <p className="font-bangers text-4xl text-green-400">{subStats.monthly_revenue}€</p>
              </div>
              <div className="bg-cit-card border border-cit-border rounded-xl p-4 col-span-2 md:col-span-1">
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">Répartition</p>
                <div className="flex gap-3 text-sm">
                  <span className="text-blue-400">🎫 {subStats.starter} Starter</span>
                  <span className="text-purple-400">💎 {subStats.plus} Plus</span>
                  <span className="text-amber-400">👑 {subStats.vip} VIP</span>
                </div>
              </div>
            </div>
          )}

          {/* Giveaway premium actif */}
          {premiumEdition ? (
            <div className="bg-gradient-to-b from-orange-500/10 to-transparent border border-orange-500/30 rounded-xl p-5 mb-4">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <p className="text-xs text-orange-400 uppercase tracking-widest mb-1">Giveaway premium actif</p>
                  <p className="font-bold text-white text-lg">{premiumEdition.prize_name}</p>
                  <p className="text-gray-500 text-sm">{premiumEntryCount} participants · {premiumTotalChances} chances totales</p>
                </div>
                {!premiumEdition.is_drawn && (
                  <button
                    onClick={handlePremiumDraw}
                    disabled={premiumDrawing || premiumEntryCount === 0}
                    className="shrink-0 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-bangers text-lg px-5 py-2.5 rounded-xl transition-all disabled:opacity-60"
                  >
                    {premiumDrawing ? '⏳...' : '🎲 TIRER AU SORT'}
                  </button>
                )}
              </div>

              {premiumDrawResult && (
                <div className="bg-orange-500/20 border border-orange-500/40 rounded-xl px-5 py-4 mb-4 text-center animate-scale-in">
                  <div className="text-4xl mb-2">🎃</div>
                  <p className="font-bangers text-2xl text-orange-400">GAGNANT PREMIUM</p>
                  <p className="font-bold text-white text-xl">{premiumDrawResult.winner.roblox_username}</p>
                  <p className="text-gray-400 text-sm">{premiumDrawResult.winner.email} · {premiumDrawResult.winner.chances} chances sur {premiumDrawResult.total_chances}</p>
                </div>
              )}

              {/* Participants premium */}
              {premiumEntries.length > 0 && (
                <div className="space-y-2">
                  {premiumEntries.map(entry => (
                    <div key={entry.id} className="flex items-center justify-between gap-3 bg-cit-dark/50 rounded-lg px-4 py-2.5 text-sm">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-lg shrink-0">
                          {entry.subscriptions?.tier === 'vip' ? '👑' : entry.subscriptions?.tier === 'plus' ? '💎' : '🎫'}
                        </span>
                        <div className="min-w-0">
                          <p className="font-bold text-white truncate">{entry.roblox_username}</p>
                          <p className="text-gray-500 text-xs truncate">{entry.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-bangers text-gold-400">{entry.chances} chances</span>
                        <span className="text-gray-600 text-xs">{new Date(entry.created_at).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-cit-card border border-dashed border-orange-500/30 rounded-xl p-6 text-center text-gray-500 text-sm mb-4">
              Aucun giveaway premium actif. Crée une édition avec le toggle <span className="text-orange-400">🏇 Premium</span>.
            </div>
          )}

          {/* Liste des abonnements */}
          {subscriptions.length > 0 && (
            <div>
              <h3 className="font-bold text-gray-300 text-sm mb-3">Tous les abonnements ({subscriptions.length})</h3>
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {subscriptions.map(sub => (
                  <div key={sub.id} className={`flex items-center justify-between gap-3 rounded-xl px-4 py-3 border text-sm ${
                    sub.status === 'active' ? 'bg-cit-card border-cit-border' : 'bg-cit-card/50 border-cit-border/50 opacity-60'
                  }`}>
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xl shrink-0">
                        {sub.tier === 'vip' ? '👑' : sub.tier === 'plus' ? '💎' : '🎫'}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-white truncate">{sub.email}</p>
                          <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                            sub.status === 'active' ? 'bg-green-500/20 text-green-400' :
                            sub.status === 'past_due' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>{sub.status}</span>
                        </div>
                        <p className="text-gray-500 text-xs">
                          {sub.tier.toUpperCase()} · {sub.amount_eur}€/mois
                          {sub.roblox_username && ` · ${sub.roblox_username}`}
                          {sub.tier !== 'vip' && ` · ${sub.giveaways_remaining} slot${sub.giveaways_remaining > 1 ? 's' : ''} restant${sub.giveaways_remaining > 1 ? 's' : ''}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-gray-600 text-xs">{new Date(sub.created_at).toLocaleDateString('fr-FR')}</span>
                      {sub.status === 'active' && (
                        <button
                          onClick={() => handleCancelSubscription(sub.id)}
                          disabled={cancellingSubId === sub.id}
                          className="text-xs text-red-500/70 hover:text-red-400 px-2 py-1 rounded border border-red-500/20 hover:border-red-500/50 transition-colors disabled:opacity-60"
                        >
                          {cancellingSubId === sub.id ? '...' : 'Annuler'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ─── ONGLETS DU SITE ─────────────────────────── */}
        <div className="mb-8">
          <div className="mb-4">
            <h2 className="font-bangers text-2xl text-white">🧭 Onglets du site</h2>
            <p className="text-gray-500 text-sm">Active ou met en veille les onglets de la barre de navigation (sauvegarde automatique)</p>
          </div>

          <div className="bg-cit-card border border-cit-border rounded-xl p-5">
            {!navTabs ? (
              <p className="text-gray-500 text-sm">
                Chargement... (si rien ne s&apos;affiche, exécute <code className="text-gold-400">supabase-nav-migration.sql</code> dans Supabase)
              </p>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {NAV_TAB_META.map(tab => {
                    const on = navTabs[tab.key]
                    return (
                      <button
                        key={tab.key}
                        onClick={() => toggleNavTab(tab.key)}
                        disabled={navSaving}
                        className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-all disabled:opacity-60 ${
                          on
                            ? 'border-green-500/40 bg-green-500/10'
                            : 'border-cit-border bg-transparent opacity-60'
                        }`}
                      >
                        <span className={`text-2xl ${on ? '' : 'grayscale'}`}>{tab.icon}</span>
                        <span className={`text-sm font-bold ${on ? 'text-white' : 'text-gray-500'}`}>{tab.label}</span>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          on ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-500'
                        }`}>
                          {on ? '● Visible' : '○ En veille'}
                        </span>
                      </button>
                    )
                  })}
                </div>
                <div className="flex items-center gap-3 mt-3 min-h-[20px]">
                  {navSaving && <p className="text-gray-500 text-sm">Sauvegarde...</p>}
                  {navSaved && !navSaving && <p className="text-green-400 text-sm">✓ Sauvegardé !</p>}
                  {navError && <p className="text-red-400 text-sm">Erreur : {navError}</p>}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ─── COLOR DICE ──────────────────────────────── */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bangers text-2xl text-white">🎲 Color Dice</h2>
              <p className="text-gray-500 text-sm">Contrôle les couleurs qui peuvent sortir sur les dés de la page Color Dice</p>
            </div>
            <Link
              href={`/${locale}/dice`}
              target="_blank"
              className="text-xs text-gray-500 hover:text-gold-400 border border-cit-border hover:border-gold-400/30 rounded-lg px-3 py-1.5 transition-colors"
            >
              Voir la page ↗
            </Link>
          </div>

          <div className="bg-cit-card border border-cit-border rounded-xl p-5">
            {!diceLoaded ? (
              <p className="text-gray-500 text-sm">
                Chargement... (si rien ne s&apos;affiche, exécute <code className="text-gold-400">supabase-dice-migration.sql</code> dans Supabase)
              </p>
            ) : (
              <>
                {/* Couleurs activées */}
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Couleurs autorisées (tirage aléatoire)</p>
                <div className="flex flex-wrap gap-2 mb-5">
                  {DICE_COLOR_META.map(c => {
                    const on = diceEnabled.includes(c.value)
                    return (
                      <button
                        key={c.value}
                        onClick={() => toggleDiceColor(c.value)}
                        className={`flex items-center gap-2 text-sm font-bold px-3 py-1.5 rounded-full border transition-all ${
                          on ? 'text-white' : 'text-gray-600 opacity-50 grayscale'
                        }`}
                        style={{
                          borderColor: on ? c.hex : '#1E1E2E',
                          background: on ? `${c.hex}22` : 'transparent',
                        }}
                      >
                        <span className="w-3 h-3 rounded-full inline-block" style={{ background: c.hex }} />
                        {c.label}
                        <span className="text-xs">{on ? '✓' : '✕'}</span>
                      </button>
                    )
                  })}
                </div>

                {/* Couleurs forcées */}
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Forcer le résultat par dé</p>
                <p className="text-gray-600 text-xs mb-3">« Aléatoire » = le dé tire au hasard parmi les couleurs autorisées. Une couleur forcée sort à 100%, même si elle est désactivée au-dessus.</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">
                  {diceForced.map((forced, i) => (
                    <div key={i}>
                      <label className="block text-xs text-gray-500 mb-1">Dé {i + 1}</label>
                      <select
                        value={forced ?? 'random'}
                        onChange={e => {
                          setDiceSaved(false)
                          setDiceForced(prev => prev.map((f, j) =>
                            j === i ? (e.target.value === 'random' ? null : e.target.value as DiceColor) : f
                          ))
                        }}
                        className="cit-input w-full rounded-lg px-3 py-2 text-sm"
                        style={forced ? { borderColor: DICE_COLOR_META.find(c => c.value === forced)?.hex } : undefined}
                      >
                        <option value="random">🎲 Aléatoire</option>
                        {DICE_COLOR_META.map(c => (
                          <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <button
                    onClick={handleSaveDice}
                    disabled={diceSaving || diceEnabled.length === 0}
                    className="bg-gold-400 hover:bg-gold-300 text-cit-dark font-bold px-6 py-2 rounded-lg transition-colors disabled:opacity-60"
                  >
                    {diceSaving ? 'Sauvegarde...' : 'Sauvegarder'}
                  </button>
                  {diceEnabled.length === 0 && (
                    <p className="text-red-400 text-sm">⚠️ Active au moins une couleur</p>
                  )}
                  {diceSaved && <p className="text-green-400 text-sm">✓ Config sauvegardée !</p>}
                  {diceError && <p className="text-red-400 text-sm">Erreur : {diceError}</p>}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ─── PAST EDITIONS ───────────────────────────── */}
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
                    {ed.is_premium && <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded-full">🏇 Premium</span>}
                    {ed.is_drawn && <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">Tiré</span>}
                    {ed.is_active && !ed.is_drawn && <span className="text-xs bg-gold-400/20 text-gold-400 px-2 py-1 rounded-full">Actif</span>}
                    {!ed.is_active && !ed.is_drawn && <span className="text-xs bg-gray-500/20 text-gray-400 px-2 py-1 rounded-full">Inactif</span>}
                    <p className="text-gray-600 text-xs">{new Date(ed.draw_date).toLocaleDateString('fr-FR')}</p>
                    {/* Secret edit button */}
                    <button
                      onClick={() => openEdit(ed)}
                      className="text-xs text-gray-600 hover:text-gold-400 px-2 py-1 rounded border border-transparent hover:border-gold-400/30 transition-colors"
                      title="Modifier l'édition"
                    >
                      ✏️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ─── EDIT EDITION MODAL ──────────────────────── */}
      {editingEdition && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setEditingEdition(null)}>
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <div
            className="relative bg-[#12121A] border border-[#2a2a3a] rounded-2xl p-8 max-w-2xl w-full z-10 shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="font-bangers text-2xl text-white mb-1">✏️ Modifier l&apos;édition</h3>
            <p className="text-gray-500 text-sm mb-6">{editingEdition.title}</p>

            <form onSubmit={handleSaveEdit} className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Titre (FR) *</label>
                <input type="text" required value={editForm.title ?? ''} onChange={e => setEditForm({...editForm, title: e.target.value})}
                  className="cit-input w-full rounded-xl px-4 py-3 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Titre (EN)</label>
                <input type="text" value={editForm.title_en ?? ''} onChange={e => setEditForm({...editForm, title_en: e.target.value})}
                  className="cit-input w-full rounded-xl px-4 py-3 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Titre (ES)</label>
                <input type="text" value={editForm.title_es ?? ''} onChange={e => setEditForm({...editForm, title_es: e.target.value})}
                  className="cit-input w-full rounded-xl px-4 py-3 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Nom du prix *</label>
                <input type="text" required value={editForm.prize_name ?? ''} onChange={e => setEditForm({...editForm, prize_name: e.target.value})}
                  className="cit-input w-full rounded-xl px-4 py-3 text-sm" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-gray-400 mb-1">URL image du prix</label>
                <input type="url" value={editForm.prize_image_url ?? ''} onChange={e => setEditForm({...editForm, prize_image_url: e.target.value})}
                  placeholder="https://..." className="cit-input w-full rounded-xl px-4 py-3 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Date de fin *</label>
                <input type="datetime-local" required value={editForm.end_date ?? ''} onChange={e => setEditForm({...editForm, end_date: e.target.value})}
                  className="cit-input w-full rounded-xl px-4 py-3 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Date du tirage *</label>
                <input type="datetime-local" required value={editForm.draw_date ?? ''} onChange={e => setEditForm({...editForm, draw_date: e.target.value})}
                  className="cit-input w-full rounded-xl px-4 py-3 text-sm" />
              </div>

              <div className="md:col-span-2 flex flex-col gap-3">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <div
                    onClick={() => setEditForm({...editForm, is_premium: !editForm.is_premium})}
                    className={`w-11 h-6 rounded-full transition-colors flex items-center px-1 ${editForm.is_premium ? 'bg-orange-500' : 'bg-gray-600'}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${editForm.is_premium ? 'translate-x-5' : 'translate-x-0'}`} />
                  </div>
                  <span className={`text-sm font-medium ${editForm.is_premium ? 'text-orange-400' : 'text-gray-400'}`}>
                    🏇 Giveaway Premium
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <div
                    onClick={() => setEditForm({...editForm, is_active: !editForm.is_active})}
                    className={`w-11 h-6 rounded-full transition-colors flex items-center px-1 ${editForm.is_active ? 'bg-green-500' : 'bg-gray-600'}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${editForm.is_active ? 'translate-x-5' : 'translate-x-0'}`} />
                  </div>
                  <span className={`text-sm font-medium ${editForm.is_active ? 'text-green-400' : 'text-gray-400'}`}>
                    ✅ Édition active
                  </span>
                </label>
              </div>

              {editSuccess && (
                <div className="md:col-span-2 bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3">
                  <p className="text-green-400 text-sm">✓ Édition mise à jour !</p>
                </div>
              )}

              <div className="md:col-span-2 flex gap-3">
                <button type="submit" disabled={editSaving}
                  className="flex-1 bg-gold-400 hover:bg-gold-300 text-cit-dark font-bold py-3 rounded-xl transition-colors disabled:opacity-60">
                  {editSaving ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
                <button type="button" onClick={() => setEditingEdition(null)}
                  className="flex-1 bg-cit-card border border-cit-border text-gray-400 hover:text-white py-3 rounded-xl transition-colors">
                  Fermer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
