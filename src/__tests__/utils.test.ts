import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { cn, formatDate, formatDateShort, normalizeLanguage, filterPostsByLanguage } from '@/lib/utils'

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('px-4', 'py-2')).toBe('px-4 py-2')
  })

  it('resolves Tailwind conflicts (last wins)', () => {
    expect(cn('px-4', 'px-8')).toBe('px-8')
  })

  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden', 'always')).toBe('base always')
  })
})

describe('formatDate', () => {
  it('formats in pt-BR by default', () => {
    const result = formatDate('2025-01-15T12:00:00')
    expect(result).toContain('2025')
    expect(result).toContain('15')
  })

  it('accepts Date objects', () => {
    const result = formatDate(new Date(2025, 0, 15))
    expect(result).toContain('2025')
  })

  it('respects locale parameter', () => {
    const ptResult = formatDate('2025-06-20', 'pt-BR')
    const enResult = formatDate('2025-06-20', 'en-US')
    // Different locales should produce different month names
    expect(ptResult).not.toBe(enResult)
  })
})

describe('normalizeLanguage', () => {
  it('lowercases language strings', () => {
    expect(normalizeLanguage('PT-BR')).toBe('pt-br')
    expect(normalizeLanguage('en')).toBe('en')
  })
})

describe('filterPostsByLanguage', () => {
  const posts = [
    { frontMatter: { language: 'pt-BR' }, title: 'Post PT' },
    { frontMatter: { language: 'en' }, title: 'Post EN' },
    { frontMatter: { language: 'PT-BR' }, title: 'Post PT 2' },
    { frontMatter: {}, title: 'Post sem idioma' }, // defaults to pt-BR
  ]

  it('filters by exact language match', () => {
    const result = filterPostsByLanguage(posts, 'en')
    expect(result).toHaveLength(1)
    expect(result[0].title).toBe('Post EN')
  })

  it('is case-insensitive', () => {
    const result = filterPostsByLanguage(posts, 'pt-br')
    expect(result).toHaveLength(3) // 2 explicit + 1 default
  })

  it('returns empty array when no matches', () => {
    expect(filterPostsByLanguage(posts, 'es')).toHaveLength(0)
  })
})

describe('formatDateShort: a data do card não pode virar o dia', () => {
  // O bug que isto tranca: `new Date('2026-09-07')` é meia-noite UTC, e
  // meia-noite UTC em São Paulo é 21h do dia 6. Formatada no fuso local, a
  // data gravada como 7 de setembro aparecia como 6 em todo card do site.
  const FUSO = process.env.TZ;

  beforeAll(() => {
    process.env.TZ = 'America/Sao_Paulo';
  });

  afterAll(() => {
    process.env.TZ = FUSO;
  });

  it('data sem hora mantém o dia gravado, mesmo a oeste de Greenwich', () => {
    expect(formatDateShort('2026-09-07', 'pt-BR')).toContain('7');
    expect(formatDateShort('2026-09-07', 'pt-BR')).not.toContain('6 set');
  });

  it('abrevia o mês e tira o "de" no português', () => {
    expect(formatDateShort('2026-09-07', 'pt-BR')).toBe('7 set 2026');
  });

  it('em inglês sai na ordem do idioma', () => {
    expect(formatDateShort('2026-09-07', 'en')).toBe('Sep 7, 2026');
  });

  it('instante completo continua sendo convertido — aí o fuso é a informação', () => {
    // 07/09 às 00:30 UTC é ainda dia 6 em São Paulo, e aqui isso é correto:
    // a string declara um instante, não uma data de calendário.
    expect(formatDateShort('2026-09-07T00:30:00Z', 'pt-BR')).toBe('6 set 2026');
  });
});
