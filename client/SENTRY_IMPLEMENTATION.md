# Sentry Client-Side Implementation Plan

## Overview
This document outlines the implementation of Sentry error monitoring and performance tracking for the Vue 3 client application.

## Implementation Steps

### 1. Package Installation
- ✅ Installed `@sentry/vue` package (v10.19.0)

### 2. Configuration Setup
- ✅ Created `src/sentry.ts` configuration module with:
  - Vue 3 and Router integration
  - Browser tracing for performance monitoring
  - Session replay for error debugging
  - Environment-based configuration
  - DSN from environment variables

### 3. Integration
- ✅ Updated `src/main.ts` to initialize Sentry before mounting the app
- ✅ Integrated with Vue Router for automatic route tracking

### 4. Environment Configuration
- ✅ Created `.env.example` with required Sentry DSN variable
- Environment variables needed:
  - `VITE_SENTRY_DSN`: Your Sentry project DSN (get from sentry.io)

### 5. Features Implemented
- **Error Monitoring**: Automatic capture of unhandled errors and exceptions
- **Performance Tracking**: Browser tracing integration with Vue Router
- **Session Replay**: Record user sessions to debug issues (10% sample rate, 100% on errors)
- **Environment Awareness**: Different sample rates for dev vs production
- **Debug Logging**: Console logs Sentry events in development mode

## Configuration Details

### Sentry Configuration (`src/sentry.ts`)
```typescript
- DSN: Loaded from VITE_SENTRY_DSN environment variable
- Environment: Automatically set based on NODE_ENV
- Traces Sample Rate: 100% in dev, 20% in production
- Replay Sample Rate: 10% of sessions, 100% of error sessions
- Integrations: Browser tracing + Session replay
```

### Setup Instructions

1. **Get Sentry DSN**:
   - Create a project at https://sentry.io
   - Copy your DSN from project settings

2. **Configure Environment**:
   - Create `.env.local` file in client directory
   - Add: `VITE_SENTRY_DSN=your-actual-dsn-here`

3. **Verify Setup**:
   - Run the application in dev mode
   - Trigger a test error
   - Check Sentry dashboard for captured error

4. **Optional: Source Maps** (for production debugging):
   ```bash
   npx @sentry/wizard@latest -i sourcemaps
   ```

## Testing the Implementation

### Test Error Capture
Add a test button to any component:
```vue
<button @click="testSentry">Test Sentry</button>

<script setup>
import * as Sentry from '@sentry/vue'

const testSentry = () => {
  throw new Error('Sentry test error')
}
</script>
```

### Test Performance Tracking
```typescript
import * as Sentry from '@sentry/vue'

Sentry.startSpan({ op: 'test', name: 'Example Span' }, async () => {
  await someAsyncOperation()
})
```

## Security Considerations
- DSN is safe to expose in client-side code (it's public)
- Never commit `.env.local` file with actual DSN
- Use environment-specific DSNs for dev/staging/prod
- Configure allowed domains in Sentry dashboard

## Next Steps
1. Get Sentry DSN from project owner
2. Add to environment variables
3. Test error capture in development
4. Configure source maps for production (optional)
5. Set up alerts and notifications in Sentry dashboard
6. Fine-tune sample rates based on traffic

## Additional Resources
- [Sentry Vue Documentation](https://docs.sentry.io/platforms/javascript/guides/vue/)
- [Sentry Configuration Options](https://docs.sentry.io/platforms/javascript/guides/vue/configuration/)
- [Source Maps Guide](https://docs.sentry.io/platforms/javascript/guides/vue/sourcemaps/)
