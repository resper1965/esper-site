import { describe, it, expect } from 'vitest';
import {
  sanitizeImage,
  detectKind,
  ImageRejected,
  MAX_IMAGE_BYTES,
} from '@/lib/image-sanitize';

/** Monta um JPEG mínimo com um APP1/Exif contendo orientação e GPS. */
function jpegWithExif(orientation: number): Uint8Array {
  // TIFF little-endian, IFD0 com duas entradas: Orientation e GPSIFDPointer.
  const tiff: number[] = [];
  tiff.push(0x49, 0x49, 0x2a, 0x00, 8, 0, 0, 0); // header, IFD0 no offset 8
  tiff.push(2, 0); // duas entradas
  // Orientation (0x0112), SHORT, count 1
  tiff.push(0x12, 0x01, 3, 0, 1, 0, 0, 0, orientation, 0, 0, 0);
  // GPSInfo (0x8825), LONG, count 1, aponta para um offset qualquer
  tiff.push(0x25, 0x88, 4, 0, 1, 0, 0, 0, 0x50, 0, 0, 0);
  tiff.push(0, 0, 0, 0); // sem próxima IFD
  // Carga que simula coordenadas — precisa desaparecer.
  const gps = [...'GPS:-23.5505,-46.6333'].map((c) => c.charCodeAt(0));
  while (tiff.length < 0x50) tiff.push(0);
  tiff.push(...gps);

  const payload = [...[0x45, 0x78, 0x69, 0x66, 0x00, 0x00], ...tiff];
  const len = payload.length + 2;
  return new Uint8Array([
    0xff, 0xd8, // SOI
    0xff, 0xe1, (len >> 8) & 0xff, len & 0xff, ...payload, // APP1/Exif
    0xff, 0xda, 0x00, 0x02, // SOS
    0x11, 0x22, 0x33, // "dados"
    0xff, 0xd9, // EOI
  ]);
}

function png(chunks: Array<[string, number[]]>): Uint8Array {
  const out: number[] = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  for (const [type, data] of chunks) {
    out.push((data.length >> 24) & 0xff, (data.length >> 16) & 0xff, (data.length >> 8) & 0xff, data.length & 0xff);
    out.push(...[...type].map((c) => c.charCodeAt(0)));
    out.push(...data);
    out.push(0, 0, 0, 0); // CRC — não verificado aqui
  }
  return new Uint8Array(out);
}

const bytesInclude = (b: Uint8Array, s: string) =>
  String.fromCharCode(...b).includes(s);

describe('detecção de tipo pelos bytes', () => {
  it('reconhece JPEG, PNG e WebP', () => {
    expect(detectKind(new Uint8Array([0xff, 0xd8, 0xff, 0xe0]))).toBe('image/jpeg');
    expect(detectKind(png([['IEND', []]]))).toBe('image/png');
    const webp = new Uint8Array(16);
    webp.set([...'RIFF'].map((c) => c.charCodeAt(0)), 0);
    webp.set([...'WEBP'].map((c) => c.charCodeAt(0)), 8);
    expect(detectKind(webp)).toBe('image/webp');
  });

  it('recusa SVG mesmo com nome de imagem', () => {
    const svg = new TextEncoder().encode('<svg onload="alert(1)"></svg>');
    expect(detectKind(svg)).toBeNull();
    expect(() => sanitizeImage(svg)).toThrow(ImageRejected);
  });

  it('recusa HTML disfarçado', () => {
    const html = new TextEncoder().encode('<!DOCTYPE html><script>fetch("/api")</script>');
    expect(() => sanitizeImage(html)).toThrow(ImageRejected);
  });
});

describe('remoção de metadados', () => {
  it('apaga o GPS do JPEG', () => {
    const original = jpegWithExif(1);
    expect(bytesInclude(original, 'GPS:-23.5505')).toBe(true);

    const { bytes } = sanitizeImage(original);
    expect(bytesInclude(bytes, 'GPS:-23.5505')).toBe(false);
  });

  it('preserva a orientação, que também mora no EXIF', () => {
    for (const o of [1, 3, 6, 8]) {
      const { orientation, bytes } = sanitizeImage(jpegWithExif(o));
      expect(orientation).toBe(o);
      // o EXIF reconstruído continua legível e traz a mesma orientação
      expect(bytes[2]).toBe(0xff);
      expect(bytes[3]).toBe(0xe1);
    }
  });

  it('mantém os dados da imagem intactos', () => {
    const { bytes } = sanitizeImage(jpegWithExif(1));
    const s = String.fromCharCode(...bytes);
    expect(s.charCodeAt(s.length - 2)).toBe(0xff); // EOI preservado
    expect(s.charCodeAt(s.length - 1)).toBe(0xd9);
  });

  it('descarta chunks não essenciais do PNG e guarda os que desenham', () => {
    const input = png([
      ['IHDR', [1, 2, 3]],
      ['eXIf', [...'GPS-AQUI'].map((c) => c.charCodeAt(0))],
      ['tEXt', [...'autor-secreto'].map((c) => c.charCodeAt(0))],
      ['IDAT', [9, 9, 9]],
      ['IEND', []],
    ]);
    const { bytes } = sanitizeImage(input);
    expect(bytesInclude(bytes, 'GPS-AQUI')).toBe(false);
    expect(bytesInclude(bytes, 'autor-secreto')).toBe(false);
    expect(bytesInclude(bytes, 'IHDR')).toBe(true);
    expect(bytesInclude(bytes, 'IDAT')).toBe(true);
    expect(bytesInclude(bytes, 'IEND')).toBe(true);
  });

  it('descarta um chunk desconhecido sem precisar conhecê-lo', () => {
    const input = png([
      ['IHDR', [1]],
      ['zZzZ', [...'inventado-amanha'].map((c) => c.charCodeAt(0))],
      ['IEND', []],
    ]);
    const { bytes } = sanitizeImage(input);
    expect(bytesInclude(bytes, 'inventado-amanha')).toBe(false);
  });
});

describe('limites', () => {
  it('recusa arquivo vazio', () => {
    expect(() => sanitizeImage(new Uint8Array(0))).toThrow(/vazio/i);
  });

  it('recusa acima do teto, dizendo o tamanho', () => {
    const big = new Uint8Array(MAX_IMAGE_BYTES + 1);
    big.set([0xff, 0xd8, 0xff], 0);
    expect(() => sanitizeImage(big)).toThrow(/limite/i);
  });
});
