import { describe, it, expect } from 'vitest'
import { calculateReadingTime, formatReadingTime, isNewPost } from '@/lib/reading-time'

describe('calculateReadingTime', () => {
  it('returns 1 min for short content', () => {
    expect(calculateReadingTime('hello world')).toBe(1)
  })

  it('returns 1 min for exactly 200 words', () => {
    const words = Array(200).fill('word').join(' ')
    expect(calculateReadingTime(words)).toBe(1)
  })

  it('returns 2 min for 201 words', () => {
    const words = Array(201).fill('word').join(' ')
    expect(calculateReadingTime(words)).toBe(2)
  })

  it('returns 5 min for 1000 words', () => {
    const words = Array(1000).fill('word').join(' ')
    expect(calculateReadingTime(words)).toBe(5)
  })

  it('handles whitespace-only content', () => {
    expect(calculateReadingTime('   ')).toBe(1)
  })
})

describe('formatReadingTime', () => {
  it('formats in pt-BR by default', () => {
    expect(formatReadingTime(3)).toBe('3 min de leitura')
  })

  it('formats in English', () => {
    expect(formatReadingTime(5, 'en')).toBe('5 min read')
  })
})

describe('isNewPost', () => {
  it('returns true for today', () => {
    expect(isNewPost(new Date().toISOString())).toBe(true)
  })

  it('returns true for 6 days ago', () => {
    const sixDaysAgo = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
    expect(isNewPost(sixDaysAgo.toISOString())).toBe(true)
  })

  it('returns false for 8 days ago', () => {
    const eightDaysAgo = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)
    expect(isNewPost(eightDaysAgo.toISOString())).toBe(false)
  })
})
