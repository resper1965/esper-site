/**
 * Higienização de imagem no upload.
 *
 * Duas coisas acontecem aqui, e as duas são de segurança.
 *
 * 1. O TIPO É LIDO DOS BYTES, NÃO DO NOME.
 *    Um arquivo chamado `foto.jpg` pode ser HTML, ou um SVG com <script>.
 *    Servido da mesma origem do site, isso é XSS armazenado com a sessão do
 *    admin do outro lado. Extensão e `Content-Type` vêm do cliente e não
 *    valem nada; a assinatura no início do arquivo, sim.
 *
 * 2. OS METADADOS SAEM.
 *    Foto de viagem carrega GPS, número de série da câmera e horário. Para
 *    quem publica um álbum de 74 países, isso é o mapa de onde dormiu, com
 *    data. Publicar o pixel é escolha; publicar a coordenada não deveria vir
 *    junto de brinde.
 *
 *    A orientação é a única exceção, e é preservada de propósito: ela também
 *    mora no EXIF, e jogar fora o bloco inteiro deitaria metade das fotos de
 *    lado. Então o EXIF é reconstruído do zero contendo só ela.
 *
 * Roda em Worker: só Uint8Array e DataView, sem dependência nativa.
 */

export type ImageKind = 'image/jpeg' | 'image/png' | 'image/webp';

export interface SanitizedImage {
  bytes: Uint8Array;
  kind: ImageKind;
  /** Orientação EXIF preservada (1–8), quando havia. */
  orientation?: number;
}

export class ImageRejected extends Error {
  constructor(readonly reason: string) {
    super(reason);
    this.name = 'ImageRejected';
  }
}

const JPEG = [0xff, 0xd8, 0xff];
const PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

function startsWith(b: Uint8Array, sig: number[], at = 0): boolean {
  if (b.length < at + sig.length) return false;
  return sig.every((v, i) => b[at + i] === v);
}

function ascii(b: Uint8Array, at: number, len: number): string {
  return String.fromCharCode(...b.subarray(at, at + len));
}

/**
 * O tipo real, pelos bytes. `null` quando não é imagem aceita.
 *
 * SVG não entra nesta lista de propósito: é XML executável, não imagem.
 */
export function detectKind(b: Uint8Array): ImageKind | null {
  if (startsWith(b, JPEG)) return 'image/jpeg';
  if (startsWith(b, PNG)) return 'image/png';
  if (b.length >= 12 && ascii(b, 0, 4) === 'RIFF' && ascii(b, 8, 4) === 'WEBP') {
    return 'image/webp';
  }
  return null;
}

// ── JPEG ──────────────────────────────────────────────────

/** Lê a orientação do primeiro APP1/Exif, se houver. */
function readJpegOrientation(b: Uint8Array): number | undefined {
  let p = 2;
  while (p + 4 <= b.length) {
    if (b[p] !== 0xff) break;
    const marker = b[p + 1];
    // SOS: daqui em diante são dados comprimidos, não há mais segmentos.
    if (marker === 0xda) break;
    const len = (b[p + 2] << 8) | b[p + 3];
    if (len < 2) break;
    if (marker === 0xe1 && ascii(b, p + 4, 6) === 'Exif\0\0') {
      const tiff = p + 10;
      const found = readTiffOrientation(b, tiff);
      if (found !== undefined) return found;
    }
    p += 2 + len;
  }
  return undefined;
}

/** Percorre a IFD0 de um bloco TIFF atrás da tag 0x0112 (Orientation). */
function readTiffOrientation(b: Uint8Array, tiff: number): number | undefined {
  if (tiff + 8 > b.length) return undefined;
  const bom = ascii(b, tiff, 2);
  if (bom !== 'II' && bom !== 'MM') return undefined;
  const le = bom === 'II';
  const view = new DataView(b.buffer, b.byteOffset, b.byteLength);
  const ifd0 = tiff + view.getUint32(tiff + 4, le);
  if (ifd0 + 2 > b.length) return undefined;
  const count = view.getUint16(ifd0, le);
  for (let i = 0; i < count; i++) {
    const entry = ifd0 + 2 + i * 12;
    if (entry + 12 > b.length) break;
    if (view.getUint16(entry, le) === 0x0112) {
      const value = view.getUint16(entry + 8, le);
      return value >= 1 && value <= 8 ? value : undefined;
    }
  }
  return undefined;
}

/** Um APP1/Exif mínimo contendo apenas a orientação. */
function minimalExifApp1(orientation: number): Uint8Array {
  const payload = new Uint8Array(6 + 8 + 18);
  const v = new DataView(payload.buffer);
  payload.set([0x45, 0x78, 0x69, 0x66, 0x00, 0x00], 0); // "Exif\0\0"
  payload.set([0x49, 0x49], 6); // little endian
  v.setUint16(8, 0x002a, true);
  v.setUint32(10, 8, true); // offset da IFD0, relativo ao início do TIFF
  v.setUint16(14, 1, true); // uma entrada
  v.setUint16(16, 0x0112, true); // Orientation
  v.setUint16(18, 3, true); // SHORT
  v.setUint32(20, 1, true); // count
  v.setUint16(24, orientation, true);
  v.setUint32(26, 0, true); // não há próxima IFD
  const out = new Uint8Array(4 + payload.length);
  out.set([0xff, 0xe1], 0);
  new DataView(out.buffer).setUint16(2, payload.length + 2, false);
  out.set(payload, 4);
  return out;
}

/**
 * Reescreve o JPEG sem nenhum segmento APPn nem comentário, e devolve um
 * APP1 novo só com a orientação. Some EXIF/GPS, XMP, perfil ICC e a
 * miniatura embutida — que, sim, também vaza: costuma ser a foto original
 * antes de qualquer corte.
 */
function stripJpeg(b: Uint8Array): { bytes: Uint8Array; orientation?: number } {
  const orientation = readJpegOrientation(b);
  const parts: Uint8Array[] = [b.subarray(0, 2)]; // SOI
  if (orientation !== undefined) parts.push(minimalExifApp1(orientation));

  let p = 2;
  while (p + 4 <= b.length) {
    if (b[p] !== 0xff) break;
    const marker = b[p + 1];
    if (marker === 0xda) {
      parts.push(b.subarray(p)); // SOS + dados até o fim
      p = b.length;
      break;
    }
    const len = (b[p + 2] << 8) | b[p + 3];
    if (len < 2 || p + 2 + len > b.length) break;
    const isAppN = marker >= 0xe0 && marker <= 0xef;
    const isComment = marker === 0xfe;
    if (!isAppN && !isComment) parts.push(b.subarray(p, p + 2 + len));
    p += 2 + len;
  }
  if (p < b.length) parts.push(b.subarray(p));
  return { bytes: concat(parts), orientation };
}

// ── PNG ───────────────────────────────────────────────────

/**
 * Mantém só os chunks necessários para desenhar a imagem.
 *
 * Lista de permissão, não de bloqueio: um chunk desconhecido é descartado.
 * É assim que `eXIf`, `tEXt` e companhia saem sem precisarem ser nomeados —
 * e é o que continua funcionando quando surgir um chunk novo.
 */
const PNG_KEEP = new Set(['IHDR', 'PLTE', 'IDAT', 'IEND', 'tRNS', 'gAMA', 'cHRM', 'sRGB', 'iCCP']);

function stripPng(b: Uint8Array): Uint8Array {
  const parts: Uint8Array[] = [b.subarray(0, 8)];
  const view = new DataView(b.buffer, b.byteOffset, b.byteLength);
  let p = 8;
  while (p + 12 <= b.length) {
    const len = view.getUint32(p, false);
    const type = ascii(b, p + 4, 4);
    const end = p + 12 + len;
    if (end > b.length) break;
    if (PNG_KEEP.has(type)) parts.push(b.subarray(p, end));
    p = end;
    if (type === 'IEND') break;
  }
  return concat(parts);
}

// ── WebP ──────────────────────────────────────────────────

/** Descarta os chunks EXIF e XMP do contêiner RIFF e refaz o tamanho. */
function stripWebp(b: Uint8Array): Uint8Array {
  const view = new DataView(b.buffer, b.byteOffset, b.byteLength);
  const parts: Uint8Array[] = [];
  let p = 12;
  while (p + 8 <= b.length) {
    const type = ascii(b, p, 4);
    const len = view.getUint32(p + 4, true);
    const padded = len + (len % 2); // chunks são alinhados em 2 bytes
    const end = p + 8 + padded;
    if (end > b.length) break;
    if (type !== 'EXIF' && type !== 'XMP ') parts.push(b.subarray(p, end));
    p = end;
  }
  const body = concat(parts);
  const out = new Uint8Array(12 + body.length);
  out.set(b.subarray(0, 12), 0);
  out.set(body, 12);
  new DataView(out.buffer).setUint32(4, 4 + body.length, true); // "WEBP" + chunks
  return out;
}

function concat(parts: Uint8Array[]): Uint8Array {
  const total = parts.reduce((n, p) => n + p.length, 0);
  const out = new Uint8Array(total);
  let at = 0;
  for (const p of parts) {
    out.set(p, at);
    at += p.length;
  }
  return out;
}

/** Teto por arquivo. Foto de câmera passa disso; foto para web, não. */
export const MAX_IMAGE_BYTES = 12 * 1024 * 1024;

/**
 * O caminho único de entrada: valida e devolve os bytes já limpos.
 * Lança `ImageRejected` com um motivo legível — a rota o repassa ao usuário.
 */
export function sanitizeImage(input: Uint8Array): SanitizedImage {
  if (input.length === 0) throw new ImageRejected('Arquivo vazio.');
  if (input.length > MAX_IMAGE_BYTES) {
    throw new ImageRejected(
      `Arquivo de ${(input.length / 1024 / 1024).toFixed(1)} MB; o limite é ${MAX_IMAGE_BYTES / 1024 / 1024} MB.`
    );
  }

  const kind = detectKind(input);
  if (!kind) {
    throw new ImageRejected('Não é JPEG, PNG nem WebP. SVG não é aceito: é XML executável, não imagem.');
  }

  if (kind === 'image/jpeg') {
    const { bytes, orientation } = stripJpeg(input);
    return { bytes, kind, orientation };
  }
  return { bytes: kind === 'image/png' ? stripPng(input) : stripWebp(input), kind };
}
