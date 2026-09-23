import Link from 'next/link';
import { getDictionary } from '@/i18n/dictionaries';
import { generatePageMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';

const lang = 'pt-BR' as const;

export async function generateMetadata(): Promise<Metadata> {
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
 * O 404 da raiz — o que responde antes de o idioma ser resolvido.
 *
 * Mesmo texto do 404 com idioma, sem o botão de busca: a paleta ⌘K é
 * montada pelo layout de `[lang]`, e aqui ela não existe. Um botão que não
 * abre nada é pior que um botão a menos.
 */
export default function NotFound() {
  return (
    <main className="flex flex-col gap-5" style={{ maxWidth: 680, padding: '64px 24px' }}>
      <span
        style={{ fontSize: 88, fontWeight: 500, lineHeight: 1, color: 'var(--color-accent)' }}
        aria-hidden
      >
        404
      </span>
      <h1 style={{ fontSize: 36 }}>Esta página não existe — ou mudou de endereço.</h1>
      <p style={{ fontSize: 16, lineHeight: 1.6, color: 'var(--color-neutral-400)' }}>
        Os endereços antigos do blog foram reorganizados por idioma. Volte ao início e busque pelo
        título.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link href={`/${lang}`} className="btn btn-primary">
          Voltar ao início
        </Link>
        <Link href={`/${lang}/blog`} className="btn btn-secondary">
          Blog
        </Link>
      </div>
    </main>
  );
}
