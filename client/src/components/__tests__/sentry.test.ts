import { describe, it, expect, vi, beforeEach } from 'vitest'
import { initSentry } from '../../config/sentry.config'
import * as Sentry from '@sentry/vue'

vi.mock('@sentry/vue', () => ({
  init: vi.fn(),
  browserTracingIntegration: vi.fn(() => 'browserTracingIntegration'),
  replayIntegration: vi.fn(() => 'replayIntegration')
}))

describe('Sentry Configuration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize Sentry when DSN is provided', () => {
    const mockApp = {} as any
    const mockRouter = {} as any

    vi.stubEnv('VITE_SENTRY_DSN', 'https://test@sentry.io/123')

    initSentry(mockApp, mockRouter)

    expect(Sentry.init).toHaveBeenCalledTimes(1)
    expect(Sentry.init).toHaveBeenCalledWith(
      expect.objectContaining({
        app: mockApp,
        dsn: 'https://test@sentry.io/123'
      })
    )
  })

  it('should not initialize Sentry when DSN is missing', () => {
    const mockApp = {} as any
    const mockRouter = {} as any
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    vi.stubEnv('VITE_SENTRY_DSN', '')

    initSentry(mockApp, mockRouter)

    expect(Sentry.init).not.toHaveBeenCalled()
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Sentry DSN not configured. Error tracking is disabled.'
    )

    consoleWarnSpy.mockRestore()
  })
})
