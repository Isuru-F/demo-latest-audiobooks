# KAN-4: SPIKE - Sentry Logging Implementation Plan

## Overview
This document outlines the implementation plan for integrating Sentry error tracking and performance monitoring into the client-side Vue 3.5 application.

## Implementation PLAN

### Phase 1: Setup and Configuration

#### 1.1 Install Sentry SDK
```bash
cd client
npm install @sentry/vue --save
```

**Required Packages:**
- `@sentry/vue` - Core Sentry SDK for Vue 3

#### 1.2 Sentry Project Setup
**Prerequisites:**
- Create a Sentry account at https://sentry.io/signup/
- Create a new project for "demo-latest-audiobooks" (Vue/JavaScript)
- Obtain the DSN (Data Source Name) from project settings

**Configuration Details:**
- Platform: JavaScript - Vue
- Alert Rules: Configure for critical errors
- Team Access: Set appropriate permissions

### Phase 2: Code Integration

#### 2.1 Update main.ts/main.js
**Location:** `client/src/main.ts`

**Implementation:**
```typescript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import * as Sentry from '@sentry/vue'

const app = createApp(App)
const pinia = createPinia()

// Initialize Sentry
Sentry.init({
  app,
  dsn: import.meta.env.VITE_SENTRY_DSN,
  
  integrations: [
    // Performance monitoring
    Sentry.browserTracingIntegration({ router }),
    
    // Session Replay - captures user interactions for debugging
    Sentry.replayIntegration(),
    
    // Pinia state tracking
    Sentry.createSentryPiniaPlugin()
  ],

  // Performance Monitoring
  tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0, // 10% in production, 100% in dev
  
  // Session Replay
  replaysSessionSampleRate: 0.1, // 10% of all sessions
  replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors
  
  // Network tracking
  tracePropagationTargets: [
    'localhost',
    /^https:\/\/api\.yourdomain\.com\//
  ],
  
  // Environment
  environment: import.meta.env.MODE,
  
  // Release tracking
  release: import.meta.env.VITE_APP_VERSION || 'dev',
  
  // User context
  sendDefaultPii: false, // Set to true if you want IP/user info
  
  // Enable logs
  enableLogs: true,
  
  // Error filtering
  beforeSend(event, hint) {
    // Filter out development errors if needed
    if (import.meta.env.DEV && hint.originalException?.message?.includes('dev-only')) {
      return null
    }
    return event
  }
})

// Add Pinia plugin for state tracking
pinia.use(Sentry.createSentryPiniaPlugin())

app.use(pinia)
app.use(router)
app.mount('#app')
```

#### 2.2 Environment Variables
**Location:** `client/.env.local` (create if not exists)

```env
# Sentry Configuration
VITE_SENTRY_DSN=https://examplePublicKey@o0.ingest.sentry.io/0
VITE_APP_VERSION=1.0.0
```

**Location:** `client/.env.example` (update to document the variable)

```env
# Sentry Error Tracking
VITE_SENTRY_DSN=your-sentry-dsn-here
VITE_APP_VERSION=1.0.0
```

#### 2.3 TypeScript Type Definitions
**Location:** `client/src/env.d.ts` (update existing file)

```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SENTRY_DSN: string
  readonly VITE_APP_VERSION: string
  // ... other env variables
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

### Phase 3: Advanced Features

#### 3.1 Error Boundary Component
**Location:** `client/src/components/ErrorBoundary.vue`

```vue
<template>
  <div v-if="hasError" class="error-boundary">
    <h2>Oops! Something went wrong</h2>
    <p>We've been notified and will fix this soon.</p>
    <button @click="resetError">Try Again</button>
  </div>
  <slot v-else />
</template>

<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'
import * as Sentry from '@sentry/vue'

const hasError = ref(false)

onErrorCaptured((err, instance, info) => {
  hasError.value = true
  
  Sentry.captureException(err, {
    contexts: {
      vue: {
        componentName: instance?.$options.name,
        propsData: instance?.$props,
        info
      }
    }
  })
  
  return false // Prevent error from propagating
})

const resetError = () => {
  hasError.value = false
}
</script>
```

#### 3.2 API Error Tracking
**Location:** `client/src/utils/api.ts` or axios interceptor

```typescript
import axios from 'axios'
import * as Sentry from '@sentry/vue'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL
})

// Response interceptor for error tracking
api.interceptors.response.use(
  response => response,
  error => {
    // Track API errors in Sentry
    Sentry.captureException(error, {
      tags: {
        type: 'api-error'
      },
      contexts: {
        api: {
          url: error.config?.url,
          method: error.config?.method,
          status: error.response?.status,
          statusText: error.response?.statusText
        }
      }
    })
    
    return Promise.reject(error)
  }
)

export default api
```

#### 3.3 Performance Monitoring for Critical Operations
**Example:** Track audiobook loading performance

```typescript
import * as Sentry from '@sentry/vue'

async function loadAudiobooks() {
  return await Sentry.startSpan(
    {
      op: 'audiobook.load',
      name: 'Load Audiobooks'
    },
    async () => {
      const response = await api.get('/audiobooks')
      return response.data
    }
  )
}
```

### Phase 4: Source Maps Configuration

#### 4.1 Install Sentry Vite Plugin
```bash
cd client
npm install @sentry/vite-plugin --save-dev
```

#### 4.2 Update vite.config.ts
**Location:** `client/vite.config.ts`

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { sentryVitePlugin } from '@sentry/vite-plugin'

export default defineConfig({
  plugins: [
    vue(),
    
    // Add Sentry plugin for production builds
    sentryVitePlugin({
      org: 'your-org-slug',
      project: 'demo-latest-audiobooks',
      authToken: process.env.SENTRY_AUTH_TOKEN,
      
      // Only upload source maps in production
      disable: process.env.NODE_ENV !== 'production',
      
      sourcemaps: {
        assets: './dist/**',
        filesToDeleteAfterUpload: './dist/**/*.map'
      }
    })
  ],
  
  build: {
    sourcemap: true // Enable source maps for production
  }
})
```

#### 4.3 CI/CD Environment Variables
Add to your CI/CD pipeline:
```env
SENTRY_AUTH_TOKEN=your-sentry-auth-token
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=demo-latest-audiobooks
```

### Phase 5: Testing and Verification

#### 5.1 Manual Testing
Create a test component to verify Sentry integration:

**Location:** `client/src/components/SentryTest.vue`

```vue
<template>
  <div v-if="import.meta.env.DEV" class="sentry-test">
    <h3>Sentry Integration Test (Dev Only)</h3>
    <button @click="throwError">Test Error Tracking</button>
    <button @click="testPerformance">Test Performance</button>
    <button @click="testUserFeedback">Test User Feedback</button>
  </div>
</template>

<script setup lang="ts">
import * as Sentry from '@sentry/vue'

const throwError = () => {
  throw new Error('Test error for Sentry verification')
}

const testPerformance = async () => {
  await Sentry.startSpan(
    {
      op: 'test',
      name: 'Performance Test Span'
    },
    async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
      console.log('Performance test completed')
    }
  )
}

const testUserFeedback = () => {
  const eventId = Sentry.captureMessage('User feedback test')
  Sentry.showReportDialog({ eventId })
}
</script>
```

#### 5.2 Unit Tests
Update existing unit tests to mock Sentry:

```typescript
// In test setup file
vi.mock('@sentry/vue', () => ({
  init: vi.fn(),
  captureException: vi.fn(),
  captureMessage: vi.fn(),
  startSpan: vi.fn((_, cb) => cb()),
  createSentryPiniaPlugin: vi.fn(() => () => {}),
  browserTracingIntegration: vi.fn(),
  replayIntegration: vi.fn()
}))
```

### Phase 6: Documentation and Best Practices

#### 6.1 Update README.md
Add Sentry configuration section:

```markdown
## Error Tracking with Sentry

This project uses Sentry for error tracking and performance monitoring.

### Setup
1. Copy `.env.example` to `.env.local`
2. Add your Sentry DSN to `VITE_SENTRY_DSN`
3. Run `npm install` in the client directory

### Environment Variables
- `VITE_SENTRY_DSN`: Your Sentry project DSN
- `VITE_APP_VERSION`: Application version for release tracking

### Testing Sentry Integration
In development mode, navigate to `/sentry-test` to verify integration.
```

#### 6.2 Team Guidelines
**When to use Sentry manually:**
- Critical business logic failures
- Important user actions (checkout, purchase, etc.)
- Performance bottlenecks
- Third-party API failures

**Example:**
```typescript
try {
  await processPayment(data)
} catch (error) {
  Sentry.captureException(error, {
    tags: { 
      feature: 'payment',
      severity: 'critical' 
    },
    user: { 
      id: userId 
    }
  })
  throw error
}
```

## Implementation Checklist

- [ ] Create Sentry account and project
- [ ] Install `@sentry/vue` package
- [ ] Configure Sentry in main.ts
- [ ] Add environment variables
- [ ] Update TypeScript definitions
- [ ] Create ErrorBoundary component
- [ ] Add API error tracking
- [ ] Install and configure Sentry Vite plugin
- [ ] Configure source maps
- [ ] Create test component
- [ ] Update unit test mocks
- [ ] Update documentation
- [ ] Deploy to staging and verify
- [ ] Configure CI/CD with Sentry auth token
- [ ] Train team on Sentry usage

## Estimated Timeline

- **Phase 1 (Setup):** 1 hour
- **Phase 2 (Integration):** 2-3 hours
- **Phase 3 (Advanced Features):** 2-3 hours
- **Phase 4 (Source Maps):** 1-2 hours
- **Phase 5 (Testing):** 1-2 hours
- **Phase 6 (Documentation):** 1 hour

**Total:** 8-12 hours

## Cost Considerations

- **Free Tier:** 5,000 errors/month, 50 replays/month
- **Team Plan:** $26/month - 50,000 errors/month, 500 replays/month
- **Recommendation:** Start with free tier, upgrade based on usage

## Security Considerations

1. **Never commit DSN to git** - Use environment variables
2. **PII Data:** Set `sendDefaultPii: false` to comply with GDPR
3. **Source Maps:** Delete after upload or use Sentry's cleanup
4. **Auth Tokens:** Store in CI/CD secrets, never in code
5. **Data Scrubbing:** Configure sensitive data scrubbing in Sentry dashboard

## Monitoring and Alerts

### Recommended Alert Rules
1. **High Error Rate:** > 50 errors in 5 minutes
2. **New Error Type:** Alert on first occurrence
3. **Performance Degradation:** P95 > 3 seconds
4. **Critical Paths:** Monitor checkout, login, payment flows

### Integrations
- Slack: Real-time error notifications
- Jira: Automatic issue creation for critical errors
- PagerDuty: On-call alerting for production issues

## Success Metrics

- **Error Detection:** < 5 minutes to detect production errors
- **Resolution Time:** 50% reduction in time to resolve bugs
- **Performance Insights:** Identify top 3 performance bottlenecks
- **User Experience:** Reduce error rate by 30% in 3 months

## Next Steps

1. **Immediate:** Set up basic error tracking (Phases 1-2)
2. **Week 1:** Add advanced features and source maps (Phases 3-4)
3. **Week 2:** Complete testing and documentation (Phases 5-6)
4. **Month 1:** Analyze data and optimize configuration
5. **Ongoing:** Regular review of Sentry reports and alerts

## References

- [Sentry Vue Documentation](https://docs.sentry.io/platforms/javascript/guides/vue/)
- [Performance Monitoring](https://docs.sentry.io/platforms/javascript/guides/vue/tracing/)
- [Session Replay](https://docs.sentry.io/platforms/javascript/guides/vue/session-replay/)
- [Source Maps Guide](https://docs.sentry.io/platforms/javascript/guides/vue/sourcemaps/)
