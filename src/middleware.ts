import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { i18n } from './i18n/config';
import { verifySession } from './lib/cloudflare/auth';

// Verify auth session from cookie using Cloudflare JWT
async function checkAuth(request: NextRequest): Promise<boolean> {
  try {
    const accessToken = request.cookies.get('session-token')?.value;
    if (!accessToken) return false;

    const user = await verifySession(accessToken);
    return !!user;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Remove locale from admin routes - rewrite instead of redirect to avoid 404
  for (const locale of i18n.locales) {
    if (pathname.startsWith(`/${locale}/admin/`)) {
      const adminPath = pathname.replace(`/${locale}`, '');
      request.nextUrl.pathname = adminPath;
      return NextResponse.rewrite(request.nextUrl);
    }
  }

  // Check authentication for admin routes (except login)
  if (pathname.startsWith('/admin/') && pathname !== '/admin/login') {
    const isAuthenticated = await checkAuth(request);
    if (!isAuthenticated) {
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // NOTE: API routes are excluded from middleware by the matcher config below.
  // All API auth is handled in-route via requireAuth() — see src/lib/requireAuth.ts.

  // Exclude admin and API routes from locale redirect
  if (pathname.startsWith('/admin/') || pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Redirect old /pt-BR/... and /en/... routes to root equivalents for backward compat
  const pathnameHasLocale = i18n.locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    // Strip locale prefix and redirect to root path
    let rootPath = pathname;
    for (const locale of i18n.locales) {
      if (pathname.startsWith(`/${locale}/`)) {
        rootPath = pathname.replace(`/${locale}`, '');
        break;
      }
      if (pathname === `/${locale}`) {
        rootPath = '/';
        break;
      }
    }
    request.nextUrl.pathname = rootPath;
    return NextResponse.redirect(request.nextUrl, 301);
  }

  // All other routes pass through to root pages (no locale prefix needed)
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|images|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)).*)',
  ],
};
