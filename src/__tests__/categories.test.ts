import { describe, it, expect } from 'vitest'
import { getCategoryConfig, categoryConfig } from '@/lib/categories'

describe('getCategoryConfig', () => {
  it('returns config for known PT category', () => {
    const config = getCategoryConfig('Cibersegurança')
    expect(config.label).toBe('Cibersegurança')
    expect(config.color).toContain('text-')
  })

  it('returns config for known EN category', () => {
    const config = getCategoryConfig('Cybersecurity')
    expect(config.label).toBe('Cibersegurança')
  })

  it('normalizes EN → PT via categoryNameMap', () => {
    const enConfig = getCategoryConfig('Travel')
    const ptConfig = getCategoryConfig('Viagens')
    expect(enConfig.label).toBe(ptConfig.label)
  })

  it('returns fallback for unknown category', () => {
    const config = getCategoryConfig('Inexistente')
    expect(config.label).toBe('Inexistente')
    expect(config.color).toBe('text-primary')
  })

  it('has all expected categories in config', () => {
    const expected = [
      'Cibersegurança', 'Cybersecurity', 'Segurança', 'Security',
      'Contraespionagem', 'Counterespionage', 'IA', 'AI',
      'Viagens', 'Travel', 'Vida', 'Life', 'Geral', 'General',
    ]
    for (const cat of expected) {
      expect(categoryConfig[cat]).toBeDefined()
    }
  })
})
