import { getTranslations, setRequestLocale } from 'next-intl/server'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import FireParticles from '@/components/FireParticles'

async function getWinners() {
  const { data } = await supabase
    .from('winners')
    .select('*, editions(*), entries(*)')
    .order('drawn_at', { ascending: false })
  return data ?? []
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

          {winners.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🏆</div>
              <p className="text-gray-500">{t('noWinners')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {winners.map((w: any, i: number) => {
                const editionTitle = locale === 'en' ? w.editions?.title_en : locale === 'es' ? w.editions?.title_es : w.editions?.title
                return (
                  <div
                    key={w.id}
                    className={`fire-border rounded-2xl p-6 flex items-center justify-between animate-slide-in`}
                    style={{ animationDelay: `${i * 0.08}s` }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gold-400/20 border-2 border-gold-400 flex items-center justify-center">
                        <span className="font-bangers text-gold-400 text-xl">#{i + 1}</span>
                      </div>
                      <div>
                        <p className="font-bangers text-2xl text-gold-400">{w.entries?.roblox_username}</p>
                        <p className="text-gray-500 text-sm">{editionTitle} — {w.editions?.prize_name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl">🏆</span>
                      <p className="text-gray-600 text-xs mt-1">
                        {new Date(w.drawn_at).toLocaleDateString(
                          locale === 'en' ? 'en-US' : locale === 'es' ? 'es-ES' : 'fr-FR',
                          { day: 'numeric', month: 'long', year: 'numeric' }
                        )}
                      </p>
                    </div>
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
