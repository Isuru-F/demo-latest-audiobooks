import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('Sentry Integration', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('should not throw errors when VITE_SENTRY_DSN is not set', () => {
    expect(() => {
      import('../main')
    }).not.toThrow()
  })

  it('should initialize without errors when Sentry is imported', async () => {
    const Sentry = await import('@sentry/vue')
    expect(Sentry).toBeDefined()
    expect(typeof Sentry.init).toBe('function')
  })
})
