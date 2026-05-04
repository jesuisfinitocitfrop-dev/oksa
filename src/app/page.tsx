// citgive.com/ — sert le contenu français directement (200 OK, pas de redirect → bon pour le SEO)
import { getMessages, setRequestLocale } from 'next-intl/server'
import { NextIntlClientProvider } from 'next-intl'
import LocaleHomePage from '@/app/[locale]/page'

export default async function RootPage() {
  setRequestLocale('fr')
  const messages = await getMessages()

  return (
    <NextIntlClientProvider locale="fr" messages={messages}>
      <LocaleHomePage params={Promise.resolve({ locale: 'fr' })} />
    </NextIntlClientProvider>
  )
}
