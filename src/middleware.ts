import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { i18n } from './i18n/config';

// Verificar autenticação simples - apenas verifica cookie
function checkAdminAuth(request: NextRequest): boolean {
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies: { [key: string]: string } = {};
  cookieHeader.split(';').forEach(cookie => {
    const [key, value] = cookie.trim().split('=');
    if (key && value) cookies[key] = decodeURIComponent(value);
  });

  return cookies['admin_logged_in'] === 'true';
}

function getLocale(request: NextRequest): string {
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (cookieLocale && i18n.locales.includes(cookieLocale as any)) {
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (i18n.locales.includes(locale as any)) {
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

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Remover locale de rotas admin
  for (const locale of i18n.locales) {
    if (pathname.startsWith(`/${locale}/admin/`)) {
      const adminPath = pathname.replace(`/${locale}`, '');
      request.nextUrl.pathname = adminPath;
      return NextResponse.redirect(request.nextUrl);
    }
  }

  // Verificar autenticação para rotas admin (exceto login)
  if (pathname.startsWith('/admin/') && pathname !== '/admin/login') {
    if (!checkAdminAuth(request)) {
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Verificar autenticação para APIs de geração
  if (pathname.startsWith('/api/generate') || pathname.startsWith('/api/auto-generate')) {
    if (!checkAdminAuth(request)) {
      return NextResponse.json(
        { error: 'Não autorizado. Faça login em /admin/login' },
        { status: 401 }
      );
    }
  }

  // Excluir rotas admin e API do redirecionamento de locale
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
