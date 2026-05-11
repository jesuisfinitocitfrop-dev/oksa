'use client'

import Link from 'next/link'

export default function PremiumBanner({ locale }: { locale: string }) {
  return (
    <div className="mt-6 rounded-2xl overflow-hidden border border-orange-500/40 bg-gradient-to-br from-orange-500/10 to-amber-600/5 p-5 animate-scale-in">
      <div className="flex items-start gap-4">
        <div className="text-4xl shrink-0 animate-float">🎃</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-widest text-orange-400 bg-orange-500/20 px-2 py-0.5 rounded-full">
              EXCLUSIF
            </span>
          </div>
          <h3 className="font-bangers text-xl text-white mb-1">
            Gagne le Headless Horseman !
          </h3>
          <p className="text-gray-400 text-xs leading-relaxed mb-4">
            Accède aux giveaways premium avec des objets ultra-rares de Steal a Brainrot.
            Dès <span className="text-orange-400 font-semibold">5€/mois</span>, multiplie tes chances de gagner.
          </p>
          <Link
            href={`/${locale}/premium`}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-bangers text-base px-5 py-2.5 rounded-xl transition-all"
          >
            🏇 VOIR LE GIVEAWAY PREMIUM
          </Link>
        </div>
      </div>
    </div>
  )
}
