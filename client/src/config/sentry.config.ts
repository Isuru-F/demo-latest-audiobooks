import * as Sentry from '@sentry/vue'
import type { App } from 'vue'
import type { Router } from 'vue-router'

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
    tracesSampleRate: import.meta.env.PROD ? 0.2 : 1.0,
    tracePropagationTargets: ['localhost', /^https:\/\/yourserver\.io\/api/],
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    environment: import.meta.env.MODE,
    beforeSend(event) {
      if (import.meta.env.DEV) {
        console.log('Sentry Event:', event)
      }
      return event
    }
  })
}
