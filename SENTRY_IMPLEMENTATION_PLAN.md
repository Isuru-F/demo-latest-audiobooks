# Sentry Logging Implementation Plan - Client Side

## Overview
This document outlines the implementation plan for integrating Sentry error tracking and logging on the client side of the demo-latest-audiobooks Vue 3.5 application.

## Implementation PLAN

### 1. Install Sentry Dependencies
Install the official Sentry SDK for Vue 3:
```bash
npm install --save @sentry/vue
```

### 2. Configure Sentry in Application Entry Point
Modify `client/src/main.ts` to initialize Sentry before mounting the Vue app:

```typescript
import * as Sentry from '@sentry/vue'

Sentry.init({
  app,
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [
    Sentry.browserTracingIntegration({ router }),
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
  tracesSampleRate: 1.0,
  tracePropagationTargets: ['localhost', /^https:\/\/yourserver\.io\/api/],
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  environment: import.meta.env.MODE,
})
```

### 3. Environment Variables Setup
Create `.env` files for different environments:

**`.env.development`**:
```
VITE_SENTRY_DSN=your-dev-sentry-dsn
```

**`.env.production`**:
```
VITE_SENTRY_DSN=your-prod-sentry-dsn
```

Add `.env` to `.gitignore` to avoid committing sensitive DSN values.

### 4. Create Sentry Configuration File
Create `client/src/config/sentry.config.ts` for centralized configuration:

```typescript
export const sentryConfig = {
  dsn: import.meta.env.VITE_SENTRY_DSN,
  enabled: !!import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  tracesSampleRate: import.meta.env.PROD ? 0.2 : 1.0,
  replaysSessionSampleRate: import.meta.env.PROD ? 0.1 : 0.5,
  replaysOnErrorSampleRate: 1.0,
}
```

### 5. Error Boundary Component
Create a global error boundary component at `client/src/components/ErrorBoundary.vue`:

```vue
<template>
  <div v-if="hasError" class="error-boundary">
    <h2>Something went wrong</h2>
    <p>{{ errorMessage }}</p>
    <button @click="resetError">Try Again</button>
  </div>
  <slot v-else />
</template>

<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'
import * as Sentry from '@sentry/vue'

const hasError = ref(false)
const errorMessage = ref('')

onErrorCaptured((err, instance, info) => {
  hasError.value = true
  errorMessage.value = err.message
  
  Sentry.captureException(err, {
    contexts: {
      vue: {
        componentName: instance?.$options.name,
        propsData: instance?.$props,
        info,
      },
    },
  })
  
  return false
})

const resetError = () => {
  hasError.value = false
  errorMessage.value = ''
}
</script>
```

### 6. Custom Error Logging Service
Create `client/src/services/errorLogger.ts` for manual error logging:

```typescript
import * as Sentry from '@sentry/vue'

export class ErrorLogger {
  static captureException(error: Error, context?: Record<string, any>) {
    console.error('Error captured:', error)
    
    if (import.meta.env.PROD) {
      Sentry.captureException(error, {
        extra: context,
      })
    }
  }

  static captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
    console.log(`[${level}] ${message}`)
    
    if (import.meta.env.PROD) {
      Sentry.captureMessage(message, level)
    }
  }

  static setUser(userId: string, email?: string, username?: string) {
    Sentry.setUser({
      id: userId,
      email,
      username,
    })
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
}
```

### 7. Axios Interceptor for API Error Tracking
Update `client/src/services/api.ts` (or create if it doesn't exist):

```typescript
import axios from 'axios'
import { ErrorLogger } from './errorLogger'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    ErrorLogger.captureException(error, {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
    })
    return Promise.reject(error)
  },
)

export default apiClient
```

### 8. Router Error Tracking
Update `client/src/router/index.ts` to track navigation errors:

```typescript
router.onError((error) => {
  ErrorLogger.captureException(error, {
    type: 'router-error',
  })
})
```

### 9. Performance Monitoring
Add performance tracking for key user interactions in components:

```typescript
import * as Sentry from '@sentry/vue'

const transaction = Sentry.startTransaction({
  name: 'Load Audiobooks',
  op: 'task',
})

try {
  await fetchAudiobooks()
  transaction.setStatus('ok')
} catch (error) {
  transaction.setStatus('unknown_error')
  throw error
} finally {
  transaction.finish()
}
```

### 10. Testing the Integration
Create a test component or endpoint to verify Sentry is working:

```typescript
// Test button component
const testSentry = () => {
  ErrorLogger.captureMessage('Sentry test message', 'info')
  try {
    throw new Error('Test error for Sentry')
  } catch (error) {
    ErrorLogger.captureException(error as Error)
  }
}
```

### 11. Source Maps Configuration
Update `vite.config.ts` to generate source maps for production debugging:

```typescript
export default defineConfig({
  build: {
    sourcemap: true,
  },
})
```

Install and configure Sentry Vite plugin for automatic source map upload:
```bash
npm install --save-dev @sentry/vite-plugin
```

Update `vite.config.ts`:
```typescript
import { sentryVitePlugin } from '@sentry/vite-plugin'

export default defineConfig({
  plugins: [
    sentryVitePlugin({
      org: 'your-sentry-org',
      project: 'your-sentry-project',
      authToken: process.env.SENTRY_AUTH_TOKEN,
    }),
  ],
})
```

### 12. Privacy and Data Scrubbing
Configure sensitive data scrubbing in Sentry initialization:

```typescript
Sentry.init({
  beforeSend(event, hint) {
    // Remove sensitive data
    if (event.request) {
      delete event.request.cookies
    }
    return event
  },
  ignoreErrors: [
    'Network Error',
    'ResizeObserver loop limit exceeded',
  ],
})
```

## Benefits

1. **Real-time Error Tracking**: Catch and track errors in production before users report them
2. **Performance Monitoring**: Track application performance and identify bottlenecks
3. **Session Replay**: Replay user sessions to understand context of errors
4. **Stack Traces**: Get detailed stack traces with source maps for debugging
5. **User Context**: Track which users are affected by specific errors
6. **Breadcrumbs**: See the sequence of events leading to an error
7. **Release Tracking**: Track errors by release version to identify regression

## Security Considerations

1. Store DSN in environment variables, never commit to version control
2. Use `.env.example` file to document required environment variables
3. Configure data scrubbing for sensitive information (PII, tokens, passwords)
4. Set appropriate sample rates to control data volume and costs
5. Use role-based access control in Sentry dashboard

## Testing Checklist

- [ ] Sentry SDK installed and initialized
- [ ] Environment variables configured for dev and prod
- [ ] Error boundary component created and tested
- [ ] Manual error logging service working
- [ ] Axios interceptor capturing API errors
- [ ] Router errors being tracked
- [ ] Performance monitoring configured
- [ ] Source maps generated and uploaded
- [ ] Test error sent to Sentry successfully
- [ ] Verify errors appear in Sentry dashboard
- [ ] Privacy settings configured correctly

## Rollout Strategy

1. **Phase 1**: Install and configure Sentry in development environment
2. **Phase 2**: Test error tracking with intentional errors
3. **Phase 3**: Deploy to staging with low sample rates
4. **Phase 4**: Monitor staging for 1-2 weeks
5. **Phase 5**: Deploy to production with production sample rates
6. **Phase 6**: Set up alerts and notification rules in Sentry

## Maintenance

- Review Sentry dashboard weekly for new error patterns
- Update `ignoreErrors` list as needed for known benign errors
- Adjust sample rates based on volume and costs
- Keep Sentry SDK updated to latest version
- Review and resolve errors by priority (user impact)
