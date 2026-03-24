import { describe, it, expect } from 'vitest'
import { cn, formatDate, normalizeLanguage, filterPostsByLanguage } from '@/lib/utils'

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
