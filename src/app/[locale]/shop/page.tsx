import { getTranslations, setRequestLocale } from 'next-intl/server'
import Navbar from '@/components/Navbar'
import FireParticles from '@/components/FireParticles'

export default async function ShopPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('shop')
  const tFooter = await getTranslations('footer')

  return (
    <div className="min-h-screen relative">
      <FireParticles />
      <Navbar locale={locale} />

      <div className="relative z-10 pt-24 pb-20 px-4 flex flex-col items-center justify-center min-h-screen">
        <div className="text-center max-w-lg">
          <div className="text-8xl mb-6 animate-float">🚧</div>
          <h1 className="font-bangers text-6xl md:text-7xl text-white mb-4">{t('title')}</h1>
          <p className="text-gray-400 mb-8 text-lg">{t('subtitle')}</p>
          <div className="inline-flex items-center gap-2 bg-fire-500/10 border border-fire-500/30 rounded-full px-6 py-3">
            <span className="text-fire-500 text-xl">🔨</span>
            <span className="font-bangers text-fire-500 text-lg tracking-widest">{t('comingSoon')}</span>
          </div>
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
