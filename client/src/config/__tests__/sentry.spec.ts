import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { initSentry } from '../sentry'
import * as Sentry from '@sentry/vue'

vi.mock('@sentry/vue', () => ({
  init: vi.fn(),
  browserTracingIntegration: vi.fn(() => ({})),
  replayIntegration: vi.fn(() => ({})),
}))

describe('Sentry Configuration', () => {
  let consoleWarnSpy: any
  let consoleErrorSpy: any

  beforeEach(() => {
    vi.resetAllMocks()
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleWarnSpy.mockRestore()
    consoleErrorSpy.mockRestore()
    import.meta.env.VITE_SENTRY_DSN = ''
    import.meta.env.MODE = 'test'
  })

  it('should not initialize Sentry when DSN is not configured', () => {
    import.meta.env.VITE_SENTRY_DSN = ''
    
    const app = createApp({})
    const router = createRouter({ history: createWebHistory(), routes: [] })
    
    initSentry(app, router)
    
    expect(Sentry.init).not.toHaveBeenCalled()
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Sentry DSN not configured. Error tracking is disabled.'
    )
  })

  it('should initialize Sentry with correct configuration in production', () => {
    import.meta.env.VITE_SENTRY_DSN = 'https://test@sentry.io/123'
    import.meta.env.MODE = 'production'
    
    const app = createApp({})
    const router = createRouter({ history: createWebHistory(), routes: [] })
    
    initSentry(app, router)
    
    expect(Sentry.init).toHaveBeenCalledWith(
      expect.objectContaining({
        dsn: 'https://test@sentry.io/123',
        environment: 'production',
        enabled: true,
        tracesSampleRate: 0.1,
      })
    )
  })

  it('should initialize Sentry with correct configuration in development', () => {
    import.meta.env.VITE_SENTRY_DSN = 'https://test@sentry.io/123'
    import.meta.env.MODE = 'development'
    
    const app = createApp({})
    const router = createRouter({ history: createWebHistory(), routes: [] })
    
    initSentry(app, router)
    
    expect(Sentry.init).toHaveBeenCalledWith(
      expect.objectContaining({
        dsn: 'https://test@sentry.io/123',
        environment: 'development',
        enabled: false,
        tracesSampleRate: 1.0,
      })
    )
  })
})
