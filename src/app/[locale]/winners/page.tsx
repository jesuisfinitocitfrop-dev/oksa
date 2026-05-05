import { getTranslations, setRequestLocale } from 'next-intl/server'
import { supabase, getServiceClient } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import FireParticles from '@/components/FireParticles'
import { SupporterBadge } from '@/components/SupportersBadge'
import EzoicAd from '@/components/EzoicAd'

async function getWinners() {
  const db = getServiceClient()
  const { data: winners } = await db
    .from('winners')
    .select('*, editions(*), entries(*)')
    .order('drawn_at', { ascending: false })

  if (!winners) return []

  // Fetch boost info for each winner's entry
  const enriched = await Promise.all(
    winners.map(async (w: any) => {
      const entryId = w.entry_id

      const { data: completions } = await db
        .from('bonus_completions')
        .select('bonus_actions(label, icon, bonus_chances)')
        .eq('entry_id', entryId)

      const { data: payments } = await db
        .from('payments')
        .select('amount_eur, chances_added')
        .eq('entry_id', entryId)
        .eq('status', 'completed')

      const totalPaid = (payments ?? []).reduce((s: number, p: any) => s + p.amount_eur, 0)
      const bonusList = (completions ?? []).map((c: any) => c.bonus_actions).filter(Boolean)

      return { ...w, bonusList, totalPaid }
    })
  )

  return enriched
}

export default async function WinnersPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('winners')
  const tFooter = await getTranslations('footer')
  const winners = await getWinners()

  return (
    <div className="min-h-screen relative">
      <FireParticles />
      <Navbar locale={locale} />

      <div className="relative z-10 pt-24 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="font-bangers text-6xl md:text-7xl text-white mb-2">
              {t('title')}
            </h1>
            <p className="text-gray-400">{t('subtitle')}</p>
          </div>

          {/* ── PUB 103 — sous le titre, avant la liste ── */}
          <EzoicAd id={103} className="flex justify-center mb-8" />

          {winners.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🏆</div>
              <p className="text-gray-500">{t('noWinners')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {winners.map((w: any, i: number) => {
                const editionTitle = locale === 'en' ? w.editions?.title_en : locale === 'es' ? w.editions?.title_es : w.editions?.title
                const totalChances = w.entries?.chances ?? 1
                const bonusList: any[] = w.bonusList ?? []
                const totalPaid: number = w.totalPaid ?? 0

                return (
                  <div
                    key={w.id}
                    className="fire-border rounded-2xl p-6 animate-slide-in"
                    style={{ animationDelay: `${i * 0.08}s` }}
                  >
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gold-400/20 border-2 border-gold-400 flex items-center justify-center shrink-0">
                          <span className="font-bangers text-gold-400 text-xl">#{i + 1}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-bangers text-2xl text-gold-400">{w.entries?.roblox_username}</p>
                            {totalPaid > 0 && <SupporterBadge amount={totalPaid} />}
                          </div>
                          <p className="text-gray-500 text-sm">{editionTitle} — {w.editions?.prize_name}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-2xl">🏆</span>
                        <p className="text-gray-600 text-xs mt-1">
                          {new Date(w.drawn_at).toLocaleDateString(
                            locale === 'en' ? 'en-US' : locale === 'es' ? 'es-ES' : 'fr-FR',
                            { day: 'numeric', month: 'long', year: 'numeric' }
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Boost info */}
                    {(totalChances > 1 || bonusList.length > 0 || totalPaid > 0) && (
                      <div className="border-t border-cit-border pt-3 mt-2">
                        <p className="text-xs text-gray-500 mb-2">
                          🎯 A participé avec <strong className="text-gold-400">{totalChances} chances</strong>
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {bonusList.map((b: any, j: number) => (
                            <span key={j} className="text-xs bg-gold-400/10 text-gold-400 border border-gold-400/20 px-2 py-0.5 rounded-full">
                              {b.icon} {b.label} (+{b.bonus_chances})
                            </span>
                          ))}
                          {totalPaid > 0 && (
                            <span className="text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full">
                              💎 Boosté {totalPaid}€ (+{totalPaid * 100} chances)
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <footer className="relative z-10 border-t border-cit-border py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="font-bangers text-2xl">CIT<span className="text-fire-500">give</span></div>
          <p className="text-gray-600 text-xs">© {new Date().getFullYear()} CIT. {tFooter('rights')}</p>
        </div>
      </footer>
    </div>
  )
}
