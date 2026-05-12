'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

type Props = {
  locale: string
  dragonImage: string
}

export default function GiftBoxReveal({ locale, dragonImage }: Props) {
  const [opened, setOpened] = useState(false)

  if (!opened) {
    return (
      <div className="flex flex-col items-center gap-3">
        <button
          onClick={() => setOpened(true)}
          className="group relative cursor-pointer focus:outline-none"
          aria-label="Ouvrir le cadeau surprise"
        >
          {/* Glow */}
          <div className="absolute inset-0 bg-gold-400/20 blur-2xl rounded-full scale-125 group-hover:bg-gold-400/35 transition-all duration-300" />

          {/* Box */}
          <div className="relative w-44 h-44 sm:w-52 sm:h-52 md:w-64 md:h-64 rounded-2xl overflow-hidden
            border-2 border-gold-400/40 group-hover:border-gold-400/80 transition-all duration-300
            group-hover:scale-105 transform"
            style={{ background: 'linear-gradient(135deg, #1a1208 0%, #2d1f06 100%)' }}
          >
            {/* Lid */}
            <div
              className="absolute top-0 left-0 right-0 h-[40%] flex items-center justify-center
                border-b-2 border-gold-400/30 group-hover:border-gold-400/60 transition-colors"
              style={{ background: 'linear-gradient(135deg, #2a1f08 0%, #3d2c0a 100%)' }}
            >
              {/* Ribbon horizontal */}
              <div className="absolute inset-x-0 h-4 top-1/2 -translate-y-1/2 bg-gold-400/25" />
              {/* Bow */}
              <div className="relative z-10 flex items-center gap-1">
                <div className="w-5 h-5 rounded-full border-2 border-gold-400/70 bg-gold-400/10" />
                <div className="w-6 h-6 rounded-full border-2 border-gold-400 bg-gold-400/20
                  group-hover:scale-110 transition-transform" />
                <div className="w-5 h-5 rounded-full border-2 border-gold-400/70 bg-gold-400/10" />
              </div>
            </div>

            {/* Body */}
            <div className="absolute bottom-0 left-0 right-0 top-[40%] flex items-center justify-center">
              {/* Ribbon vertical */}
              <div className="absolute inset-y-0 w-4 left-1/2 -translate-x-1/2 bg-gold-400/25" />
              <span className="relative z-10 text-5xl sm:text-6xl md:text-7xl
                group-hover:scale-110 transition-transform duration-300 select-none">
                🎁
              </span>
            </div>
          </div>
        </button>

        <p className="text-gold-400/70 text-xs uppercase tracking-widest animate-pulse">
          Clique pour ouvrir !
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4 animate-scale-in">
      <p className="text-gold-400 font-bangers text-xl uppercase tracking-widest">
        🎁 Choisis ton giveaway !
      </p>

      <div className="flex gap-3 sm:gap-4">
        {/* Dragon — gratuit */}
        <Link href={`#inscription`} className="group flex flex-col items-center gap-2">
          <div className="relative w-[130px] h-[130px] sm:w-[148px] sm:h-[148px] md:w-[168px] md:h-[168px]
            rounded-2xl overflow-hidden border-2 border-gold-400/40
            group-hover:border-gold-400 transition-all duration-300
            group-hover:scale-105 transform dragon-glow"
          >
            <Image
              src={dragonImage}
              alt="Dragon — Giveaway gratuit"
              fill
              className="object-cover"
            />
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="bg-gold-400 text-cit-dark font-bangers text-xs px-3 py-0.5 rounded-full whitespace-nowrap">
              🐉 Gratuit
            </span>
            <span className="text-gray-400 text-[10px] group-hover:text-white transition-colors">
              Participer →
            </span>
          </div>
        </Link>

        {/* VS divider */}
        <div className="flex items-center">
          <span className="font-bangers text-2xl sm:text-3xl text-gray-600">VS</span>
        </div>

        {/* Headless Horseman — premium */}
        <Link href={`/${locale}/premium`} className="group flex flex-col items-center gap-2">
          <div className="relative w-[130px] h-[130px] sm:w-[148px] sm:h-[148px] md:w-[168px] md:h-[168px]
            rounded-2xl overflow-hidden border-2 border-orange-500/40
            group-hover:border-orange-500 transition-all duration-300
            group-hover:scale-105 transform"
            style={{ boxShadow: '0 0 0 0 rgba(255,140,0,0)' }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 0 30px rgba(255,140,0,0.35)')}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 0 0 0 rgba(255,140,0,0)')}
          >
            <Image
              src="/images/Headlesshorseman.webp"
              alt="Headless Horseman — Giveaway premium"
              fill
              className="object-cover"
            />
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="bg-orange-500 text-white font-bangers text-xs px-3 py-0.5 rounded-full whitespace-nowrap">
              🎃 Premium
            </span>
            <span className="text-gray-400 text-[10px] group-hover:text-white transition-colors">
              Participer →
            </span>
          </div>
        </Link>
      </div>
    </div>
  )
}
