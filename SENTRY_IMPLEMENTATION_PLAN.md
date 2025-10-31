# Sentry Client-Side Logging Implementation Plan

## Overview
This document outlines the implementation strategy for integrating Sentry error tracking and performance monitoring into the Vue 3.5 client application.

## Implementation Plan

### 1. Setup and Configuration

#### 1.1 Install Sentry SDK
```bash
npm install @sentry/vue @sentry/tracing
```

#### 1.2 Create Sentry Configuration File
Create `src/config/sentry.ts`:
```typescript
import * as Sentry from '@sentry/vue'
import type { App } from 'vue'
import { router } from '@/router'

export function initSentry(app: App) {
  Sentry.init({
    app,
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    integrations: [
      Sentry.browserTracingIntegration({ router }),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    beforeSend(event, hint) {
      // Filter out development errors if needed
      if (import.meta.env.DEV) {
        console.log('Sentry Event:', event)
        console.log('Hint:', hint)
      }
      return event
    },
  })
}
```

#### 1.3 Update main.ts
```typescript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { initSentry } from './config/sentry'
import App from './App.vue'
import router from './router'

const app = createApp(App)

// Initialize Sentry before mounting
initSentry(app)

app.use(createPinia())
app.use(router)

app.mount('#app')
```

### 2. Environment Variables

#### 2.1 Update `.env` files
Create/update environment files:

`.env.development`:
```
VITE_SENTRY_DSN=your-dev-dsn-here
```

`.env.production`:
```
VITE_SENTRY_DSN=your-prod-dsn-here
```

#### 2.2 Update `.env.example`
```
VITE_SENTRY_DSN=https://examplePublicKey@o0.ingest.sentry.io/0
```

### 3. Error Boundary Component

Create `src/components/ErrorBoundary.vue`:
```vue
<template>
  <div v-if="error" class="error-boundary">
    <h2>Something went wrong</h2>
    <p>{{ error.message }}</p>
    <button @click="handleReset">Try Again</button>
  </div>
  <slot v-else />
</template>

<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'
import * as Sentry from '@sentry/vue'

const error = ref<Error | null>(null)

onErrorCaptured((err: Error) => {
  error.value = err
  Sentry.captureException(err)
  return false
})

const handleReset = () => {
  error.value = null
}
</script>
```

### 4. Service Layer Integration

#### 4.1 Update API Service
Modify `src/services/api.ts` (or equivalent) to capture errors:
```typescript
import axios from 'axios'
import * as Sentry from '@sentry/vue'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    Sentry.captureException(error, {
      tags: {
        source: 'api',
        endpoint: error.config?.url,
      },
      extra: {
        status: error.response?.status,
        data: error.response?.data,
      },
    })
    return Promise.reject(error)
  },
)

export default apiClient
```

### 5. Custom Error Tracking

#### 5.1 Create Error Utility
Create `src/utils/errorTracking.ts`:
```typescript
import * as Sentry from '@sentry/vue'

export function trackError(error: Error, context?: Record<string, any>) {
  Sentry.captureException(error, {
    extra: context,
  })
}

export function trackMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  Sentry.captureMessage(message, level)
}

export function setUserContext(user: { id: string; email?: string; username?: string }) {
  Sentry.setUser(user)
}

export function clearUserContext() {
  Sentry.setUser(null)
}

export function addBreadcrumb(message: string, category: string, data?: Record<string, any>) {
  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level: 'info',
  })
}
```

### 6. Performance Monitoring

#### 6.1 Track Custom Transactions
Example usage in stores or services:
```typescript
import * as Sentry from '@sentry/vue'

export async function fetchAudiobooks() {
  const transaction = Sentry.startTransaction({
    name: 'fetchAudiobooks',
    op: 'data.fetch',
  })

  try {
    const response = await apiClient.get('/audiobooks')
    transaction.setStatus('ok')
    return response.data
  } catch (error) {
    transaction.setStatus('error')
    throw error
  } finally {
    transaction.finish()
  }
}
```

### 7. Source Maps Configuration

#### 7.1 Update vite.config.ts
```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { sentryVitePlugin } from '@sentry/vite-plugin'

export default defineConfig({
  build: {
    sourcemap: true,
  },
  plugins: [
    vue(),
    sentryVitePlugin({
      org: 'your-org',
      project: 'your-project',
      authToken: process.env.SENTRY_AUTH_TOKEN,
    }),
  ],
})
```

### 8. Testing Strategy

#### 8.1 Unit Tests
Create test file `src/config/__tests__/sentry.spec.ts`:
```typescript
import { describe, it, expect, vi } from 'vitest'
import * as Sentry from '@sentry/vue'
import { initSentry } from '../sentry'

vi.mock('@sentry/vue')

describe('Sentry Configuration', () => {
  it('should initialize Sentry with correct config', () => {
    const mockApp = {} as any
    initSentry(mockApp)
    expect(Sentry.init).toHaveBeenCalled()
  })
})
```

### 9. Documentation

#### 9.1 Update README.md
Add section for Sentry configuration:
```markdown
## Error Tracking with Sentry

This application uses Sentry for error tracking and performance monitoring.

### Setup
1. Create a Sentry account at https://sentry.io
2. Create a new Vue project in Sentry
3. Copy the DSN and add it to your `.env` file:
   ```
   VITE_SENTRY_DSN=your-dsn-here
   ```
4. For production deployments, set the `SENTRY_AUTH_TOKEN` environment variable for source map uploads

### Usage
Errors are automatically captured. For manual tracking:
```typescript
import { trackError, trackMessage } from '@/utils/errorTracking'

trackError(new Error('Something went wrong'), { context: 'user action' })
trackMessage('User performed action', 'info')
```
```

### 10. Rollout Plan

#### Phase 1: Development Setup (Day 1)
- Install dependencies
- Create configuration files
- Set up environment variables
- Test locally with development DSN

#### Phase 2: Integration (Day 2)
- Integrate with API service layer
- Add error utilities
- Create error boundary component
- Add breadcrumbs to critical user flows

#### Phase 3: Performance Monitoring (Day 3)
- Add custom transactions
- Configure performance thresholds
- Test performance tracking

#### Phase 4: Production Deployment (Day 4)
- Configure source maps
- Set up production DSN
- Deploy and monitor
- Create alert rules in Sentry dashboard

### 11. Best Practices

1. **Privacy**: Use `beforeSend` to scrub sensitive data
2. **Sampling**: Adjust sample rates based on traffic volume
3. **Releases**: Tag errors with release versions for better tracking
4. **User Context**: Set user context after authentication
5. **Breadcrumbs**: Add breadcrumbs for critical user actions
6. **Testing**: Test error tracking in staging before production
7. **Monitoring**: Set up alerts for critical errors and performance issues

### 12. Estimated Effort

- Setup and Configuration: 2 hours
- Service Layer Integration: 2 hours
- Error Utilities and Components: 2 hours
- Performance Monitoring: 2 hours
- Testing and Documentation: 2 hours
- Production Deployment: 2 hours

**Total: 12 hours (1.5 days)**

### 13. Dependencies

- @sentry/vue: ^7.0.0
- @sentry/tracing: ^7.0.0
- @sentry/vite-plugin: ^2.0.0

### 14. Success Metrics

- All client-side errors captured in Sentry
- Performance metrics available for critical transactions
- Source maps working for production error stack traces
- Zero PII leakage in error reports
- Response time <500ms for 95% of transactions
