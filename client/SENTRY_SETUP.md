# Sentry Integration Setup

## Overview
Sentry has been integrated into the Vue 3.5 client application for error tracking, performance monitoring, and session replay.

## Configuration

### 1. Environment Variables
Create a `.env` file in the `client/` directory:

```bash
VITE_SENTRY_DSN=https://your-sentry-dsn@o123456.ingest.sentry.io/123456
```

You can obtain your DSN from:
1. Log into [Sentry.io](https://sentry.io)
2. Navigate to Settings > Projects > Your Project
3. Go to Client Keys (DSN)
4. Copy the DSN value

### 2. Features Enabled

#### Error Tracking
- Automatic capture of unhandled errors and promise rejections
- Manual error capture via utility functions

#### Performance Monitoring
- Browser tracing integration with Vue Router
- Trace sampling rate: 100% (adjust for production)
- Automatic tracking of:
  - Page loads
  - Navigation timing
  - API requests

#### Session Replay
- Records 10% of normal sessions
- Records 100% of sessions with errors
- Helps debug issues by replaying user sessions

### 3. Usage Examples

#### Automatic Error Capture
All unhandled errors are automatically captured by Sentry.

#### Manual Error Logging
```typescript
import { captureError, captureMessage } from '@/services/sentry'

try {
  // Your code
} catch (error) {
  captureError(error as Error, {
    context: 'additional info',
    userId: '123'
  })
}

// Log informational messages
captureMessage('User completed checkout', 'info')
```

#### User Context
```typescript
import { setUserContext, clearUserContext } from '@/services/sentry'

// After login
setUserContext({
  id: '123',
  email: 'user@example.com',
  username: 'john_doe'
})

// After logout
clearUserContext()
```

#### Breadcrumbs
```typescript
import { addBreadcrumb } from '@/services/sentry'

addBreadcrumb({
  message: 'User clicked checkout button',
  category: 'ui.click',
  level: 'info',
  data: {
    cartTotal: 99.99
  }
})
```

### 4. Production Configuration

For production, adjust the following in `main.ts`:

```typescript
Sentry.init({
  app,
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [
    Sentry.browserTracingIntegration({ router }),
    Sentry.replayIntegration({
      maskAllText: true,  // Mask text for privacy
      blockAllMedia: true, // Block media for performance
    }),
  ],
  tracesSampleRate: 0.1,  // Sample 10% of transactions
  replaysSessionSampleRate: 0.01,  // Record 1% of sessions
  replaysOnErrorSampleRate: 1.0,   // Record 100% of error sessions
  environment: import.meta.env.MODE,
  beforeSend(event) {
    // Filter out sensitive data or unwanted errors
    return event
  },
})
```

### 5. TypeScript Support

Sentry is fully typed. Import types as needed:

```typescript
import type { SeverityLevel } from '@sentry/vue'
```

### 6. Testing Sentry Integration

Add a test button to trigger an error:

```vue
<button @click="testSentry">Test Sentry</button>

<script setup lang="ts">
const testSentry = () => {
  throw new Error('Test Sentry error from Vue component')
}
</script>
```

## Resources
- [Sentry Vue Documentation](https://docs.sentry.io/platforms/javascript/guides/vue/)
- [Sentry Best Practices](https://docs.sentry.io/platforms/javascript/best-practices/)
- [Performance Monitoring](https://docs.sentry.io/platforms/javascript/performance/)
