import { getDictionary } from '@/i18n/dictionaries';
import { Locale, i18n } from '@/i18n/config';
import { generatePageMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  let lang: Locale = 'pt-BR';
  try {
    const resolvedParams = await params;
    if (resolvedParams && resolvedParams.lang && (resolvedParams.lang === 'pt-BR' || resolvedParams.lang === 'en')) {
      lang = resolvedParams.lang;
    }
  } catch (error) {
    console.error('Error in generateMetadata params:', error);
    lang = 'pt-BR';
  }
  const dict = await getDictionary(lang);

  const keywords = lang === 'pt-BR'
    ? ['Ricardo Esper', 'CISO', 'cibersegurança', 'forense digital', 'NESS', 'IONIC Health', 'consultor internacional', 'LGPD', 'privacidade']
    : ['Ricardo Esper', 'CISO', 'cybersecurity', 'digital forensics', 'NESS', 'IONIC Health', 'international consultant', 'GDPR', 'privacy'];

  return generatePageMetadata({
    title: dict.about.title,
    description: lang === 'pt-BR'
      ? 'Conheça Ricardo Esper: CISO, forense digital e consultor internacional. Mais de 34 anos de experiência em cibersegurança, privacidade e compliance (LGPD, GDPR, HIPAA, SOC 2).'
      : 'Meet Ricardo Esper: CISO, digital forensics expert and international consultant. Over 34 years of experience in cybersecurity, privacy and compliance (LGPD, GDPR, HIPAA, SOC 2).',
    path: '/sobre',
    lang,
    keywords,
  });
}

export const dynamic = 'force-dynamic';

export default async function Sobre({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  let lang: Locale = 'pt-BR';
  try {
    const resolvedParams = await params;
    if (resolvedParams && resolvedParams.lang && (resolvedParams.lang === 'pt-BR' || resolvedParams.lang === 'en')) {
      lang = resolvedParams.lang;
    }
  } catch (error) {
    console.error('Error in Sobre params:', error);
    lang = 'pt-BR';
  }
  const dict = await getDictionary(lang);

  return (
    <div className="bg-white dark:bg-background">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="prose prose-lg max-w-none dark:prose-invert">
            <h1 className="text-4xl font-bold text-grey-900 dark:text-grey-50 sm:text-5xl">
              {dict.about.title}
            </h1>

            <div className="mt-8 space-y-6 text-lg leading-relaxed text-grey-700 dark:text-grey-300">
              <p>{dict.about.intro1}</p>
              <p>{dict.about.intro2}</p>
              <p>{dict.about.intro3}</p>

              <div>
                <h2 className="mt-12 text-2xl font-semibold text-grey-900 dark:text-grey-50">
                  {dict.about.globalPresence}
                </h2>
                <ul className="mt-4 space-y-3 text-grey-700 dark:text-grey-300">
                  <li>
                    <span className="font-medium text-grey-900 dark:text-grey-50">CEO & Founder</span> — NESS
                    <span className="text-grey-500 dark:text-grey-400 text-sm ml-2">(São Paulo, {lang === 'pt-BR' ? 'desde' : 'since'} 1991)</span>
                  </li>
                  <li>
                    <span className="font-medium text-grey-900 dark:text-grey-50">CISO & Co-Founder</span> — IONIC Health
                    <span className="text-grey-500 dark:text-grey-400 text-sm ml-2">(Healthcare Security)</span>
                  </li>
                  <li>
                    <span className="font-medium text-grey-900 dark:text-grey-50">CEO</span> — forense.io, Trustness, Infinity Safe
                    <span className="text-grey-500 dark:text-grey-400 text-sm ml-2">(Digital Forensics & Executive Protection)</span>
                  </li>
                  <li>
                    <span className="font-medium text-grey-900 dark:text-grey-50">Board Member</span> — Bekaa Trusted Advisors
                  </li>
                  <li>
                    <span className="font-medium text-grey-900 dark:text-grey-50">Partner</span> — NESS Law
                    <span className="text-grey-500 dark:text-grey-400 text-sm ml-2">(Cybersecurity & Privacy Legal)</span>
                  </li>
                </ul>
              </div>

              <div>
                <h2 className="mt-12 text-2xl font-semibold text-grey-900 dark:text-grey-50">
                  {dict.about.internationalCommunity}
                </h2>
                <p className="mt-4 text-grey-700 dark:text-grey-300">
                  {dict.about.internationalCommunityText}
                </p>
              </div>

              <div>
                <h2 className="mt-12 text-2xl font-semibold text-grey-900 dark:text-grey-50">
                  {dict.about.certifications}
                </h2>
                <div className="mt-4 space-y-3">
                  <p className="text-grey-700 dark:text-grey-300">
                    <span className="font-medium text-grey-900 dark:text-grey-50">{dict.about.certificationsText.split(':')[0]}:</span> {dict.about.certificationsText.split(':')[1]}
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <span className="inline-flex items-center rounded-full bg-grey-200 dark:bg-grey-800 px-4 py-2 text-sm font-medium text-grey-800 dark:text-grey-200">
                      Information Security Architecture
                    </span>
                    <span className="inline-flex items-center rounded-full bg-grey-200 dark:bg-grey-800 px-4 py-2 text-sm font-medium text-grey-800 dark:text-grey-200">
                      Digital Forensics & Incident Response
                    </span>
                    <span className="inline-flex items-center rounded-full bg-grey-200 dark:bg-grey-800 px-4 py-2 text-sm font-medium text-grey-800 dark:text-grey-200">
                      International Privacy & Compliance
                    </span>
                    <span className="inline-flex items-center rounded-full bg-grey-200 dark:bg-grey-800 px-4 py-2 text-sm font-medium text-grey-800 dark:text-grey-200">
                      CISO Leadership & Governance
                    </span>
                    <span className="inline-flex items-center rounded-full bg-grey-200 dark:bg-grey-800 px-4 py-2 text-sm font-medium text-grey-800 dark:text-grey-200">
                      Cyber Intelligence & OSINT
                    </span>
                    <span className="inline-flex items-center rounded-full bg-grey-200 dark:bg-grey-800 px-4 py-2 text-sm font-medium text-grey-800 dark:text-grey-200">
                      Executive Protection (TSCM)
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-12 pt-8 border-t border-grey-200 dark:border-grey-800">
                <h2 className="text-2xl font-semibold text-grey-900 dark:text-grey-50">
                  {dict.about.contact}
                </h2>
                <p className="mt-4 text-grey-700 dark:text-grey-300">
                  {dict.about.contactText}{' '}
                  <a
                    href="https://www.linkedin.com/in/ricardoesper"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-grey-900 dark:text-grey-50 underline transition-colors hover:text-grey-700 dark:hover:text-grey-300"
                  >
                    {dict.about.linkedin}
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
