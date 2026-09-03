import { readObject } from '@/lib/cloudflare/media';

/**
 * Serve a imagem do R2.
 *
 * Os cabeçalhos aqui não são enfeite. Mesmo com a validação por assinatura
 * no upload, esta rota trata o objeto como conteúdo não confiável:
 *
 * - `Content-Type` sai de uma lista fixa, nunca do metadado gravado. Se algo
 *   entrasse no bucket por outro caminho — o painel da Cloudflare, por
 *   exemplo — declarando `text/html`, aqui ele continua sendo servido como
 *   imagem, ou não é servido.
 * - `X-Content-Type-Options: nosniff` impede o navegador de "adivinhar" um
 *   tipo mais interessante que o declarado.
 * - `Content-Security-Policy: sandbox` neutraliza o arquivo caso alguém
 *   consiga abri-lo como documento.
 * - `Content-Disposition: inline` com nome fixo evita que o nome do arquivo
 *   influencie o tratamento.
 *
 * É cinto e suspensório de propósito: o custo é uma linha, e a falha que
 * eles evitam é XSS na mesma origem da sessão de admin.
 */

const SERVABLE = new Set(['image/jpeg', 'image/png', 'image/webp']);

export async function GET(_request: Request, ctx: { params: Promise<{ key: string[] }> }) {
  const { key } = await ctx.params;
  const objectKey = key.join('/');

  // A chave vem da URL; `..` nunca deveria chegar aqui porque nós a geramos,
  // mas recusar é mais barato que confiar.
  if (objectKey.includes('..')) {
    return new Response('Not found', { status: 404 });
  }

  const object = await readObject(objectKey);
  if (!object) return new Response('Not found', { status: 404 });

  const declared = object.httpMetadata?.contentType ?? '';
  const contentType = SERVABLE.has(declared) ? declared : null;
  if (!contentType) return new Response('Not found', { status: 404 });

  return new Response(object.body as ReadableStream, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'none'; sandbox",
      'Content-Disposition': 'inline',
      ...(object.httpEtag ? { ETag: object.httpEtag } : {}),
    },
  });
}
