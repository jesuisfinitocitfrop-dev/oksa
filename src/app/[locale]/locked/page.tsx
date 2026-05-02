import { setRequestLocale } from 'next-intl/server'
import Link from 'next/link'

export default async function LockedPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-cit-dark">
      <div className="text-center max-w-md">
        <div className="text-7xl mb-6 animate-pulse">🔒</div>
        <h1 className="font-bangers text-5xl text-gold-400 mb-3">Site Privé</h1>
        <p className="text-gray-400 text-base mb-2">
          Ce site est actuellement en mode privé.
        </p>
        <p className="text-gray-600 text-sm mb-8">
          Le giveaway CIT arrive bientôt — abonne-toi à la chaîne pour ne rien rater !
        </p>
        <a
          href="https://youtube.com/@CITlevrai"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold px-6 py-3 rounded-xl transition-colors"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8zM9.7 15.5V8.5l6.3 3.5-6.3 3.5z"/>
          </svg>
          Chaîne YouTube CIT
        </a>
        <div className="mt-6">
          <Link href={`/${locale}/admin/login`} className="text-gray-700 hover:text-gray-500 text-xs transition-colors">
            Admin
          </Link>
        </div>
      </div>
    </div>
  )
}
