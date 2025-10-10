# Implementation PLAN: Sentry Logging for Client

## Overview
This document outlines the implementation plan for integrating Sentry error tracking and performance monitoring on the client side of the demo-latest-audiobooks project.

## Current Implementation

### 1. Dependencies
- Installed `@sentry/vue` package for Vue 3.5 integration
- Includes browser tracing, session replay, and error tracking capabilities

### 2. Configuration Setup
Created `/client/src/config/sentry.ts` with the following features:

#### Core Features
- **Error Tracking**: Automatically captures unhandled errors and rejections
- **Performance Monitoring**: Tracks page loads, navigation, and component rendering
- **Session Replay**: Records user sessions for debugging (configurable)
- **Vue Router Integration**: Tracks navigation and route changes
- **Environment-aware**: Different settings for development vs production

#### Configuration Options
- **DSN**: Configured via `VITE_SENTRY_DSN` environment variable
- **Environment**: Automatically detects from Vite's MODE
- **Sample Rates**:
  - Development: 100% traces and replays
  - Production: 10% traces and replays
  - Error replays: Always 100%
- **Privacy**: Configurable text masking and media blocking
- **Test Environment**: Disabled in test mode

### 3. Integration Points
- Initialized in `main.ts` after Pinia and Vue Router setup
- Receives app and router instances for proper integration
- Runs before app mount to catch early errors

### 4. Environment Configuration
Created `.env.example` template with:
- `VITE_SENTRY_DSN`: Placeholder for Sentry project DSN

## Deployment Checklist

### Prerequisites
1. Create Sentry account at https://sentry.io
2. Create a new Sentry project for Vue.js
3. Copy the DSN from project settings

### Setup Steps
1. Copy `.env.example` to `.env.local`
2. Add your Sentry DSN to `VITE_SENTRY_DSN`
3. Rebuild the client: `npm run build`

### Verification
1. Run the app in development mode
2. Trigger a test error (e.g., undefined variable access)
3. Check Sentry dashboard for the error event
4. Verify performance traces appear in Sentry

## Best Practices

### Error Handling
```typescript
import * as Sentry from '@sentry/vue'

try {
  // risky operation
} catch (error) {
  Sentry.captureException(error)
  // handle error gracefully
}
```

### Custom Context
```typescript
Sentry.setUser({ id: user.id, email: user.email })
Sentry.setTag('feature', 'audiobooks')
Sentry.addBreadcrumb({ message: 'User played audiobook', level: 'info' })
```

### Performance Monitoring
```typescript
const transaction = Sentry.startTransaction({ name: 'loadAudiobooks' })
// ... operation
transaction.finish()
```

## Security Considerations
1. Never commit `.env.local` with real DSN
2. Use separate Sentry projects for dev/staging/production
3. Configure data scrubbing in Sentry dashboard for PII
4. Review session replay settings for privacy compliance

## Future Enhancements
1. Add source map upload for production builds
2. Configure release tracking for version management
3. Set up alerts for critical errors
4. Integrate with CI/CD for automatic error notifications
5. Add custom performance metrics for key user flows

## Testing
1. Unit tests should mock Sentry (already disabled in test mode)
2. Integration tests can use Sentry's test transport
3. E2E tests should use a separate Sentry project

## Monitoring
- Review Sentry dashboard daily for new issues
- Set up alerts for error rate spikes
- Monitor performance degradation trends
- Track user feedback via session replays
