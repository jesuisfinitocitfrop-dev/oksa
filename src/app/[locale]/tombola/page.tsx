import { redirect } from 'next/navigation'

// Tombola page redirects to home (form is on homepage)
export default async function TombolaPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  redirect(`/${locale}#inscription`)
}
