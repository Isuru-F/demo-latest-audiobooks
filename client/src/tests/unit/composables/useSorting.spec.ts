import { describe, it, expect } from 'vitest'
import { useSorting } from '@/composables/useSorting'

describe('useSorting', () => {
  const { sortBy, getNestedValue, compareStrings, compareDates } = useSorting()

  describe('sortBy', () => {
    it('sorts strings in ascending order', () => {
      const items = [{ name: 'Charlie' }, { name: 'Alice' }, { name: 'Bob' }]
      const sorted = sortBy(items, 'name', 'asc', 'string')
      expect(sorted.map((i: any) => i.name)).toEqual(['Alice', 'Bob', 'Charlie'])
    })

    it('sorts strings in descending order', () => {
      const items = [{ name: 'Alice' }, { name: 'Charlie' }, { name: 'Bob' }]
      const sorted = sortBy(items, 'name', 'desc', 'string')
      expect(sorted.map((i: any) => i.name)).toEqual(['Charlie', 'Bob', 'Alice'])
    })

    it('sorts dates in ascending order', () => {
      const items = [
        { date: '2024-03-15' },
        { date: '2024-01-10' },
        { date: '2024-02-20' }
      ]
      const sorted = sortBy(items, 'date', 'asc', 'date')
      expect(sorted.map((i: any) => i.date)).toEqual(['2024-01-10', '2024-02-20', '2024-03-15'])
    })

    it('sorts dates in descending order', () => {
      const items = [
        { date: '2024-01-10' },
        { date: '2024-03-15' },
        { date: '2024-02-20' }
      ]
      const sorted = sortBy(items, 'date', 'desc', 'date')
      expect(sorted.map((i: any) => i.date)).toEqual(['2024-03-15', '2024-02-20', '2024-01-10'])
    })

    it('sorts by nested properties', () => {
      const items = [
        { artist: { name: 'Zoe' } },
        { artist: { name: 'Alice' } },
        { artist: { name: 'Mike' } }
      ]
      const sorted = sortBy(items, 'artist.name', 'asc', 'string')
      expect(sorted.map((i: any) => i.artist.name)).toEqual(['Alice', 'Mike', 'Zoe'])
    })

    it('handles undefined/null values by placing them at the end', () => {
      const items: any[] = [
        { name: 'Bob' },
        { name: null },
        { name: 'Alice' },
        { name: undefined }
      ]
      const sorted = sortBy(items, 'name', 'asc', 'string')
      expect((sorted[0] as any).name).toBe('Alice')
      expect((sorted[1] as any).name).toBe('Bob')
      expect([null, undefined]).toContain((sorted[2] as any).name)
      expect([null, undefined]).toContain((sorted[3] as any).name)
    })

    it('returns original array if empty', () => {
      const items: any[] = []
      const sorted = sortBy(items, 'name', 'asc', 'string')
      expect(sorted).toEqual([])
    })

    it('does not mutate original array', () => {
      const items = [{ name: 'Charlie' }, { name: 'Alice' }, { name: 'Bob' }]
      const original = [...items]
      sortBy(items, 'name', 'asc', 'string')
      expect(items).toEqual(original)
    })
  })

  describe('getNestedValue', () => {
    it('retrieves nested property values', () => {
      const obj = { user: { profile: { name: 'John' } } }
      expect(getNestedValue(obj, 'user.profile.name')).toBe('John')
    })

    it('returns undefined for non-existent paths', () => {
      const obj = { user: { name: 'John' } }
      expect(getNestedValue(obj, 'user.profile.name')).toBeUndefined()
    })
  })

  describe('compareStrings', () => {
    it('compares strings in ascending order', () => {
      expect(compareStrings('apple', 'banana', 'asc')).toBeLessThan(0)
      expect(compareStrings('banana', 'apple', 'asc')).toBeGreaterThan(0)
      expect(compareStrings('apple', 'apple', 'asc')).toEqual(0)
    })

    it('compares strings in descending order', () => {
      expect(compareStrings('apple', 'banana', 'desc')).toBeGreaterThan(0)
      expect(compareStrings('banana', 'apple', 'desc')).toBeLessThan(0)
      expect(Math.abs(compareStrings('apple', 'apple', 'desc'))).toBe(0)
    })
  })

  describe('compareDates', () => {
    it('compares dates in ascending order', () => {
      expect(compareDates('2024-01-01', '2024-02-01', 'asc')).toBeLessThan(0)
      expect(compareDates('2024-02-01', '2024-01-01', 'asc')).toBeGreaterThan(0)
      expect(compareDates('2024-01-01', '2024-01-01', 'asc')).toEqual(0)
    })

    it('compares dates in descending order', () => {
      expect(compareDates('2024-01-01', '2024-02-01', 'desc')).toBeGreaterThan(0)
      expect(compareDates('2024-02-01', '2024-01-01', 'desc')).toBeLessThan(0)
      expect(Math.abs(compareDates('2024-01-01', '2024-01-01', 'desc'))).toBe(0)
    })
  })
})
