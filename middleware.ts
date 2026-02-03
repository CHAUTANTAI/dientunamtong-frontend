/**
 * Next.js Middleware
 * Handles route protection and redirects
 */

import { NextRequest, NextResponse } from 'next/server';
import { ROUTES } from './src/constants/routes';

const AUTH_TOKEN_KEY = 'auth_token';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const token = request.cookies.get(AUTH_TOKEN_KEY)?.value;

  // Public routes that don't require authentication
  const publicRoutes = [ROUTES.LOGIN];

  // Check if route requires authentication
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  // Redirect to login if accessing protected route without token
  if (!isPublicRoute && !token) {
    const loginUrl = new URL(ROUTES.LOGIN, request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect to dashboard if accessing login with token
  if (isPublicRoute && token && pathname.startsWith(ROUTES.LOGIN)) {
    const dashboardUrl = new URL(ROUTES.DASHBOARD, request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
