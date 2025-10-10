import * as Sentry from '@sentry/vue'
import type { App } from 'vue'
import type { Router } from 'vue-router'

export function initSentry(app: App, router: Router) {
  Sentry.init({
    app,
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    integrations: [
      Sentry.browserTracingIntegration({ router }),
      Sentry.replayIntegration()
    ],
    tracesSampleRate: import.meta.env.PROD ? 0.2 : 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    tracePropagationTargets: ['localhost', /^https:\/\/yourserver\.io\/api/],
    beforeSend(event) {
      if (import.meta.env.DEV) {
        console.log('Sentry Event:', event)
      }
      return event
    }
  })
}
