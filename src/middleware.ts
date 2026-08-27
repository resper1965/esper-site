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

  // Admin is not localized.
  if (pathname.startsWith('/admin/') || pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Locale-prefixed URLs are the canonical ones: they carry the hreflang pair
  // and are what `generatePageMetadata` emits as canonical. Serve them as-is.
  const pathnameHasLocale = i18n.locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    // O layout raiz é o único que emite <html>, e ele não recebe o param
    // [lang]. Sem isto, /en sairia declarado como português — e um lang
    // errado contradiz o hreflang que a própria página anuncia.
    const locale = i18n.locales.find(
      (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`)
    )!;
    const headers = new Headers(request.headers);
    headers.set('x-locale', locale);
    return NextResponse.next({ request: { headers } });
  }

  // Everything else is an un-prefixed path: send it to the default locale.
  // 307 rather than 301 — the default locale is a routing choice we may want
  // to revisit (e.g. negotiating from Accept-Language), and a cached 301 would
  // outlive that decision in every visitor's browser.
  request.nextUrl.pathname = `/${i18n.defaultLocale}${pathname === '/' ? '' : pathname}`;
  return NextResponse.redirect(request.nextUrl, 307);
}

export const config = {
  matcher: [
    // Crawler-facing files must never be redirected: a 307 on /robots.txt or
    // /sitemap.xml is indistinguishable from not having one.
    '/((?!api|_next/static|_next/image|favicon.ico|images|robots\\.txt|sitemap\\.xml|llms\\.txt|rss\\.xml|opengraph-image|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)).*)',
  ],
};
