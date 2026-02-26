/**
 * Next.js Proxy
 * Handles i18n routing, auth protection and redirects
 * Preserves intended URL after login (callbackUrl)
 */

import { NextRequest, NextResponse } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { locales, defaultLocale, type Locale } from './src/i18n';
import { ROUTES } from './src/constants/routes';

const AUTH_TOKEN_KEY = 'auth_token';

// Create i18n middleware
const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed',
});

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Step 1: Handle i18n routing first
  const intlResponse = intlMiddleware(request);
  
  // Extract locale from pathname or response headers
  let locale: Locale = defaultLocale;
  
  // Check if pathname already has locale prefix
  const pathnameLocale = locales.find(
    (loc) => pathname.startsWith(`/${loc}/`) || pathname === `/${loc}`
  );
  
  if (pathnameLocale) {
    locale = pathnameLocale;
  } else {
    // Check if intl middleware added locale via redirect
    const location = intlResponse.headers.get('location');
    if (location) {
      const localeFromRedirect = locales.find((loc) => location.includes(`/${loc}/`) || location.endsWith(`/${loc}`));
      if (localeFromRedirect) {
        locale = localeFromRedirect;
      }
    }
  }
  
  // IMPORTANT: Always use locale prefix for internal redirects
  // Even for default locale, because our route structure is /[locale]/...
  const localePrefix = `/${locale}`;
  const localizedLoginPath = `${localePrefix}${ROUTES.LOGIN}`;
  const localizedDashboardPath = `${localePrefix}${ROUTES.DASHBOARD}`;
  
  // Step 2: Handle auth
  const token = request.cookies.get(AUTH_TOKEN_KEY)?.value;
  const isAuthenticated = !!token;

  console.log('[PROXY] Request:', { pathname, locale, isAuthenticated });

  // Public routes
  const publicRoutes = [ROUTES.LOGIN];
  const isPublicRoute = publicRoutes.some((route) => {
    const localizedRoute = `${localePrefix}${route}`;
    return pathname.startsWith(localizedRoute);
  });

  // Handle root path "/" or "/vi" or "/en"
  if (pathname === '/' || locales.some(loc => pathname === `/${loc}`)) {
    console.log('[PROXY] Root path detected, redirecting...');
    if (isAuthenticated) {
      return NextResponse.redirect(new URL(localizedDashboardPath, request.url));
    } else {
      return NextResponse.redirect(new URL(localizedLoginPath, request.url));
    }
  }

  // Redirect authenticated users away from login
  if (isAuthenticated && pathname.startsWith(localizedLoginPath)) {
    const callbackUrl = request.nextUrl.searchParams.get('callbackUrl');
    const redirectUrl = callbackUrl || localizedDashboardPath;
    console.log('[PROXY] Redirecting from login to:', redirectUrl);
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  // Redirect unauthenticated users to login
  if (!isAuthenticated && !isPublicRoute && pathname.startsWith(`${localePrefix}/admin`)) {
    const loginUrl = new URL(localizedLoginPath, request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    console.log('[PROXY] Not authenticated, redirecting to login with callback:', pathname);
    return NextResponse.redirect(loginUrl);
  }

  console.log('[PROXY] Allowing request to proceed');
  
  // Return i18n response if it's a redirect, otherwise continue
  if (intlResponse.status === 307 || intlResponse.status === 308) {
    return intlResponse;
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
