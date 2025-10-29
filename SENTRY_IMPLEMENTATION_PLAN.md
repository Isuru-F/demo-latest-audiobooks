# Implementation Plan: Sentry Logging for Client-Side

## Overview
This plan outlines the implementation of Sentry error tracking and performance monitoring for the Vue 3.5 client application. Sentry will provide real-time error tracking, performance monitoring, session replay, and user feedback capabilities.

## Implementation PLAN

### Phase 1: Initial Setup and Configuration

#### 1.1 Install Sentry SDK
**Action:** Add the official Sentry Vue SDK package
```bash
cd client && npm install @sentry/vue --save
```

**Why:** `@sentry/vue` is the official Sentry SDK specifically designed for Vue 3 applications with built-in integrations for Vue error handling, router tracing, and Pinia state management.

#### 1.2 Create Sentry Configuration File
**Action:** Create a dedicated configuration file at `client/src/config/sentry.config.ts`

**Configuration Details:**
```typescript
import * as Sentry from '@sentry/vue'
import type { Router } from 'vue-router'

export interface SentryConfig {
  dsn: string
  environment: string
  release?: string
  tracesSampleRate: number
  replaysSessionSampleRate: number
  replaysOnErrorSampleRate: number
  enablePerformanceMonitoring: boolean
  enableSessionReplay: boolean
  enableUserFeedback: boolean
}

export function initSentry(app: any, router: Router, config: SentryConfig) {
  Sentry.init({
    app,
    dsn: config.dsn,
    environment: config.environment,
    release: config.release,
    
    // Integrations
    integrations: [
      Sentry.browserTracingIntegration({ router }),
      config.enableSessionReplay ? Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }) : null,
      config.enableUserFeedback ? Sentry.feedbackIntegration({
        colorScheme: 'system',
        showBranding: false,
      }) : null,
    ].filter(Boolean),

    // Performance Monitoring
    tracesSampleRate: config.tracesSampleRate,
    tracePropagationTargets: ['localhost', /^https:\/\/yourserver\.io\/api/],

    // Session Replay
    replaysSessionSampleRate: config.replaysSessionSampleRate,
    replaysOnErrorSampleRate: config.replaysOnErrorSampleRate,

    // Send user IP and headers for better context
    sendDefaultPii: true,

    // Before send hook for filtering/modifying events
    beforeSend(event, hint) {
      // Filter out specific errors if needed
      if (event.exception) {
        const error = hint.originalException
        // Example: filter out network errors in development
        if (config.environment === 'development' && 
            error?.toString().includes('NetworkError')) {
          return null
        }
      }
      return event
    },
  })
}
```

**Why:** Separating configuration from initialization provides:
- Better testability
- Environment-specific configurations
- Easy feature toggling
- Type safety with TypeScript

#### 1.3 Update main.ts
**Action:** Initialize Sentry in the application entry point

```typescript
import './assets/main.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createSentryPiniaPlugin } from '@sentry/vue'
import App from './App.vue'
import router from './router'
import { initSentry } from './config/sentry.config'

const app = createApp(App)

// Initialize Sentry with configuration
initSentry(app, router, {
  dsn: import.meta.env.VITE_SENTRY_DSN || '',
  environment: import.meta.env.MODE,
  release: import.meta.env.VITE_APP_VERSION,
  tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  enablePerformanceMonitoring: true,
  enableSessionReplay: import.meta.env.PROD,
  enableUserFeedback: import.meta.env.PROD,
})

// Setup Pinia with Sentry plugin
const pinia = createPinia()
pinia.use(createSentryPiniaPlugin())

app.use(pinia)
app.use(router)
app.mount('#app')
```

**Why:** 
- Early initialization ensures all errors are captured
- Pinia integration captures state context with errors
- Environment-based sampling reduces costs in production

### Phase 2: Environment Configuration

#### 2.1 Create Environment Variables
**Action:** Add Sentry configuration to `.env` files

`.env.local` (not committed):
```bash
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
VITE_APP_VERSION=1.0.0
```

`.env.example`:
```bash
VITE_SENTRY_DSN=
VITE_APP_VERSION=1.0.0
```

**Why:** Keeps sensitive DSN out of source control while documenting required variables.

#### 2.2 Update TypeScript Environment Types
**Action:** Add type definitions to `client/env.d.ts`

```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SENTRY_DSN: string
  readonly VITE_APP_VERSION: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

**Why:** Provides IDE autocomplete and type safety for environment variables.

### Phase 3: Error Boundary and Custom Error Handling

#### 3.1 Create Error Service
**Action:** Create `client/src/services/errorService.ts` for custom error handling

```typescript
import * as Sentry from '@sentry/vue'

export class ErrorService {
  static captureException(error: Error, context?: Record<string, any>) {
    Sentry.captureException(error, {
      contexts: {
        custom: context,
      },
    })
  }

  static captureMessage(message: string, level: Sentry.SeverityLevel = 'info') {
    Sentry.captureMessage(message, level)
  }

  static setUser(user: { id: string; email?: string; username?: string }) {
    Sentry.setUser(user)
  }

  static clearUser() {
    Sentry.setUser(null)
  }

  static addBreadcrumb(message: string, category: string, data?: Record<string, any>) {
    Sentry.addBreadcrumb({
      message,
      category,
      data,
      level: 'info',
    })
  }

  static startTransaction(name: string, op: string) {
    return Sentry.startSpan({ op, name }, () => {})
  }
}
```

**Why:** Provides a centralized API for error handling across the application.

#### 3.2 Add Axios Interceptor
**Action:** Update axios configuration to log API errors

```typescript
// In your axios setup file
import axios from 'axios'
import { ErrorService } from '@/services/errorService'

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    ErrorService.captureException(error, {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
    })
    return Promise.reject(error)
  }
)
```

**Why:** Automatically captures all API errors with request context.

### Phase 4: Source Maps Configuration

#### 4.1 Install Sentry Build Plugin
**Action:** Install Sentry Vite plugin for automatic source map upload

```bash
cd client && npm install @sentry/vite-plugin --save-dev
```

#### 4.2 Update Vite Configuration
**Action:** Modify `client/vite.config.ts`

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { sentryVitePlugin } from '@sentry/vite-plugin'

export default defineConfig({
  plugins: [
    vue(),
    sentryVitePlugin({
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      sourcemaps: {
        assets: './dist/**',
      },
      release: {
        name: process.env.VITE_APP_VERSION,
      },
    }),
  ],
  build: {
    sourcemap: true,
  },
})
```

**Why:** Source maps enable readable stack traces in Sentry, making debugging much easier.

### Phase 5: Performance Monitoring

#### 5.1 Add Custom Performance Tracking
**Action:** Track critical user interactions

```typescript
// Example in a component
import * as Sentry from '@sentry/vue'

export default {
  methods: {
    async loadAudiobooks() {
      const transaction = Sentry.startSpan({
        op: 'fetch',
        name: 'Load Audiobooks',
      }, async () => {
        const response = await fetch('/api/audiobooks')
        return response.json()
      })
    }
  }
}
```

**Why:** Identifies performance bottlenecks in critical user flows.

### Phase 6: Testing and Verification

#### 6.1 Add Test Error Buttons (Development Only)
**Action:** Create test component for verification

```vue
<template>
  <div v-if="isDevelopment" class="sentry-test-panel">
    <button @click="testError">Test Error</button>
    <button @click="testPerformance">Test Performance</button>
    <button @click="testFeedback">Test Feedback</button>
  </div>
</template>

<script setup lang="ts">
import * as Sentry from '@sentry/vue'

const isDevelopment = import.meta.env.DEV

function testError() {
  throw new Error('Sentry Test Error')
}

function testPerformance() {
  Sentry.startSpan({ op: 'test', name: 'Test Performance' }, async () => {
    await new Promise(resolve => setTimeout(resolve, 100))
  })
}

function testFeedback() {
  const feedback = Sentry.getFeedback()
  feedback?.open()
}
</script>
```

#### 6.2 Unit Tests
**Action:** Add tests for ErrorService

```typescript
// client/src/services/__tests__/errorService.spec.ts
import { describe, it, expect, vi } from 'vitest'
import * as Sentry from '@sentry/vue'
import { ErrorService } from '../errorService'

vi.mock('@sentry/vue')

describe('ErrorService', () => {
  it('should capture exceptions with context', () => {
    const error = new Error('Test error')
    const context = { userId: '123' }
    
    ErrorService.captureException(error, context)
    
    expect(Sentry.captureException).toHaveBeenCalledWith(error, {
      contexts: { custom: context },
    })
  })
})
```

### Phase 7: Documentation

#### 7.1 Update README
**Action:** Document Sentry setup in project README

```markdown
## Error Monitoring

This project uses Sentry for error tracking and performance monitoring.

### Setup
1. Create a Sentry account at https://sentry.io
2. Create a new Vue project in Sentry
3. Copy the DSN to `.env.local` as `VITE_SENTRY_DSN`
4. Set up source maps: `npx @sentry/wizard@latest -i sourcemaps`

### Usage
- Errors are automatically captured
- Use `ErrorService` for manual error tracking
- Performance monitoring is enabled for all routes
```

## Implementation Checklist

- [ ] Install `@sentry/vue` package
- [ ] Create `sentry.config.ts` with typed configuration
- [ ] Update `main.ts` with Sentry initialization
- [ ] Add Pinia plugin for state capture
- [ ] Create `.env.local` with SENTRY_DSN
- [ ] Update `env.d.ts` with type definitions
- [ ] Create `ErrorService` utility class
- [ ] Add axios interceptor for API errors
- [ ] Install `@sentry/vite-plugin`
- [ ] Configure Vite for source maps
- [ ] Add performance tracking to critical paths
- [ ] Create development test component
- [ ] Write unit tests for ErrorService
- [ ] Update project README
- [ ] Test error capture in development
- [ ] Test performance monitoring
- [ ] Verify source maps in Sentry dashboard

## Success Metrics

1. All client-side errors are captured in Sentry
2. Source maps provide readable stack traces
3. API errors include request context
4. Performance traces show router navigation timing
5. Pinia state is included with error reports
6. Zero performance impact in production (<50ms overhead)

## Security Considerations

1. **PII Handling:** Configure `sendDefaultPii` based on privacy requirements
2. **Sensitive Data:** Use `beforeSend` hook to scrub sensitive information
3. **DSN Protection:** Never commit DSN to source control
4. **Source Maps:** Consider restricting source map access in Sentry settings

## Cost Optimization

1. Use sampling rates to control event volume:
   - Production errors: 100% (`replaysOnErrorSampleRate: 1.0`)
   - Production sessions: 10% (`replaysSessionSampleRate: 0.1`)
   - Production traces: 10% (`tracesSampleRate: 0.1`)
2. Development: 100% sampling for all events
3. Use `beforeSend` to filter out known/ignorable errors

## Future Enhancements

1. **Custom Context:** Add user roles, feature flags to error context
2. **Release Tracking:** Link errors to specific releases/deployments
3. **Performance Budgets:** Set up alerts for performance degradation
4. **User Feedback:** Enable in-app feedback widget for production
5. **Distributed Tracing:** Connect frontend traces with backend traces
6. **Custom Metrics:** Track business-critical metrics (e.g., checkout success rate)

## References

- [Sentry Vue Documentation](https://docs.sentry.io/platforms/javascript/guides/vue/)
- [Performance Monitoring Best Practices](https://docs.sentry.io/product/performance/best-practices/)
- [Source Maps Guide](https://docs.sentry.io/platforms/javascript/sourcemaps/)
