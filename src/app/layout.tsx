import type { Metadata } from 'next'
import Script from 'next/script'
import { Analytics } from '@vercel/analytics/next'
import './[locale]/globals.css'

export const metadata: Metadata = {
  title: 'CITgive — Giveaway Steal a Brainrot',
  description: 'Participe gratuitement au giveaway CIT et gagne des brainrots légendaires dans Steal a Brainrot !',
  icons: {
    icon: '/images/favicon.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Bangers&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/images/favicon.png" />

        {/* Ezoic — Privacy/CMP scripts (RGPD, doit charger en premier) */}
        <script data-cfasync="false" src="https://cmp.gatekeeperconsent.com/min.js" async />
        <script data-cfasync="false" src="https://the.gatekeeperconsent.com/cmp.min.js" async />
      </head>
      <body suppressHydrationWarning className="bg-cit-dark text-white font-inter antialiased">
        {children}
        <Analytics />

        {/* Ezoic — Script principal */}
        <Script
          src="//www.ezojs.com/ezoic/sa.min.js"
          strategy="afterInteractive"
        />
        <Script id="ezoic-init" strategy="afterInteractive">{`
          window.ezstandalone = window.ezstandalone || {};
          ezstandalone.cmd = ezstandalone.cmd || [];
        `}</Script>

        {/* Ezoic — Analytics */}
        <Script
          src="//ezoicanalytics.com/analytics.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  )
}
