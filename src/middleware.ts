import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { i18n } from './i18n/config';
import { verifySession } from './lib/cloudflare/auth';

// Verify auth session from cookie using Cloudflare JWT
async function checkAuth(request: NextRequest): Promise<boolean> {
  try {
    const accessToken = request.cookies.get('sb-access-token')?.value;
    if (!accessToken) return false;

    const user = await verifySession(accessToken);
    return !!user;
  } catch {
    return false;
  }
}

function getLocale(request: NextRequest): string {
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
  if (cookieLocale && i18n.locales.includes(cookieLocale as typeof i18n.locales[number])) {
    return cookieLocale;
  }

  const acceptLanguage = request.headers.get('accept-language');
  if (acceptLanguage) {
    const languages = acceptLanguage
      .split(',')
      .map((lang) => {
        const [locale, q] = lang.trim().split(';q=');
        return {
          locale: locale.trim(),
          quality: q ? parseFloat(q) : 1.0,
        };
      })
      .sort((a, b) => b.quality - a.quality);

    for (const { locale } of languages) {
      if (i18n.locales.includes(locale as typeof i18n.locales[number])) {
        return locale;
      }
    }

    for (const { locale } of languages) {
      const lang = locale.split('-')[0];
      if (lang === 'pt') return 'pt-BR';
      if (lang === 'en') return 'en';
    }
  }

  return i18n.defaultLocale;
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

  // Check if the pathname already has a locale
  const pathnameHasLocale = i18n.locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) return;

  // Detect locale and redirect
  const locale = getLocale(request);

  if (pathname === '/') {
    request.nextUrl.pathname = `/${locale}`;
  } else {
    request.nextUrl.pathname = `/${locale}${pathname}`;
  }

  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|images|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)).*)',
  ],
};
