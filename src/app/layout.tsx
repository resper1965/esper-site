import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Montserrat } from "next/font/google";
import { getDictionary } from '@/i18n/dictionaries';
import { ThemeProvider } from "@/components/theme-provider";
import { SiteNav } from "@/components/site-nav";
import Footer from "@/components/footer";
import { Analytics as GoogleAnalytics } from "@/components/analytics";
import { generatePageMetadata, generatePersonSchema, generateWebSiteSchema, generateOrganizationSchema, generateProfilePageSchema } from "@/lib/metadata";
import { ChatWidget } from "@/components/chat-widget";
import "./globals.css";

const LANG = 'pt-BR' as const;

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
  const dict = await getDictionary(LANG);

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
  const dict = await getDictionary(LANG);

  // Generate structured data for the site
  const personSchema = generatePersonSchema(LANG);
  const websiteSchema = generateWebSiteSchema(LANG);
  const organizationSchema = generateOrganizationSchema(LANG);
  const profilePageSchema = generateProfilePageSchema(LANG);

  return (
    <html
      lang={LANG}
      className={`${montserrat.variable} ${GeistSans.variable} ${GeistMono.variable} antialiased dark`}
      suppressHydrationWarning
    >
      <head>
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(profilePageSchema) }}
        />
        {/* Cloudflare Turnstile CAPTCHA */}
        <script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad"
          async
          defer
        />
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
          <SiteNav lang={LANG} dict={dict} />
          <main id="main-content">
            {children}
          </main>
          <Footer lang={LANG} />
          <ChatWidget lang={LANG} />
        </ThemeProvider>
      </body>
    </html>
  );
}
