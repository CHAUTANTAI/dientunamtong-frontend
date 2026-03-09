/**
 * Next.js Proxy
 * Handles auth protection and redirects
 * Preserves intended URL after login (callbackUrl)
 */

import { NextRequest, NextResponse } from 'next/server';
import { ROUTES } from './src/constants/routes';

const AUTH_TOKEN_KEY = 'auth_token';
const ROOT_PATH = '/';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_TOKEN_KEY)?.value;
  const isAuthenticated = !!token;

  console.log('[PROXY] Request:', { pathname, isAuthenticated });

  // Public routes that don't require authentication
  const publicRoutes = [
    ROUTES.LOGIN,
    ROUTES.HOME,
    ROUTES.CATEGORIES,
    ROUTES.PRODUCTS,
    ROUTES.CONTACT,
    ROUTES.ABOUT,
  ];

  // Check if route is public or if it's an admin route
  const isPublicRoute = publicRoutes.some((route) => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
  const isAdminRoute = pathname.startsWith('/admin');

  // Handle root path "/" - already home page, let it through
  if (pathname === ROOT_PATH) {
    return NextResponse.next();
  }

  // Redirect authenticated users away from login page
  if (isAuthenticated && (pathname.startsWith(ROUTES.LOGIN) || pathname.startsWith('/admin/auth'))) {
    const callbackUrl = request.nextUrl.searchParams.get('callbackUrl');
    const redirectUrl = callbackUrl || ROUTES.DASHBOARD;
    console.log('[PROXY] Redirecting authenticated user from login to:', redirectUrl);
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  // Redirect unauthenticated users to login only for admin routes
  if (!isAuthenticated && isAdminRoute) {
    const loginUrl = new URL(ROUTES.LOGIN, request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    console.log('[PROXY] Not authenticated, redirecting to login with callback:', pathname);
    return NextResponse.redirect(loginUrl);
  }

  console.log('[PROXY] Allowing request to proceed');
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};

