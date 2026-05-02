'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const FlagFR = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 2" width="18" height="12" className="rounded-sm shrink-0">
    <rect width="1" height="2" fill="#002395"/>
    <rect x="1" width="1" height="2" fill="#fff"/>
    <rect x="2" width="1" height="2" fill="#ED2939"/>
  </svg>
)
const FlagEN = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30" width="18" height="12" className="rounded-sm shrink-0">
    <clipPath id="uk-clip"><path d="M0,0 h60 v30 h-60 z"/></clipPath>
    <path d="M0,0 v30 h60 v-30 z" fill="#012169"/>
    <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
    <path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" strokeWidth="4"/>
    <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10"/>
    <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6"/>
  </svg>
)
const FlagES = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 2" width="18" height="12" className="rounded-sm shrink-0">
    <rect width="3" height="2" fill="#c60b1e"/>
    <rect y="0.5" width="3" height="1" fill="#ffc400"/>
  </svg>
)

const locales = [
  { code: 'fr', label: 'FR', Flag: FlagFR },
  { code: 'en', label: 'EN', Flag: FlagEN },
  { code: 'es', label: 'ES', Flag: FlagES },
]

export default function Navbar({ locale }: { locale: string }) {
  const t = useTranslations('nav')
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  function switchLocale(newLocale: string) {
    // Remplace le segment locale dans l'URL (ex: /fr/winners → /en/winners)
    const segments = pathname.split('/')
    segments[1] = newLocale
    window.location.href = segments.join('/')
  }

  const links = [
    { href: `/${locale}`, label: t('home') },
    { href: `/${locale}/winners`, label: t('winners') },
    { href: `/${locale}/shop`, label: t('shop') },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-cit-dark/95 backdrop-blur-md border-b border-cit-border">
      <div className="max-w-6xl mx-auto px-4 h-14 md:h-16 flex items-center justify-between gap-3">

        {/* Logo */}
        <Link href={`/${locale}`} className="flex items-center gap-2 shrink-0 group">
          <span className="text-xl md:text-2xl font-bangers text-gold-400 tracking-wider group-hover:text-gold-300 transition-colors">
            CIT<span className="text-fire-500">give</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-gold-400 ${
                pathname === link.href ? 'text-gold-400' : 'text-gray-400'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Language switcher */}
          <div className="flex items-center gap-0.5 bg-cit-card border border-cit-border rounded-lg p-1">
            {locales.map(({ code, label, Flag }) => (
              <button
                key={code}
                onClick={() => switchLocale(code)}
                className={`flex items-center gap-1 text-xs px-1.5 md:px-2 py-1 rounded font-medium transition-all ${
                  locale === code
                    ? 'bg-gold-400 text-cit-dark'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Flag />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-gray-400 hover:text-white p-2 rounded-lg border border-cit-border"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <div className={`w-4 h-0.5 bg-current transition-all duration-200 mb-1 ${menuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
            <div className={`w-4 h-0.5 bg-current transition-all duration-200 mb-1 ${menuOpen ? 'opacity-0' : ''}`} />
            <div className={`w-4 h-0.5 bg-current transition-all duration-200 ${menuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-cit-border bg-cit-card/98 backdrop-blur-md">
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`block px-5 py-4 text-base font-medium border-b border-cit-border/50 transition-colors hover:text-gold-400 ${
                pathname === link.href ? 'text-gold-400' : 'text-gray-300'
              }`}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <a
            href="https://discord.gg/QmNt77eB6h"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-4 text-base font-medium text-gray-300 hover:text-indigo-400 transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.033.052a19.98 19.98 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.201 13.201 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
            </svg>
            Discord
          </a>
        </div>
      )}
    </nav>
  )
}
