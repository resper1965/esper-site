import { MetadataRoute } from 'next';
import { headers } from 'next/headers';
import { siteConfig } from '@/lib/site';

const CANONICAL_HOST = new URL(siteConfig.url).host;

/** Paths that are never worth crawling, canonical host or not. */
const DISALLOW = ['/admin/', '/api/', '/drafts/'];

/**
 * O host precisa ser lido da requisição, o que torna a rota dinâmica.
 * É barato: robots.txt é minúsculo e raramente buscado.
 */
export const dynamic = 'force-dynamic';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const host = (await headers()).get('host');

  // O mesmo Worker responde em vários hosts: workers.dev, uma URL de preview
  // por versão, uma por branch. Todos servem o site inteiro.
  //
  // O canonical aponta para o domínio certo, mas canonical é dica, não
  // diretiva — o buscador pode indexar o espelho assim mesmo. Num site cuja
  // meta inteira é concentrar autoridade num único domínio, cada espelho
  // indexado trabalha contra ela.
  //
  // Fechar aqui vale mais do que desligar preview_urls no wrangler.toml,
  // porque não depende de a plataforma respeitar aquela flag: seja qual for
  // o host de onde a resposta saiu, ela se recusa a ser rastreada.
  if (host && host !== CANONICAL_HOST) {
    return { rules: [{ userAgent: '*', disallow: '/' }] };
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: DISALLOW,
      },
      // Answer engines are a distribution channel here, not a threat: being
      // cited by them is the point. Listed explicitly so the intent is not
      // mistaken for an oversight.
      {
        userAgent: ['GPTBot', 'OAI-SearchBot', 'ClaudeBot', 'Claude-SearchBot', 'PerplexityBot', 'Google-Extended'],
        allow: '/',
        disallow: DISALLOW,
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
