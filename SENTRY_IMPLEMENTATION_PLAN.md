# Implementation PLAN: Sentry Client-Side Logging

## Overview
This document outlines the plan for implementing Sentry error tracking and logging on the client-side of the demo-latest-audiobooks Vue 3.5 application.

## 1. Setup & Installation

### 1.1 Install Sentry SDK
```bash
cd client
npm install @sentry/vue
```

### 1.2 Required Sentry Account Setup
- Create a Sentry project (or use existing)
- Obtain DSN (Data Source Name) from Sentry project settings
- Configure environment variables

## 2. Configuration

### 2.1 Environment Variables
Create `.env` file in client directory:
```
VITE_SENTRY_DSN=your_sentry_dsn_here
VITE_SENTRY_ENVIRONMENT=development
VITE_SENTRY_RELEASE=1.0.0
```

### 2.2 Main Application Integration
Update `client/src/main.ts` to initialize Sentry:

```typescript
import * as Sentry from '@sentry/vue'

const app = createApp(App)

Sentry.init({
  app,
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.VITE_SENTRY_ENVIRONMENT || 'production',
  release: import.meta.env.VITE_SENTRY_RELEASE,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
  tracesSampleRate: 1.0, // Capture 100% of transactions (adjust for production)
  replaysSessionSampleRate: 0.1, // 10% of sessions
  replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors
})
```

## 3. Integration Points

### 3.1 Vue Router Integration
Add Sentry routing instrumentation to track navigation errors:

```typescript
import { createRouter } from 'vue-router'
import * as Sentry from '@sentry/vue'

const router = createRouter({...})

router.onError((error) => {
  Sentry.captureException(error)
})
```

### 3.2 Axios Error Interceptor
Enhance API error tracking in HTTP requests:

```typescript
import axios from 'axios'
import * as Sentry from '@sentry/vue'

axios.interceptors.response.use(
  response => response,
  error => {
    Sentry.captureException(error, {
      tags: {
        source: 'axios',
        endpoint: error.config?.url
      },
      contexts: {
        request: {
          method: error.config?.method,
          url: error.config?.url,
          status: error.response?.status
        }
      }
    })
    return Promise.reject(error)
  }
)
```

### 3.3 Pinia Store Error Handling
Add error tracking to Pinia stores for state management issues:

```typescript
import * as Sentry from '@sentry/vue'

export const useAudiobookStore = defineStore('audiobook', () => {
  const fetchAudiobooks = async () => {
    try {
      // API call
    } catch (error) {
      Sentry.captureException(error, {
        tags: { source: 'pinia', store: 'audiobook' }
      })
      throw error
    }
  }
})
```

## 4. Custom Error Boundaries

### 4.1 Component Error Handling
Create a custom error boundary component:

```typescript
// components/ErrorBoundary.vue
<template>
  <div v-if="error" class="error-boundary">
    <h2>Something went wrong</h2>
    <button @click="handleReset">Try Again</button>
  </div>
  <slot v-else />
</template>

<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'
import * as Sentry from '@sentry/vue'

const error = ref<Error | null>(null)

onErrorCaptured((err) => {
  error.value = err
  Sentry.captureException(err)
  return false
})

const handleReset = () => {
  error.value = null
}
</script>
```

## 5. User Context Tracking

### 5.1 Set User Information
When user information is available, set it in Sentry:

```typescript
Sentry.setUser({
  id: user.id,
  email: user.email,
  username: user.username
})
```

### 5.2 Clear User Context on Logout
```typescript
Sentry.setUser(null)
```

## 6. Breadcrumbs & Custom Events

### 6.1 Track User Actions
Add breadcrumbs for important user interactions:

```typescript
Sentry.addBreadcrumb({
  category: 'audiobook',
  message: 'User played audiobook',
  level: 'info',
  data: {
    audiobookId: audiobook.id,
    title: audiobook.title
  }
})
```

### 6.2 Custom Events
Track specific application events:

```typescript
Sentry.captureMessage('Audiobook search performed', {
  level: 'info',
  tags: { feature: 'search' },
  extra: { query: searchTerm, resultsCount: results.length }
})
```

## 7. Performance Monitoring

### 7.1 Custom Transactions
Track performance-critical operations:

```typescript
const transaction = Sentry.startTransaction({
  name: 'Fetch Audiobooks',
  op: 'http.request'
})

try {
  await fetchAudiobooks()
} finally {
  transaction.finish()
}
```

## 8. Environment-Specific Configuration

### 8.1 Development vs Production
```typescript
const sentryConfig = {
  dsn: import.meta.env.VITE_SENTRY_DSN,
  enabled: import.meta.env.PROD, // Only enable in production
  tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
  beforeSend(event) {
    // Filter out development errors
    if (import.meta.env.DEV) {
      console.log('Sentry event:', event)
      return null // Don't send in dev
    }
    return event
  }
}
```

## 9. Source Maps

### 9.1 Vite Configuration
Update `vite.config.ts` to generate source maps:

```typescript
export default defineConfig({
  build: {
    sourcemap: true
  }
})
```

### 9.2 Upload Source Maps
Add Sentry Vite plugin for automatic source map upload:

```bash
npm install @sentry/vite-plugin --save-dev
```

Update `vite.config.ts`:
```typescript
import { sentryVitePlugin } from '@sentry/vite-plugin'

export default defineConfig({
  plugins: [
    sentryVitePlugin({
      org: 'your-org',
      project: 'your-project',
      authToken: process.env.SENTRY_AUTH_TOKEN
    })
  ]
})
```

## 10. Testing Strategy

### 10.1 Unit Tests
Create tests to verify Sentry integration:
- Test Sentry initialization
- Test error capture
- Test breadcrumb addition

### 10.2 Integration Tests
- Verify errors are sent to Sentry in staging
- Test error boundary functionality
- Validate source map upload

## 11. Implementation Phases

### Phase 1: Basic Setup (Week 1)
- [ ] Install Sentry SDK
- [ ] Configure environment variables
- [ ] Initialize Sentry in main.ts
- [ ] Test basic error capture

### Phase 2: Integration (Week 2)
- [ ] Add Axios interceptor
- [ ] Integrate with Vue Router
- [ ] Add Pinia error handling
- [ ] Create error boundary component

### Phase 3: Enhanced Tracking (Week 3)
- [ ] Implement user context
- [ ] Add breadcrumbs for key actions
- [ ] Setup performance monitoring
- [ ] Configure custom events

### Phase 4: Production Readiness (Week 4)
- [ ] Configure source maps
- [ ] Set up environment-specific configs
- [ ] Create documentation
- [ ] Perform end-to-end testing

## 12. Success Metrics

### 12.1 Error Detection
- Capture 100% of unhandled errors
- Capture 95%+ of handled errors with context
- Average error report within 5 seconds

### 12.2 Performance
- < 50ms overhead for Sentry initialization
- < 10ms overhead per tracked transaction
- < 100KB additional bundle size

### 12.3 Developer Experience
- Clear error grouping in Sentry dashboard
- Accurate source map resolution
- Meaningful error context and breadcrumbs

## 13. Maintenance & Monitoring

### 13.1 Regular Reviews
- Weekly review of error rates
- Monthly review of alert thresholds
- Quarterly SDK updates

### 13.2 Alert Configuration
- Critical errors: Immediate Slack notification
- High-priority errors: Hourly digest
- Low-priority errors: Daily summary

## 14. Privacy & Compliance

### 14.1 Data Scrubbing
Configure Sentry to scrub sensitive data:

```typescript
beforeSend(event) {
  // Remove PII
  if (event.request?.headers) {
    delete event.request.headers['Authorization']
    delete event.request.headers['Cookie']
  }
  return event
}
```

### 14.2 Data Retention
- Configure appropriate data retention policies in Sentry
- Ensure compliance with GDPR/privacy regulations

## 15. Documentation

### 15.1 Developer Documentation
- Setup guide for new developers
- How to add custom error tracking
- Troubleshooting common issues

### 15.2 Operational Documentation
- Sentry dashboard guide
- Alert response procedures
- Incident investigation workflow

## 16. Estimated Effort

- **Setup & Basic Integration**: 1-2 days
- **Advanced Integration**: 2-3 days
- **Testing & Validation**: 1-2 days
- **Documentation**: 1 day
- **Total**: 5-8 days

## 17. Dependencies

- Sentry account with appropriate plan
- Environment variable management
- CI/CD pipeline updates for source map upload
- Team training on Sentry usage

## 18. Risks & Mitigation

### Risk 1: Performance Impact
**Mitigation**: Use appropriate sample rates, lazy load Sentry in non-critical paths

### Risk 2: Sensitive Data Exposure
**Mitigation**: Implement comprehensive data scrubbing, regular audits

### Risk 3: Alert Fatigue
**Mitigation**: Proper error grouping, meaningful alert thresholds

## Conclusion

This implementation plan provides a comprehensive approach to integrating Sentry into the Vue 3.5 client application. The phased approach allows for incremental delivery while ensuring thorough testing and validation at each step.
