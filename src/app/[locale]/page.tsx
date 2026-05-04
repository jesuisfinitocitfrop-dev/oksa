import { getTranslations, setRequestLocale } from 'next-intl/server'
import Image from 'next/image'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import FireParticles from '@/components/FireParticles'
import CountdownTimer from '@/components/CountdownTimer'
import ParticipantCounter from '@/components/ParticipantCounter'
import EntryForm from '@/components/EntryForm'
import RulesModal from '@/components/RulesModal'
import TungTungGame from '@/components/TungTungGame'
import { Link } from '@/navigation'

async function getActiveEdition() {
  if (!isSupabaseConfigured) return null
  try {
    const { data } = await supabase
      .from('editions')
      .select('*')
      .eq('is_active', true)
      .eq('is_drawn', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    return data
  } catch {
    return null
  }
}

async function getEntryCount(editionId: string) {
  if (!isSupabaseConfigured) return 0
  try {
    const { count } = await supabase
      .from('entries')
      .select('*', { count: 'exact', head: true })
      .eq('edition_id', editionId)
    return count ?? 0
  } catch {
    return 0
  }
}

async function getPastWinners() {
  if (!isSupabaseConfigured) return []
  try {
    const { data } = await supabase
      .from('winners')
      .select('*, editions(*), entries(*)')
      .order('drawn_at', { ascending: false })
      .limit(5)
    return data ?? []
  } catch {
    return []
  }
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('hero')
  const tHow = await getTranslations('how')
  const tWinners = await getTranslations('winners')
  const tFooter = await getTranslations('footer')
  const edition = await getActiveEdition()
  const entryCount = edition ? await getEntryCount(edition.id) : 0
  const pastWinners = await getPastWinners()

  const editionTitle =
    locale === 'en' ? edition?.title_en :
    locale === 'es' ? edition?.title_es :
    edition?.title

  const dragonImage = edition?.prize_image_url || '/images/dragon.png'

  return (
    <div className="min-h-screen relative">
      <FireParticles />
      <Navbar locale={locale} />

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-16 pb-12 z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,215,0,0.07)_0%,_transparent_65%)] pointer-events-none" />

        {edition ? (
          <div className="flex flex-col items-center w-full max-w-4xl">

            {/* Badge */}
            <div className="flex items-center gap-2 bg-gold-400/10 border border-gold-400/30 rounded-full px-3 md:px-4 py-1.5 mb-4 md:mb-6">
              <span className="w-2 h-2 bg-gold-400 rounded-full animate-pulse shrink-0"></span>
              <span className="text-gold-400 text-xs md:text-sm font-medium uppercase tracking-widest">
                {t('badge')}
              </span>
            </div>

            {/* Title + Dragon side by side on large, stacked on mobile */}
            <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-12 mb-6 w-full">

              {/* Left: text */}
              <div className="flex-1 text-center lg:text-left">
                <h1 className="font-bangers leading-none mb-2">
                  <span className="text-white text-4xl sm:text-5xl md:text-6xl lg:text-7xl block">
                    {t('title')}
                  </span>
                  <span className="text-gold-gradient text-5xl sm:text-6xl md:text-7xl lg:text-8xl block mt-1">
                    {t('titleHighlight')}
                  </span>
                </h1>
                <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-md mx-auto lg:mx-0 mt-3 mb-5">
                  {t('subtitle')}
                </p>

                {/* Participant count */}
                <ParticipantCounter editionId={edition.id} initial={entryCount} createdAt={edition.created_at} />

                {/* CTA buttons */}
                <div className="flex flex-col sm:flex-row gap-3 mt-5 justify-center lg:justify-start">
                  <a
                    href="#inscription"
                    className="btn-fire rounded-xl md:rounded-2xl px-6 md:px-8 py-3.5 md:py-4 font-bangers text-xl md:text-2xl text-cit-dark tracking-wider text-center"
                  >
                    <span>🐉 {t('cta')}</span>
                  </a>
                  <a
                    href="https://youtube.com/@CITlevrai"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-cit-card border border-cit-border rounded-xl md:rounded-2xl px-5 py-3.5 text-gray-300 hover:text-white hover:border-gray-500 transition-colors text-sm md:text-base"
                  >
                    <svg className="w-4 h-4 text-red-500 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8zM9.7 15.5V8.5l6.3 3.5-6.3 3.5z"/>
                    </svg>
                    {t('watchYoutube')}
                  </a>
                </div>
              </div>

              {/* Right: dragon image */}
              <div className="shrink-0 animate-float">
                <div className="relative">
                  <Image
                    src={dragonImage}
                    alt={edition.prize_name}
                    width={280}
                    height={280}
                    className="dragon-glow rounded-2xl w-44 h-44 sm:w-52 sm:h-52 md:w-64 md:h-64 lg:w-72 lg:h-72 object-cover"
                    priority
                  />
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap">
                    <span className="bg-gold-400 text-cit-dark font-bangers text-sm md:text-base px-3 py-1 rounded-full">
                      {edition.prize_name}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Countdown */}
            <div className="mt-6 md:mt-8 w-full flex justify-center">
              <CountdownTimer drawDate={edition.draw_date} />
            </div>
          </div>

        ) : (
          /* No active edition */
          <div className="text-center px-4">
            <div className="relative inline-block mb-6 animate-float">
              <Image
                src="/images/dragon.png"
                alt="Dragon CITgive"
                width={200}
                height={200}
                className="dragon-glow rounded-2xl w-36 h-36 md:w-48 md:h-48 object-cover mx-auto"
                priority
              />
            </div>
            <h2 className="font-bangers text-3xl md:text-4xl text-gold-400 mb-3">{t('noEdition')}</h2>
            <p className="text-gray-400 max-w-sm md:max-w-md mx-auto text-sm md:text-base">{t('noEditionSub')}</p>
            <a
              href="https://youtube.com/@CITlevrai"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-fire inline-flex items-center gap-2 mt-6 rounded-xl md:rounded-2xl px-6 md:px-8 py-3 font-bangers text-lg md:text-xl text-cit-dark"
            >
              <span>📺 {t('watchYoutube')}</span>
            </a>
          </div>
        )}
      </section>

      {/* ── INSCRIPTION FORM ──────────────────────────────── */}
      {edition && (
        <section id="inscription" className="relative z-10 py-12 md:py-20 px-4">
          <div className="max-w-md mx-auto">
            <div className="fire-border rounded-2xl p-5 md:p-8">
              <FormSection editionId={edition.id} locale={locale} />
            </div>
          </div>
        </section>
      )}

      {/* ── HOW IT WORKS ──────────────────────────────────── */}
      <section className="relative z-10 py-12 md:py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-bangers text-4xl md:text-5xl text-center text-white mb-8 md:mb-12">
            {tHow('title')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
            {[
              { num: '1', title: tHow('step1Title'), desc: tHow('step1Desc'), icon: '📧' },
              { num: '2', title: tHow('step2Title'), desc: tHow('step2Desc'), icon: '⏳' },
              { num: '3', title: tHow('step3Title'), desc: tHow('step3Desc'), icon: '🏆' },
            ].map(step => (
              <div key={step.num} className="step-card rounded-2xl p-5 md:p-6 text-center">
                <div className="text-3xl md:text-4xl mb-2 md:mb-3">{step.icon}</div>
                <div className="font-bangers text-gold-400 text-4xl md:text-5xl mb-1 md:mb-2">{step.num}</div>
                <h3 className="font-bold text-white text-base md:text-lg mb-1 md:mb-2">{step.title}</h3>
                <p className="text-gray-400 text-xs md:text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PAST WINNERS ──────────────────────────────────── */}
      {pastWinners.length > 0 && (
        <section className="relative z-10 py-12 md:py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-bangers text-4xl md:text-5xl text-center text-white mb-3 md:mb-4">
              {tWinners('title')}
            </h2>
            <p className="text-gray-400 text-center text-sm md:text-base mb-8 md:mb-10">{tWinners('subtitle')}</p>
            <div className="space-y-3">
              {pastWinners.map((w: any) => (
                <div key={w.id} className="bg-cit-card border border-cit-border rounded-xl px-4 md:px-6 py-3 md:py-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 md:gap-4 min-w-0">
                    <span className="text-xl md:text-2xl shrink-0">🏆</span>
                    <div className="min-w-0">
                      <p className="font-bold text-gold-400 truncate">{w.entries?.roblox_username}</p>
                      <p className="text-gray-500 text-xs md:text-sm truncate">{w.editions?.prize_name}</p>
                    </div>
                  </div>
                  <p className="text-gray-600 text-xs shrink-0">
                    {new Date(w.drawn_at).toLocaleDateString(
                      locale === 'en' ? 'en-US' : locale === 'es' ? 'es-ES' : 'fr-FR',
                      { day: 'numeric', month: 'short', year: 'numeric' }
                    )}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── MINI-JEU ──────────────────────────────────────── */}
      <section className="relative z-10 py-12 md:py-16 px-4 border-t border-cit-border">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-bangers text-3xl md:text-4xl text-center text-white mb-2">
            🥁 TUNG TUNG RUN
          </h2>
          <p className="text-gray-500 text-sm text-center mb-6">
            Aide Tung Tung Sahur à esquiver les obstacles !
          </p>
          <TungTungGame />
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-cit-border py-8 md:py-10 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="font-bangers text-xl md:text-2xl">
            CIT<span className="text-fire-500">give</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-xs md:text-sm text-gray-500">
            <a href="https://youtube.com/@CITlevrai" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">{tFooter('youtube')}</a>
            <a href="https://discord.gg/QmNt77eB6h" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 transition-colors">{tFooter('discord')}</a>
            <RulesModal className="hover:text-white transition-colors text-gray-500 text-xs md:text-sm" />
          </div>
          <p className="text-gray-600 text-xs">© {new Date().getFullYear()} CIT. {tFooter('rights')}</p>
        </div>
      </footer>
    </div>
  )
}

async function FormSection({ editionId, locale }: { editionId: string; locale: string }) {
  const t = await getTranslations('form')
  return (
    <div>
      <h2 className="font-bangers text-2xl md:text-3xl text-white mb-1 text-center">{t('title')}</h2>
      <p className="text-gray-500 text-xs md:text-sm text-center mb-5 md:mb-6">{t('subtitle')}</p>
      <EntryForm editionId={editionId} locale={locale} />
    </div>
  )
}
