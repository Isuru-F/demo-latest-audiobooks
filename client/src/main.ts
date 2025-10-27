import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import * as Sentry from '@sentry/vue'

import App from './App.vue'
import router from './router'

const app = createApp(App)

const sentryDsn = import.meta.env.VITE_SENTRY_DSN
const environment = import.meta.env.VITE_SENTRY_ENVIRONMENT || import.meta.env.MODE

if (sentryDsn) {
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
    replaysSessionSampleRate: environment === 'production' ? 0.1 : 0.5,
    replaysOnErrorSampleRate: 1.0,
  })
}

app.use(createPinia())
app.use(router)

app.mount('#app')
