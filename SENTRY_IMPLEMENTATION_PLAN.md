# KAN-4 Implementation Plan: Client-side Sentry Logging

## Overview
This document outlines the comprehensive plan for integrating Sentry error tracking and performance monitoring into the Vue 3.5 + TypeScript + Vite client application.

---

## 1. Required Sentry Packages

### Runtime Dependencies (Required)
- `@sentry/vue` — Core SDK for Vue 3

### Runtime Dependencies (Optional but Recommended)
- `@sentry/replay` — Session replay and on-error replay capture
- `@sentry/integrations` — Extra integrations like console breadcrumbs

### Dev Dependencies (Optional but Strongly Recommended)
- `@sentry/vite-plugin` — Upload source maps during build for readable stack traces

### Installation Commands
```bash
cd client
npm i @sentry/vue @sentry/replay @sentry/integrations
npm i -D @sentry/vite-plugin
```

---

## 2. Configuration Setup Steps

### Create Sentry Bootstrap Module

Create file: `client/src/sentry.ts`

```typescript
// client/src/sentry.ts
import type { App } from 'vue'
import * as Sentry from '@sentry/vue'
import { vueRouterInstrumentation, browserTracingIntegration, replayIntegration } from '@sentry/vue'
import { captureConsoleIntegration } from '@sentry/integrations'
import type { Router } from 'vue-router'

// Pull config from Vite env
const DSN = import.meta.env.VITE_SENTRY_DSN as string | undefined
const ENV = (import.meta.env.VITE_SENTRY_ENV as string | undefined) ?? import.meta.env.MODE
const ENABLED = (import.meta.env.VITE_SENTRY_ENABLED as string | undefined)?.toLowerCase() === 'true'
const RELEASE = (import.meta.env.VITE_SENTRY_RELEASE as string | undefined)
const TRACES_SAMPLE_RATE = Number(import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE ?? (ENV === 'production' ? 0.2 : 0))
const REPLAYS_SESSION_SAMPLE_RATE = Number(import.meta.env.VITE_SENTRY_REPLAYS_SESSION_SAMPLE_RATE ?? 0.0)
const REPLAYS_ON_ERROR_SAMPLE_RATE = Number(import.meta.env.VITE_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE ?? 1.0)

export function initSentry(app: App, router: Router) {
  // Never init in test mode or without DSN / explicit enable
  if (import.meta.env.MODE === 'test') return
  if (!ENABLED || !DSN) return

  Sentry.init({
    app,
    dsn: DSN,
    environment: ENV,
    release: RELEASE,
    attachStacktrace: true,
    normalizeDepth: 6,

    // Performance monitoring
    tracesSampleRate: TRACES_SAMPLE_RATE,
    integrations: [
      browserTracingIntegration({
        routingInstrumentation: vueRouterInstrumentation(router),
        tracePropagationTargets: [
          /^https?:\/\/localhost(?::\d+)?/,
        ],
      }),

      // Session Replay (optional)
      replayIntegration({
        maskAllInputs: true,
        maskAllText: false,
      }),

      // Breadcrumbs for console messages (optional)
      captureConsoleIntegration({
        levels: ['error', 'warn', 'info'],
      }),
    ],

    replaysSessionSampleRate: REPLAYS_SESSION_SAMPLE_RATE,
    replaysOnErrorSampleRate: REPLAYS_ON_ERROR_SAMPLE_RATE,

    // Filter & scrub events before they're sent
    beforeSend(event, hint) {
      if (ENV !== 'production') return null
      if (event.user) {
        delete event.user.email
        delete event.user.ip_address
      }
      return event
    },

    ignoreErrors: [
      'ResizeObserver loop limit exceeded',
      'Network Error',
    ],
    denyUrls: [
      /extensions\//i,
      /^chrome:\/\//i,
    ],
  })

  // Global error handler for non-component errors
  app.config.errorHandler = (err, instance, info) => {
    Sentry.captureException(err, {
      contexts: {
        vue: {
          lifecycleHook: info,
          componentName: instance?.$options?.name ?? 'unknown',
        },
      },
      level: 'error',
    })
    if (import.meta.env.DEV) console.error(err)
  }
}
```

### Environment Variables

Create `client/.env.development`:
```
VITE_SENTRY_ENABLED=false
VITE_SENTRY_ENV=development
VITE_SENTRY_DSN=
VITE_SENTRY_TRACES_SAMPLE_RATE=0
VITE_SENTRY_REPLAYS_SESSION_SAMPLE_RATE=0
VITE_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE=1
```

Create `client/.env.production`:
```
VITE_SENTRY_ENABLED=true
VITE_SENTRY_ENV=production
VITE_SENTRY_DSN=<your DSN>
VITE_SENTRY_TRACES_SAMPLE_RATE=0.2
VITE_SENTRY_REPLAYS_SESSION_SAMPLE_RATE=0.05
VITE_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE=1
# Optionally provided by CI
VITE_SENTRY_RELEASE=$GIT_COMMIT_SHA
```

### Update main.ts

```typescript
// client/src/main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { initSentry } from './sentry'

const app = createApp(App)
app.use(createPinia())
app.use(router)

initSentry(app, router) // initialize after router, before mount

app.mount('#app')
```

---

## 3. Vue Router Integration

- Uses `vueRouterInstrumentation(router)` via `browserTracingIntegration`
- Ensure each route has a stable name for better transaction naming
- Prefer route names over full paths with dynamic params to reduce cardinality

Optional: Override transaction name in router afterEach hook:
```typescript
router.afterEach((to) => {
  Sentry.getCurrentScope()?.setTransactionName(to.name?.toString() ?? to.path)
})
```

---

## 4. Error Boundary Implementation

Update `client/src/App.vue`:

```vue
<template>
  <SentryErrorBoundary :fallback="Fallback">
    <RouterView />
  </SentryErrorBoundary>
</template>

<script setup lang="ts">
import { SentryErrorBoundary } from '@sentry/vue'
import { h } from 'vue'

const Fallback = (props: { error: unknown; resetError: () => void }) =>
  h('div', { class: 'error-fallback' }, [
    h('h2', 'Something went wrong'),
    import.meta.env.DEV ? h('pre', String(props.error)) : null,
    h('button', { onClick: () => props.resetError() }, 'Try again'),
  ])
</script>

<style scoped>
.error-fallback { padding: 1rem; }
</style>
```

---

## 5. Performance Monitoring Considerations

- **tracesSampleRate**
  - Production: start with 0.2 (20%)
  - Development: set to 0 to reduce noise
  
- **Transactions**
  - Automatic route transactions via vueRouterInstrumentation
  - XHR/fetch auto-instrumentation enabled by browserTracingIntegration
  
- **Session Replay**
  - Use `replaysSessionSampleRate` for a small subset
  - Set `replaysOnErrorSampleRate=1` to always replay on errors
  - Be mindful of PII; mask inputs appropriately

---

## 6. Environment-Specific Configuration

Only initialize Sentry when:
- `MODE !== 'test'`
- `VITE_SENTRY_ENABLED=true`
- `VITE_SENTRY_DSN` is set

### Development vs Production
- `beforeSend` returns null in non-production to drop events
- Allow in staging by setting `VITE_SENTRY_ENV=staging` and `ENABLED=true`

### Release Tracking
- Inject `VITE_SENTRY_RELEASE` via CI for proper source map linkage

---

## 7. Best Practices for Breadcrumbs and Context

### User Context (After Login)
```typescript
import * as Sentry from '@sentry/vue'
Sentry.setUser({ id: user.id, username: user.username })
```

### Tags and App Context
```typescript
Sentry.setTag('feature_flag_x', String(enabled))
Sentry.setContext('app', { uiVersion: 'v2' })
```

### API Call Breadcrumbs
Add to axios interceptors:
```typescript
import axios from 'axios'
import * as Sentry from '@sentry/vue'

const http = axios.create({ /* baseURL, ... */ })

http.interceptors.request.use((config) => {
  Sentry.addBreadcrumb({
    category: 'http',
    type: 'http',
    level: 'info',
    data: { method: config.method, url: config.url },
    message: `HTTP ${config.method?.toUpperCase()} ${config.url}`,
  })
  return config
})

export default http
```

### PII and Data Minimization
- Avoid attaching raw API payloads, tokens, or PII
- Redact sensitive fields in `beforeSend` if necessary

---

## 8. Testing Considerations

### Unit Tests (Vitest)
- Sentry never initializes during unit tests (MODE === 'test' guard)
- Mock @sentry/vue where needed:

```typescript
import { vi } from 'vitest'

vi.mock('@sentry/vue', () => ({
  init: vi.fn(),
  captureException: vi.fn(),
  setUser: vi.fn(),
  setTag: vi.fn(),
  setContext: vi.fn(),
  addBreadcrumb: vi.fn(),
  getCurrentScope: vi.fn(() => ({ setTransactionName: vi.fn() })),
  SentryErrorBoundary: {},
}))
```

### Manual Verification
In staging with Sentry enabled, test:
- Component errors (button that throws)
- Failed API requests
- Route navigations
- Verify events, transactions, and breadcrumbs in Sentry

---

## 9. Optional: Source Map Upload via @sentry/vite-plugin

### Update vite.config.ts
```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { sentryVitePlugin } from '@sentry/vite-plugin'

export default defineConfig(({ mode }) => ({
  plugins: [
    vue(),
    vueJsx(),
    mode === 'production' &&
      sentryVitePlugin({
        org: process.env.SENTRY_ORG,
        project: process.env.SENTRY_PROJECT,
        authToken: process.env.SENTRY_AUTH_TOKEN,
        release: process.env.VITE_SENTRY_RELEASE,
        include: './dist',
        urlPrefix: '~/',
        filesToDeleteAfterUpload: ['**/*.map'],
        finalize: true,
      }),
  ].filter(Boolean),
  build: {
    sourcemap: true,
  },
}))
```

### CI Variables Required
- `SENTRY_AUTH_TOKEN` (secret, project-scoped)
- `SENTRY_ORG`
- `SENTRY_PROJECT`
- `VITE_SENTRY_RELEASE` (e.g., commit SHA)

---

## 10. Rollout Plan

1. Add packages and create `sentry.ts` module
2. Wire `initSentry(app, router)` in `main.ts`
3. Wrap `RouterView` with `SentryErrorBoundary` in `App.vue`
4. Add `.env.production` with DSN and sampling rates
5. Optional: Configure `@sentry/vite-plugin` and CI env for source maps
6. Add Pinia/auth touchpoint to set user context post-login
7. Add axios interceptor breadcrumbs (optional)
8. Verify in staging environment
9. Tune sample rates based on initial week's volume

---

## Acceptance Criteria

- ✅ Sentry initialized in production only with DSN and enabled flag controls
- ✅ Component and global errors captured
- ✅ User-friendly fallback rendered on component errors
- ✅ Vue Router integrated with performance transactions
- ✅ Optional session replay configured with conservative sampling
- ✅ PII scrubbing in place; no sensitive data sent
- ✅ Source maps uploaded (if plugin used) and release tied to commit SHA
- ✅ Unit tests unaffected; no events sent in test mode
- ✅ Documentation updated with env variables and operational notes

---

## References

- [Sentry Vue Documentation](https://docs.sentry.io/platforms/javascript/guides/vue/)
- [Sentry Performance Monitoring](https://docs.sentry.io/platforms/javascript/performance/)
- [Sentry Session Replay](https://docs.sentry.io/platforms/javascript/session-replay/)
