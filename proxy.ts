/**
 * Next.js Proxy
 * Handles route protection and redirects
 * Preserves intended URL after login (callbackUrl)
 */

import { NextRequest, NextResponse } from 'next/server'
import { ROUTES } from './src/constants/routes'

const AUTH_TOKEN_KEY = 'auth_token'
const ROOT_PATH = '/'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get(AUTH_TOKEN_KEY)?.value
  const isAuthenticated = !!token

  console.log('[PROXY] Request:', { pathname, isAuthenticated })

  // Public routes that don't require authentication
  const publicRoutes = [ROUTES.LOGIN]

  // Check if route is public
  const isPublicRoute = publicRoutes.some(route =>
    pathname.startsWith(route)
  )

  // Handle root path "/"
  if (pathname === ROOT_PATH) {
    console.log('[PROXY] Root path detected, redirecting...')
    if (isAuthenticated) {
      return NextResponse.redirect(new URL(ROUTES.DASHBOARD, request.url))
    } else {
      return NextResponse.redirect(new URL(ROUTES.LOGIN, request.url))
    }
  }

  // Redirect authenticated users away from login page
  if (isAuthenticated && isPublicRoute && pathname.startsWith(ROUTES.LOGIN)) {
    // Check if there's a callback URL to redirect to
    const callbackUrl = request.nextUrl.searchParams.get('callbackUrl')
    const redirectUrl = callbackUrl || ROUTES.DASHBOARD
    console.log('[PROXY] Redirecting from login to:', redirectUrl)
    return NextResponse.redirect(new URL(redirectUrl, request.url))
  }

  // Redirect unauthenticated users to login with callback URL
  if (!isAuthenticated && !isPublicRoute) {
    const loginUrl = new URL(ROUTES.LOGIN, request.url)
    // Save the intended URL as callbackUrl parameter
    loginUrl.searchParams.set('callbackUrl', pathname)
    console.log('[PROXY] Not authenticated, redirecting to login with callback:', pathname)
    return NextResponse.redirect(loginUrl)
  }

  console.log('[PROXY] Allowing request to proceed')
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
