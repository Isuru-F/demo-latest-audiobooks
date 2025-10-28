import * as Sentry from '@sentry/vue'
import type { App } from 'vue'
import type { Router } from 'vue-router'

export function initSentry(app: App, router: Router): void {
  const sentryDsn = import.meta.env.VITE_SENTRY_DSN
  const environment = import.meta.env.MODE

  if (!sentryDsn) {
    console.warn('Sentry DSN not configured. Error tracking is disabled.')
    return
  }

  Sentry.init({
    app,
    dsn: sentryDsn,
    environment,
    integrations: [
      Sentry.browserTracingIntegration({ router }),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    tracesSampleRate: environment === 'production' ? 0.1 : 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    enabled: environment === 'production',
    beforeSend(event) {
      if (event.exception) {
        console.error('Error sent to Sentry:', event.exception)
      }
      return event
    },
  })
}
