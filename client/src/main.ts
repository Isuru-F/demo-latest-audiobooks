import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createSentryPiniaPlugin } from '@sentry/vue'

import App from './App.vue'
import router from './router'
import { initSentry } from './sentry'

const app = createApp(App)
const pinia = createPinia()

initSentry(app, router)

pinia.use(createSentryPiniaPlugin())

app.use(pinia)
app.use(router)

app.mount('#app')
