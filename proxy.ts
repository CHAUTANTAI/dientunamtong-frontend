/**
 * Next.js Proxy
 * Handles route protection and redirects
 */

import { NextRequest, NextResponse } from 'next/server'
import { ROUTES } from './src/constants/routes'

const AUTH_TOKEN_KEY = 'auth_token'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get(AUTH_TOKEN_KEY)?.value

  // Public routes that don't require authentication
  const publicRoutes = [ROUTES.LOGIN]

  // Check if route is public
  const isPublicRoute = publicRoutes.some(route =>
    pathname.startsWith(route)
  )

  // Accessing protected route without token → redirect to login
  if (!isPublicRoute && !token) {
    return NextResponse.redirect(
      new URL(ROUTES.LOGIN, request.url)
    )
  }

  // Accessing login while already authenticated → redirect to dashboard
  if (isPublicRoute && token && pathname.startsWith(ROUTES.LOGIN)) {
    return NextResponse.redirect(
      new URL(ROUTES.DASHBOARD, request.url)
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /**
     * Match all request paths except:
     * - api routes
     * - static files
     * - image optimization
     * - favicon
     * - public assets
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}
