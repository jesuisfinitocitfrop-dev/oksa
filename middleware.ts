import createMiddleware from 'next-intl/middleware'
import { NextRequest, NextResponse } from 'next/server'
import { routing } from './src/i18n/routing'

const intlMiddleware = createMiddleware(routing)

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip i18n for API routes
  if (pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  // Admin auth check (after locale prefix)
  const isAdminPath = pathname.match(/^\/(fr|en|es)\/admin(?!\/login)/)
  if (isAdminPath) {
    const session = request.cookies.get('citgive-admin-session')
    if (!session?.value) {
      const locale = pathname.split('/')[1]
      return NextResponse.redirect(new URL(`/${locale}/admin/login`, request.url))
    }
  }

  return intlMiddleware(request)
}

export const config = {
  matcher: ['/((?!_next|_vercel|.*\\..*).*)'],
}
