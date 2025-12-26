import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { i18n } from './i18n/config';
import { createClient } from '@supabase/supabase-js';

// Verify Supabase session from cookies
async function checkSupabaseAuth(request: NextRequest): Promise<boolean> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || 
                        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return false;
    }

    // Get access token from cookie
    const accessToken = request.cookies.get('sb-access-token')?.value;
    
    if (!accessToken) {
      return false;
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
      },
    });

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    return !error && !!user;
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
    const isAuthenticated = await checkSupabaseAuth(request);
    if (!isAuthenticated) {
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Check authentication for generation APIs
  if (pathname.startsWith('/api/generate') || pathname.startsWith('/api/auto-generate')) {
    const isAuthenticated = await checkSupabaseAuth(request);
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Não autorizado. Faça login em /admin/login' },
        { status: 401 }
      );
    }
  }

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
