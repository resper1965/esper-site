import type { Metadata, Viewport } from "next";
import { i18n, type Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { SiteNav } from "@/components/site-nav";
import Footer from "@/components/footer";

import { generatePageMetadata, generatePersonSchema, generateWebSiteSchema, generateOrganizationSchema, generateProfilePageSchema } from "@/lib/metadata";
import "../globals.css";

export const viewport: Viewport = {
  themeColor: "#0B0F14",
};

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  let lang: Locale = 'pt-BR';
  try {
    const resolvedParams = await params;
    if (resolvedParams && resolvedParams.lang && (resolvedParams.lang === 'pt-BR' || resolvedParams.lang === 'en')) {
      lang = resolvedParams.lang;
    }
  } catch (error) {
    console.error('Error in layout generateMetadata params:', error);
    lang = 'pt-BR';
  }
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
  params: Promise<{ lang: string }>;
}>) {
  let lang: Locale = 'pt-BR';
  try {
    const resolvedParams = await params;
    if (resolvedParams && resolvedParams.lang && (resolvedParams.lang === 'pt-BR' || resolvedParams.lang === 'en')) {
      lang = resolvedParams.lang;
    }
  } catch (error) {
    console.error('Error in layout params:', error);
    lang = 'pt-BR';
  }
  const dict = await getDictionary(lang);

  // Generate structured data for the site
  const personSchema = generatePersonSchema(lang);
  const websiteSchema = generateWebSiteSchema(lang);
  const organizationSchema = generateOrganizationSchema(lang);
  const profilePageSchema = generateProfilePageSchema(lang);

  return (
    <>
      {/* Grafo de identidade: emitido aqui, e só aqui, porque depende do
          idioma da rota. O layout raiz não o emite — quando os dois
          emitiam, cada página saía com o Person repetido, que é
          exatamente o que confunde a resolução de entidade. */}
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

      <SiteNav lang={lang} dict={dict} />
      <main id="main-content">
        {children}
      </main>
      <Footer lang={lang} />
    </>
  );
}
