import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Montserrat } from "next/font/google";
import { getDictionary } from '@/i18n/dictionaries';
import { ThemeProvider } from "@/components/theme-provider";
import { Analytics as GoogleAnalytics } from "@/components/analytics";
import { generatePageMetadata } from "@/lib/metadata";
import { headers } from "next/headers";
import { i18n, type Locale } from "@/i18n/config";
import "./globals.css";

const LANG = i18n.defaultLocale;

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-montserrat",
  display: "swap",
  fallback: ["system-ui", "arial"],
  preload: true,
  adjustFontFallback: true,
});

export const viewport: Viewport = {
  themeColor: "#050a12",
};

export async function generateMetadata(): Promise<Metadata> {
  // O idioma vem do middleware, que é quem enxerga o prefixo da rota.
  const headerLocale = (await headers()).get('x-locale');
  const lang: Locale = i18n.locales.includes(headerLocale as Locale)
    ? (headerLocale as Locale)
    : LANG;
  const dict = await getDictionary(lang);

  const keywords = ['cibersegurança', 'CISO', 'segurança da informação', 'privacidade', 'LGPD', 'forense digital', 'Ricardo Esper'];

  return {
    ...generatePageMetadata({
      title: dict.site.name,
      description: dict.site.description,
      path: '',
      lang: LANG,
      keywords,
    }),
    metadataBase: new URL("https://esper.ws"),
    title: {
      default: dict.site.name,
      template: `%s - ${dict.site.name}`,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // O idioma vem do middleware, que é quem enxerga o prefixo da rota.
  const headerLocale = (await headers()).get('x-locale');
  const lang: Locale = i18n.locales.includes(headerLocale as Locale)
    ? (headerLocale as Locale)
    : LANG;
  const dict = await getDictionary(lang);


  return (
    <html
      lang={lang}
      className={`${montserrat.variable} ${GeistSans.variable} ${GeistMono.variable} antialiased dark`}
      suppressHydrationWarning
    >
      <head>

        <script
          dangerouslySetInnerHTML={{
            __html: `window.onTurnstileLoad = function() { window.dispatchEvent(new Event('turnstile-loaded')); };`,
          }}
        />
      </head>
      <body>
        {/* Skip to main content link for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          {dict.nav.skipToContent}
        </a>

        <GoogleAnalytics />

        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          forcedTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
