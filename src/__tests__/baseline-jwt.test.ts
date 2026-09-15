import { describe, it, expect } from 'vitest';
import { createVerify, generateKeyPairSync } from 'node:crypto';
import { corpoAssinavel, assinarJwt, normalizarChavePrivada } from '@/lib/baseline/jwt';

const AUDIENCIA = 'https://oauth2.googleapis.com/token';
const ESCOPO = 'https://www.googleapis.com/auth/webmasters.readonly';

const entrada = (extra: Record<string, unknown> = {}) => ({
  email: 'baseline-orm@projeto.iam.gserviceaccount.com',
  escopo: ESCOPO,
  audiencia: AUDIENCIA,
  agoraSegundos: 1_757_900_000,
  ...extra,
});

/** Decodifica um segmento base64url de volta para objeto. */
const decodificar = (seg: string): Record<string, unknown> =>
  JSON.parse(Buffer.from(seg, 'base64url').toString('utf8'));

describe('corpoAssinavel', () => {
  it('produz dois segmentos base64url unidos por ponto', () => {
    const corpo = corpoAssinavel(entrada());
    expect(corpo.split('.')).toHaveLength(2);
    expect(corpo).toMatch(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/);
  });

  it('o cabeçalho declara RS256', () => {
    const [cabecalho] = corpoAssinavel(entrada()).split('.');
    expect(decodificar(cabecalho)).toEqual({ alg: 'RS256', typ: 'JWT' });
  });

  it('o payload carrega iss, scope, aud, iat e exp', () => {
    const [, payload] = corpoAssinavel(entrada()).split('.');
    expect(decodificar(payload)).toEqual({
      iss: 'baseline-orm@projeto.iam.gserviceaccount.com',
      scope: ESCOPO,
      aud: AUDIENCIA,
      iat: 1_757_900_000,
      exp: 1_757_903_600,
    });
  });

  it('exp fica uma hora depois de iat por padrão', () => {
    const [, payload] = corpoAssinavel(entrada()).split('.');
    const p = decodificar(payload) as { iat: number; exp: number };
    expect(p.exp - p.iat).toBe(3600);
  });

  it('honra duracaoSegundos quando informado', () => {
    const [, payload] = corpoAssinavel(entrada({ duracaoSegundos: 600 })).split('.');
    const p = decodificar(payload) as { iat: number; exp: number };
    expect(p.exp - p.iat).toBe(600);
  });

  // O alfabeto base64 padrão usa `+`, `/` e `=`, e os três são reservados em
  // URL e em corpo form-encoded. Um deles sobrevivendo aqui vira um `assertion`
  // que o Google rejeita com 400 — erro que parece de chave, não de encoding.
  it('não deixa escapar +, / ou = em nenhum comprimento', () => {
    for (const email of ['a@b.iam.gserviceaccount.com', 'ab@b.com', 'abc@b.com']) {
      for (const escopo of [ESCOPO, 'leitura de posição média e impressões ~~~ ???']) {
        const corpo = corpoAssinavel(entrada({ email, escopo }));
        expect(corpo, `escapou caractere reservado em ${email}`).not.toMatch(/[+/=]/);
        const [cabecalho, payload] = corpo.split('.');
        expect(decodificar(cabecalho)).toHaveProperty('alg', 'RS256');
        expect(decodificar(payload)).toHaveProperty('scope', escopo);
      }
    }
  });

  it('recusa email ausente', () => {
    expect(() => corpoAssinavel(entrada({ email: '' }))).toThrow(/email/);
  });

  it('recusa escopo ausente', () => {
    expect(() => corpoAssinavel(entrada({ escopo: '' }))).toThrow(/escopo/);
  });
});

// Prazo generoso para os casos que dependem de RSA. Gerar par de 2048 bits é
// caro, e a suíte inteira roda com ambiente jsdom em 33 arquivos — sob carga,
// o padrão de 5s estoura e o teste falha por lentidão, não por defeito. Teste
// que passa quando alguém olha e falha quando ninguém olha é pior que teste
// ausente: ensina a ignorar vermelho.
const PRAZO_RSA = 30_000;

describe('assinarJwt', () => {
  // Par de chaves descartável, gerado na hora: nenhum material de chave entra
  // no repositório, nem de teste.
  const { privateKey, publicKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    publicKeyEncoding: { type: 'spki', format: 'pem' },
  });

  it('assina o corpo e a assinatura confere com a chave pública', () => {
    const jwt = assinarJwt(entrada(), privateKey);
    const partes = jwt.split('.');
    expect(partes).toHaveLength(3);
    expect(`${partes[0]}.${partes[1]}`).toBe(corpoAssinavel(entrada()));

    const ok = createVerify('RSA-SHA256')
      .update(`${partes[0]}.${partes[1]}`)
      .end()
      .verify(publicKey, Buffer.from(partes[2], 'base64url'));
    expect(ok).toBe(true);
  }, PRAZO_RSA);

  it('a assinatura não confere se o corpo for adulterado', () => {
    const jwt = assinarJwt(entrada(), privateKey);
    const [, , assinatura] = jwt.split('.');
    const outro = corpoAssinavel(entrada({ agoraSegundos: 1_757_900_001 }));

    const ok = createVerify('RSA-SHA256')
      .update(outro)
      .end()
      .verify(publicKey, Buffer.from(assinatura, 'base64url'));
    expect(ok).toBe(false);
  });
});

describe('normalizarChavePrivada', () => {
  const corpoPem = '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBg\n-----END PRIVATE KEY-----\n';

  it('transforma \\n literal em quebra de linha real', () => {
    const escapada = corpoPem.replace(/\n/g, '\\n');
    expect(escapada).not.toContain('\n');
    expect(normalizarChavePrivada(escapada)).toBe(corpoPem.trim());
  });

  it('deixa passar uma chave que já tem quebras reais', () => {
    expect(normalizarChavePrivada(corpoPem)).toBe(corpoPem.trim());
  });

  it('recusa valor que não é PEM', () => {
    expect(() => normalizarChavePrivada('minha-chave-secreta')).toThrow(/PEM/);
  });
});
