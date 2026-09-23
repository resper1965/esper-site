import Link from 'next/link';
import { getDictionary } from '@/i18n/dictionaries';
import { SearchButton } from '@/components/search-button';
import { generatePageMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';

interface NotFoundProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: NotFoundProps): Promise<Metadata> {
  let lang: 'pt-BR' | 'en' = 'pt-BR';
  try {
    const resolvedParams = await params;
    const langParam = resolvedParams?.lang;
    if (langParam === 'pt-BR' || langParam === 'en') lang = langParam;
  } catch { lang = 'pt-BR'; }
  const dict = await getDictionary(lang);

  return generatePageMetadata({
    title: dict.notFound?.title || 'Página não encontrada',
    description: dict.notFound?.description || 'A página que você está procurando não foi encontrada.',
    path: '/404',
    lang,
    noindex: true,
  });
}

/**
 * 404.
 *
 * A causa mais comum de cair aqui é um endereço antigo do blog: as URLs
 * foram reorganizadas por idioma, e um link de fora aponta para a forma
 * anterior. Por isso a primeira ação oferecida é buscar pelo título, não
 * voltar ao início — quem chegou aqui queria um texto específico.
 */
export default async function NotFound({ params }: NotFoundProps) {
  let lang: 'pt-BR' | 'en' = 'pt-BR';
  try {
    const resolvedParams = await params;
    const langParam = resolvedParams?.lang;
    if (langParam === 'pt-BR' || langParam === 'en') lang = langParam;
  } catch { lang = 'pt-BR'; }
  const isPT = lang === 'pt-BR';
  const L = (a: string, b: string) => (isPT ? a : b);

  return (
    <section className="flex flex-col gap-5" style={{ maxWidth: 680 }}>
      <span
        style={{ fontSize: 88, fontWeight: 500, lineHeight: 1, color: 'var(--color-accent)' }}
        aria-hidden
      >
        404
      </span>
      <h1 style={{ fontSize: 36 }}>
        {L('Esta página não existe — ou mudou de endereço.', 'This page doesn’t exist — or it has moved.')}
      </h1>
      <p style={{ fontSize: 16, lineHeight: 1.6, color: 'var(--color-neutral-400)' }}>
        {L(
          'Os endereços antigos do blog foram reorganizados por idioma. Busque pelo título ou volte ao início.',
          'Old blog addresses were reorganised by language. Search by title or go back home.'
        )}
      </p>
      <div className="flex flex-wrap gap-3">
        <SearchButton label={L('Buscar no site', 'Search the site')} />
        <Link href={`/${lang}`} className="btn btn-secondary">
          {L('Voltar ao início', 'Back to home')}
        </Link>
        <Link href={`/${lang}/blog`} className="btn btn-ghost">
          Blog
        </Link>
      </div>
    </section>
  );
}
