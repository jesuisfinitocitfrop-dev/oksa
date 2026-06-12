import type { Metadata } from 'next'
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

        {/* CPAGrip — Content Locker */}
        <script type="text/javascript" src="https://getafilenow.com/script_include.php?id=1894796" async />

      </head>
      <body suppressHydrationWarning className="bg-cit-dark text-white font-inter antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
