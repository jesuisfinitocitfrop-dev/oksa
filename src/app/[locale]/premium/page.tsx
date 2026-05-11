export const dynamic = 'force-dynamic'

import { setRequestLocale } from 'next-intl/server'
import Image from 'next/image'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import FireParticles from '@/components/FireParticles'
import PremiumEntrySection from '@/components/PremiumEntrySection'

async function getActivePremiumEdition() {
  if (!isSupabaseConfigured) return null
  try {
    const { data } = await supabase
      .from('editions')
      .select('id, prize_name, prize_image_url, end_date, draw_date')
      .eq('is_active', true)
      .eq('is_drawn', false)
      .eq('is_premium', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    return data
  } catch {
    return null
  }
}

const TIERS = [
  {
    id: 'starter',
    price: 5,
    badge: '🎫',
    giveaways: 1,
    bonusChances: 0,
    color: 'from-blue-500/20 to-blue-600/5',
    border: 'border-blue-500/30',
    perks: ['1 giveaway premium / mois', 'Accès aux objets ultra-rares', 'Badge Supporter exclusif'],
  },
  {
    id: 'plus',
    price: 9,
    badge: '💎',
    giveaways: 4,
    bonusChances: 0,
    popular: true,
    color: 'from-purple-500/20 to-purple-600/5',
    border: 'border-purple-500/40',
    perks: ['4 giveaways premium / mois', 'Accès aux objets ultra-rares', 'Badge Supporter exclusif'],
  },
  {
    id: 'vip',
    price: 19,
    badge: '👑',
    giveaways: -1,
    bonusChances: 1000,
    color: 'from-amber-500/20 to-amber-600/5',
    border: 'border-amber-400/40',
    perks: ['Giveaways illimités / mois', '+1 000 chances par giveaway', 'Badge VIP exclusif', 'Accès prioritaire aux objets rares'],
  },
]

export default async function PremiumPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const edition = await getActivePremiumEdition()

  return (
    <div className="min-h-screen relative">
      <FireParticles />
      <Navbar locale={locale} />

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative pt-28 pb-12 px-4 z-10 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,140,0,0.09)_0%,_transparent_65%)] pointer-events-none" />

        <div className="max-w-4xl mx-auto">
          {/* Badge */}
          <div className="flex items-center justify-center gap-2 bg-orange-500/10 border border-orange-500/30 rounded-full px-4 py-1.5 mb-6 w-fit mx-auto">
            <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
            <span className="text-orange-400 text-xs font-medium uppercase tracking-widest">GIVEAWAY PREMIUM</span>
          </div>

          {/* Title */}
          <h1 className="font-bangers leading-none mb-4">
            <span className="text-white text-4xl sm:text-5xl md:text-6xl block">GAGNE LE</span>
            <span
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl block mt-1"
              style={{
                background: 'linear-gradient(135deg, #ff6b00, #ff9500, #ffcc00)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              HEADLESS HORSEMAN
            </span>
          </h1>

          <p className="text-gray-400 text-base max-w-md mx-auto mb-10">
            Giveaways premium exclusifs avec les objets les plus rares de Steal a Brainrot.
            Abonne-toi et multiplie tes chances.
          </p>

          {/* Prize image */}
          <div className="relative inline-block animate-float mb-12">
            <div className="absolute inset-0 bg-orange-500/20 blur-3xl rounded-full scale-150" />
            <div className="relative rounded-2xl overflow-hidden w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 mx-auto"
              style={{ boxShadow: '0 0 60px rgba(255, 140, 0, 0.4)' }}>
              <Image
                src={edition?.prize_image_url || '/images/Headlesshorseman.webp'}
                alt="Headless Horseman"
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap">
              <span className="bg-orange-500 text-white font-bangers text-sm px-4 py-1 rounded-full">
                🎃 Headless Horseman
              </span>
            </div>
          </div>

          {/* Pricing cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto mb-14">
            {TIERS.map(tier => (
              <div
                key={tier.id}
                className={`relative bg-gradient-to-b ${tier.color} border ${tier.border} rounded-2xl p-6 text-left ${tier.popular ? 'ring-2 ring-purple-400/40 scale-[1.02]' : ''}`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-500 text-white text-[10px] font-bold uppercase px-3 py-1 rounded-full whitespace-nowrap">
                    ⭐ Populaire
                  </div>
                )}
                <div className="text-3xl mb-2">{tier.badge}</div>
                <div className="font-bangers text-2xl text-white">{tier.id.toUpperCase()}</div>
                <div className="flex items-end gap-1 mb-4">
                  <span className="font-bangers text-4xl text-gold-400">{tier.price}€</span>
                  <span className="text-gray-400 text-xs mb-1.5">/mois</span>
                </div>
                <ul className="space-y-2">
                  {tier.perks.map(perk => (
                    <li key={perk} className="flex items-start gap-2 text-sm text-gray-300">
                      <span className="text-green-400 mt-0.5 shrink-0">✓</span>
                      {perk}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Subscription form */}
          <div className="fire-border rounded-2xl p-6 md:p-8 max-w-md mx-auto">
            <PremiumEntrySection edition={edition} locale={locale} />
          </div>

          {/* FAQ mini */}
          <div className="mt-10 max-w-md mx-auto text-left space-y-4">
            <h3 className="font-bangers text-xl text-white text-center mb-4">Questions fréquentes</h3>
            {[
              { q: 'Comment fonctionne l\'abonnement ?', a: 'Tu t\'abonnes chaque mois et obtiens des slots pour participer aux giveaways premium. Tu peux te désabonner à tout moment.' },
              { q: 'C\'est quoi le Headless Horseman ?', a: 'Un des objets les plus rares et les plus recherchés de Steal a Brainrot sur Roblox. Valeur estimée à des milliers de Robux.' },
              { q: 'Comment sont tirées les chances VIP ?', a: 'Les abonnés VIP entrent dans chaque giveaway avec +1 000 chances supplémentaires, ce qui augmente massivement leurs probabilités de gagner.' },
            ].map(({ q, a }) => (
              <div key={q} className="bg-cit-card border border-cit-border rounded-xl p-4">
                <p className="text-white font-semibold text-sm mb-1">{q}</p>
                <p className="text-gray-400 text-xs leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-cit-border py-8 px-4 mt-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-gray-600">
          <span className="font-bangers text-xl">CIT<span className="text-fire-500">give</span></span>
          <span>Abonnement mensuel — résiliation à tout moment — paiement via Stripe</span>
          <span>© {new Date().getFullYear()} CIT. Tous droits réservés.</span>
        </div>
      </footer>
    </div>
  )
}
