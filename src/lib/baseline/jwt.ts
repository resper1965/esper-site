/**
 * Monta e assina o JWT que a conta de serviço troca por um access token.
 *
 * Fluxo do Google: assina um JWT com a chave privada da conta, envia como
 * `assertion` para o endpoint de token, recebe um access token de uma hora.
 * Sem navegador, sem tela de consentimento, sem refresh token que vence — que
 * é exatamente o que um job mensal não supervisionado precisa.
 *
 * Usa apenas `node:crypto`. Nenhuma dependência nova.
 */

import { createSign } from 'node:crypto';

const base64url = (b: Buffer | string): string =>
  Buffer.from(b).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

export interface EntradaJwt {
  email: string;
  escopo: string;
  audiencia: string;
  agoraSegundos: number;
  duracaoSegundos?: number;
}

/** A parte assinável: cabeçalho e payload, já codificados e unidos por ponto. */
export function corpoAssinavel(e: EntradaJwt): string {
  if (!e.email) throw new Error('email da conta de serviço ausente');
  if (!e.escopo) throw new Error('escopo ausente');

  const cabecalho = { alg: 'RS256', typ: 'JWT' };
  const duracao = e.duracaoSegundos ?? 3600;
  const payload = {
    iss: e.email,
    scope: e.escopo,
    aud: e.audiencia,
    iat: e.agoraSegundos,
    exp: e.agoraSegundos + duracao,
  };
  return `${base64url(JSON.stringify(cabecalho))}.${base64url(JSON.stringify(payload))}`;
}

export function assinarJwt(e: EntradaJwt, chavePrivada: string): string {
  const corpo = corpoAssinavel(e);
  const assinatura = createSign('RSA-SHA256').update(corpo).end().sign(chavePrivada);
  return `${corpo}.${base64url(assinatura)}`;
}

/**
 * A chave privada de um JSON de conta de serviço tem quebras de linha reais.
 * Guardada num arquivo .env, ela vira `\n` literal — e assinar com isso falha
 * com erro de formato, não de permissão, o que manda o leitor investigar o
 * lado errado. Esta função desfaz a escapagem e valida o envelope PEM.
 */
export function normalizarChavePrivada(bruta: string): string {
  const chave = bruta.replace(/\\n/g, '\n').trim();
  if (!chave.startsWith('-----BEGIN')) {
    throw new Error('chave privada não parece PEM — confira se o valor foi copiado inteiro');
  }
  return chave;
}
