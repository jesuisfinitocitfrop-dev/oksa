import { getTranslations, setRequestLocale } from 'next-intl/server'
import Navbar from '@/components/Navbar'
import FireParticles from '@/components/FireParticles'
import ColorDice from '@/components/ColorDice'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'dice' })
  return { title: `${t('title')} — CITgive` }
}

export default async function DicePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('dice')
  const tFooter = await getTranslations('footer')

  return (
    <div className="min-h-screen relative">
      <FireParticles />
      <Navbar locale={locale} />

      <div className="relative z-10 pt-24 pb-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="font-bangers text-6xl md:text-7xl text-white mb-2">
              🎲 {t('title')}
            </h1>
            <p className="text-gray-400">{t('subtitle')}</p>
          </div>

          <ColorDice />
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
