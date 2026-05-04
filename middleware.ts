import createMiddleware from 'next-intl/middleware'
import { NextRequest, NextResponse } from 'next/server'
import { routing } from './src/i18n/routing'

const intlMiddleware = createMiddleware(routing)

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  // With localePrefix: 'as-needed', French paths have no prefix:
  //   /admin/dashboard  → French admin
  //   /en/admin/dashboard → English admin
  // Include fr prefix too so /fr/admin/* redirects to login before next-intl rewrites it
  const isAdminPath = pathname.match(/^\/(?:(fr|en|es)\/)?admin(?!\/login)(?:\/|$)/)
  if (isAdminPath) {
    const session = request.cookies.get('citgive-admin-session')
    if (!session?.value) {
      const locale = isAdminPath[1] ?? 'fr'
      const loginPath = locale === 'fr' ? '/admin/login' : `/${locale}/admin/login`
      return NextResponse.redirect(new URL(loginPath, request.url))
    }
  }

  return intlMiddleware(request)
}

export const config = {
  matcher: ['/((?!_next|_vercel|.*\\..*).*)'],
}
