import * as Sentry from '@sentry/vue'
import type { Router } from 'vue-router'
import type { App } from 'vue'

export function initSentry(app: App, router: Router) {
  const dsn = import.meta.env.VITE_SENTRY_DSN

  if (!dsn) {
    console.warn('Sentry DSN not configured. Error tracking is disabled.')
    return
  }

  Sentry.init({
    app,
    dsn,
    integrations: [
      Sentry.browserTracingIntegration({ router }),
      Sentry.replayIntegration()
    ],
    tracesSampleRate: 0.1,
    tracePropagationTargets: ['localhost', /^https:\/\/.*\.audiobooks\.io\/api/],
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    environment: import.meta.env.MODE || 'development'
  })
}
