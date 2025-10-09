# Sentry Client-Side Logging Implementation Plan

## Overview
This document outlines the implementation plan for adding Sentry error and performance monitoring to the client-side Vue 3.5 application.

## Implementation PLAN

### Phase 1: Installation and Basic Setup

#### 1.1 Install Sentry SDK
```bash
cd client
npm install @sentry/vue --save
```

**Dependencies to add:**
- `@sentry/vue` - Main Sentry SDK for Vue 3

#### 1.2 Environment Configuration
Create or update `.env` files to store Sentry DSN securely:

**`.env.local` (not committed to git):**
```
VITE_SENTRY_DSN=your-actual-sentry-dsn-here
VITE_SENTRY_ENVIRONMENT=development
```

**`.env.production`:**
```
VITE_SENTRY_ENVIRONMENT=production
```

**Add to `.gitignore`:**
```
.env.local
```

#### 1.3 Initialize Sentry in main.ts
Update `client/src/main.ts` to initialize Sentry with appropriate configuration:

```typescript
import './assets/main.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import * as Sentry from '@sentry/vue'

const app = createApp(App)

// Initialize Sentry before mounting the app
if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    app,
    dsn: import.meta.env.VITE_SENTRY_DSN,
    
    // Performance monitoring
    tracesSampleRate: import.meta.env.PROD ? 0.2 : 1.0,
    tracePropagationTargets: ['localhost', /^https:\/\/yourapi\.io\/api/],
    
    // Session Replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    
    // Environment
    environment: import.meta.env.VITE_SENTRY_ENVIRONMENT || 'development',
    
    // Integrations
    integrations: [
      Sentry.browserTracingIntegration({ router }),
      Sentry.replayIntegration(),
      Sentry.feedbackIntegration({
        colorScheme: 'system',
      }),
    ],
    
    // Release tracking
    release: `audiobook-app@${import.meta.env.VITE_APP_VERSION || '1.0.0'}`,
    
    // Privacy
    sendDefaultPii: false,
    
    // Filter out development noise
    beforeSend(event) {
      if (import.meta.env.DEV && event.exception) {
        console.warn('Sentry event captured:', event)
      }
      return event
    },
  })
}

app.use(createPinia())
app.use(router)
app.mount('#app')
```

### Phase 2: Source Maps Configuration

#### 2.1 Install Sentry Build Tools
```bash
npx @sentry/wizard@latest -i sourcemaps
```

This will:
- Install `@sentry/vite-plugin`
- Configure `vite.config.ts` to upload source maps
- Create `.sentryclirc` for authentication

#### 2.2 Update vite.config.ts
The wizard will add configuration similar to:

```typescript
import { sentryVitePlugin } from '@sentry/vite-plugin'

export default defineConfig({
  plugins: [
    vue(),
    sentryVitePlugin({
      org: 'your-org',
      project: 'your-project',
      authToken: process.env.SENTRY_AUTH_TOKEN,
    }),
  ],
  build: {
    sourcemap: true,
  },
})
```

### Phase 3: Error Boundary and Custom Error Handling

#### 3.1 Create Error Tracking Utility
Create `client/src/utils/errorTracking.ts`:

```typescript
import * as Sentry from '@sentry/vue'

export function captureError(error: Error, context?: Record<string, any>) {
  Sentry.captureException(error, {
    extra: context,
  })
}

export function setUserContext(userId: string, email?: string, username?: string) {
  Sentry.setUser({
    id: userId,
    email,
    username,
  })
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

#### 3.2 Integration with Vue Router
Update router configuration to track navigation:

```typescript
import { addBreadcrumb } from '@/utils/errorTracking'

router.beforeEach((to, from) => {
  addBreadcrumb(`Navigating from ${from.path} to ${to.path}`, 'navigation', {
    from: from.path,
    to: to.path,
  })
})
```

#### 3.3 Integration with API Calls
Update axios interceptor in `client/src/services/` to track API errors:

```typescript
import { captureError, addBreadcrumb } from '@/utils/errorTracking'

api.interceptors.request.use((config) => {
  addBreadcrumb(`API Request: ${config.method?.toUpperCase()} ${config.url}`, 'http', {
    url: config.url,
    method: config.method,
  })
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    captureError(error, {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
    })
    return Promise.reject(error)
  }
)
```

### Phase 4: Testing and Verification

#### 4.1 Create Test Component
Add a development-only test button to verify Sentry:

```vue
<!-- client/src/components/SentryTest.vue -->
<template>
  <div v-if="isDevelopment" class="sentry-test">
    <button @click="testError">Test Sentry Error</button>
    <button @click="testPerformance">Test Performance Trace</button>
  </div>
</template>

<script setup lang="ts">
import * as Sentry from '@sentry/vue'

const isDevelopment = import.meta.env.DEV

function testError() {
  throw new Error('Sentry Test Error - This is intentional for testing')
}

function testPerformance() {
  Sentry.startSpan({ op: 'test', name: 'Test Performance Span' }, async () => {
    await new Promise(resolve => setTimeout(resolve, 100))
    console.log('Performance test completed')
  })
}
</script>
```

#### 4.2 Verification Checklist
- [ ] Install dependencies
- [ ] Configure environment variables
- [ ] Initialize Sentry in main.ts
- [ ] Set up source maps
- [ ] Test error capturing
- [ ] Test performance monitoring
- [ ] Verify Session Replay
- [ ] Check Sentry dashboard for events

### Phase 5: Documentation and Best Practices

#### 5.1 Update README.md
Add section on Sentry setup:

```markdown
## Error Monitoring

This project uses Sentry for error tracking and performance monitoring.

### Setup
1. Create a Sentry account at https://sentry.io
2. Create a new Vue project
3. Copy the DSN
4. Create `.env.local` in the `client/` directory:
   ```
   VITE_SENTRY_DSN=your-dsn-here
   VITE_SENTRY_ENVIRONMENT=development
   ```

### Source Maps
To upload source maps for production builds, set the SENTRY_AUTH_TOKEN environment variable.
```

#### 5.2 Best Practices Document
Create `client/docs/SENTRY_BEST_PRACTICES.md`:

- When to manually capture errors vs automatic
- How to add custom context
- Setting user information
- Using breadcrumbs effectively
- Performance monitoring guidelines
- Privacy considerations
- Rate limiting in production

## Configuration Options

### Recommended Settings

**Development:**
- `tracesSampleRate: 1.0` - Capture all transactions
- `replaysSessionSampleRate: 1.0` - Record all sessions
- Console logging enabled for debugging

**Production:**
- `tracesSampleRate: 0.2` - Sample 20% of transactions
- `replaysSessionSampleRate: 0.1` - Record 10% of sessions
- `replaysOnErrorSampleRate: 1.0` - Always record sessions with errors
- Source maps uploaded via CI/CD

## Security Considerations

1. **Never commit DSN or auth tokens** to version control
2. **Use environment variables** for all sensitive data
3. **Disable PII collection** unless legally compliant
4. **Filter sensitive data** in beforeSend hook
5. **Review Sentry data retention** policies

## Success Metrics

After implementation, monitor:
- Error capture rate
- Performance trace collection
- Session replay availability
- Source map upload success
- False positive rate

## Rollback Plan

If issues arise:
1. Set `VITE_SENTRY_DSN` to empty string to disable
2. Remove Sentry.init() call
3. Revert package.json changes
4. Remove @sentry/vue and related packages

## Estimated Timeline

- Phase 1 (Installation & Basic Setup): 30 minutes
- Phase 2 (Source Maps): 20 minutes
- Phase 3 (Custom Error Handling): 1 hour
- Phase 4 (Testing): 30 minutes
- Phase 5 (Documentation): 30 minutes

**Total: ~3 hours**

## Dependencies

- Node.js environment with Vite
- Vue 3.5+
- Vue Router
- Sentry account and project
- CI/CD pipeline for source map uploads (optional)

## References

- [Sentry Vue Documentation](https://docs.sentry.io/platforms/javascript/guides/vue/)
- [Sentry Vite Plugin](https://docs.sentry.io/platforms/javascript/sourcemaps/uploading/vite/)
- [Session Replay Configuration](https://docs.sentry.io/platforms/javascript/session-replay/)
