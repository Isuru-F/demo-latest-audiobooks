import * as Sentry from '@sentry/vue'

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration()
  ],
  tracesSampleRate: import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE
    ? parseFloat(import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE)
    : 1.0,
  tracePropagationTargets: ['localhost', /^https:\/\/yourserver\.io\/api/],
  replaysSessionSampleRate: import.meta.env.VITE_SENTRY_REPLAY_SESSION_SAMPLE_RATE
    ? parseFloat(import.meta.env.VITE_SENTRY_REPLAY_SESSION_SAMPLE_RATE)
    : 0.1,
  replaysOnErrorSampleRate: import.meta.env.VITE_SENTRY_REPLAY_ON_ERROR_SAMPLE_RATE
    ? parseFloat(import.meta.env.VITE_SENTRY_REPLAY_ON_ERROR_SAMPLE_RATE)
    : 1.0,
  environment: import.meta.env.MODE || 'development',
  enabled: import.meta.env.PROD
})
