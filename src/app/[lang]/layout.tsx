import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Montserrat } from "next/font/google";
import { i18n, type Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { ThemeProvider } from "@/components/theme-provider";
import { SiteNav } from "@/components/site-nav";
import Footer from "@/components/footer";
import { Analytics } from "@/components/analytics";
import { generatePageMetadata, generatePersonSchema, generateWebSiteSchema, generateOrganizationSchema } from "@/lib/metadata";
import "../globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-montserrat",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "black",
};

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  const keywords = lang === 'pt-BR'
    ? ['cibersegurança', 'CISO', 'segurança da informação', 'privacidade', 'LGPD', 'forense digital', 'Ricardo Esper']
    : ['cybersecurity', 'CISO', 'information security', 'privacy', 'GDPR', 'digital forensics', 'Ricardo Esper'];

  return {
    ...generatePageMetadata({
      title: dict.site.name,
      description: dict.site.description,
      path: '',
      lang,
      keywords,
    }),
    title: {
      default: dict.site.name,
      template: `%s - ${dict.site.name}`,
    },
  };
}

export default async function LangLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: Locale }>;
}>) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  // Generate structured data for the site
  const personSchema = generatePersonSchema(lang);
  const websiteSchema = generateWebSiteSchema(lang);
  const organizationSchema = generateOrganizationSchema(lang);

  return (
    <html
      lang={lang}
      className={`${montserrat.variable} ${GeistSans.variable} ${GeistMono.variable} antialiased`}
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
      </head>
      <body>
        {/* Skip to main content link for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          {dict.nav.skipToContent}
        </a>

        <Analytics />

        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SiteNav lang={lang} dict={dict} />
          <main id="main-content">
            {children}
          </main>
          <Footer lang={lang} />
        </ThemeProvider>
      </body>
    </html>
  );
}
