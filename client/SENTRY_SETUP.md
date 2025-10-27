# Sentry Client-Side Logging Implementation

## Implementation Plan

This document outlines the implementation of Sentry error and performance monitoring for the Vue 3 client application.

## Overview

Sentry has been integrated into the client-side application to provide:
- Error tracking and monitoring
- Performance monitoring
- Session replay for debugging
- Pinia state tracking
- Source map support for production debugging

## Architecture

### Components

1. **Instrumentation File** (`src/instrument.ts`)
   - Early initialization of Sentry SDK
   - Basic configuration before app bootstrap

2. **Main Application Setup** (`src/main.ts`)
   - Full Sentry initialization with Vue integration
   - Router integration for performance tracking
   - Pinia plugin for state tracking

3. **Build Configuration** (`vite.config.ts`)
   - Sentry Vite plugin for source map upload
   - Source map generation enabled for production builds

4. **Environment Configuration**
   - Environment variables for DSN and configuration
   - Separate configs for development/production

## Installation

### Packages Installed

```bash
npm install @sentry/vue --save
npm install @sentry/vite-plugin --save-dev
```

### Dependencies
- `@sentry/vue`: Core Sentry SDK for Vue 3
- `@sentry/vite-plugin`: Vite plugin for source map upload

## Configuration

### Environment Variables

Create a `.env.local` file (not committed to git) with:

```env
VITE_SENTRY_DSN=https://your-dsn@sentry.io/project-id
VITE_SENTRY_TRACES_SAMPLE_RATE=1.0
VITE_SENTRY_REPLAY_SESSION_SAMPLE_RATE=0.1
VITE_SENTRY_REPLAY_ON_ERROR_SAMPLE_RATE=1.0

SENTRY_ORG=your-sentry-org
SENTRY_PROJECT=your-sentry-project
SENTRY_AUTH_TOKEN=your-sentry-auth-token
```

### Configuration Options

- **VITE_SENTRY_DSN**: Your Sentry project's Data Source Name
- **VITE_SENTRY_TRACES_SAMPLE_RATE**: Percentage of transactions to trace (0.0-1.0)
- **VITE_SENTRY_REPLAY_SESSION_SAMPLE_RATE**: Percentage of sessions to record (0.0-1.0)
- **VITE_SENTRY_REPLAY_ON_ERROR_SAMPLE_RATE**: Percentage of error sessions to record (0.0-1.0)
- **SENTRY_ORG**: Sentry organization slug (for source map upload)
- **SENTRY_PROJECT**: Sentry project name (for source map upload)
- **SENTRY_AUTH_TOKEN**: Auth token for source map upload

## Features Implemented

### 1. Error Tracking
- Automatic capture of unhandled errors
- Vue-specific error boundary integration
- Custom error context and tagging

### 2. Performance Monitoring
- Browser tracing integration
- Vue Router performance tracking
- Custom performance measurements

### 3. Session Replay
- Video-like replay of user sessions
- 10% of all sessions recorded
- 100% of error sessions recorded

### 4. Pinia State Tracking
- Automatic state snapshots on errors
- Action tracking for debugging

### 5. Source Maps
- Production source map upload via Vite plugin
- Readable stack traces in production errors

## Usage

### Basic Usage

Sentry is automatically initialized when the application starts. No additional code is required for basic error tracking.

### Manual Error Reporting

```typescript
import * as Sentry from '@sentry/vue'

try {
  // Your code
} catch (error) {
  Sentry.captureException(error)
}
```

### Adding Context

```typescript
import * as Sentry from '@sentry/vue'

Sentry.setContext('user_action', {
  action: 'clicked_button',
  component: 'NavigationBar'
})
```

### Setting User Information

```typescript
import * as Sentry from '@sentry/vue'

Sentry.setUser({
  id: '123',
  email: 'user@example.com',
  username: 'user123'
})
```

### Custom Tags

```typescript
import * as Sentry from '@sentry/vue'

Sentry.setTag('page_locale', 'en-US')
Sentry.setTag('feature_flag', 'new_ui')
```

## Development vs Production

### Development Mode
- Sentry is **disabled** in development (`enabled: import.meta.env.PROD`)
- Errors are logged to browser console only
- No data sent to Sentry

### Production Mode
- Sentry is **enabled** automatically
- Errors and performance data sent to Sentry
- Source maps uploaded for readable stack traces

## Testing

### Test Sentry Integration

Add a test button temporarily to trigger an error:

```vue
<template>
  <button @click="throwTestError">Test Sentry</button>
</template>

<script setup>
const throwTestError = () => {
  throw new Error('This is a test error for Sentry')
}
</script>
```

### Verify Source Maps

1. Build the application: `npm run build`
2. Check the console output for Sentry source map upload confirmation
3. Trigger an error in production
4. Verify in Sentry dashboard that stack traces show original source code

## CI/CD Integration

### GitHub Actions / GitLab CI

Add environment variables to your CI/CD pipeline:

```yaml
env:
  SENTRY_ORG: ${{ secrets.SENTRY_ORG }}
  SENTRY_PROJECT: ${{ secrets.SENTRY_PROJECT }}
  SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
```

### Cloudflare Pages / Vercel

Add environment variables in the deployment settings:
- `SENTRY_ORG`
- `SENTRY_PROJECT`
- `SENTRY_AUTH_TOKEN`

## Security Considerations

### Sensitive Data
- `.env.local` is in `.gitignore` (verify this)
- Never commit actual DSN or auth tokens
- Use environment-specific configurations

### PII (Personally Identifiable Information)
- Review data sent to Sentry
- Configure `beforeSend` hook if needed to scrub sensitive data
- Be cautious with user information and session replay

### Data Retention
- Configure data retention policies in Sentry dashboard
- Review and adjust sampling rates for cost management

## Troubleshooting

### Sentry Not Capturing Errors

1. Verify `VITE_SENTRY_DSN` is set correctly
2. Check that you're in production mode (`import.meta.env.PROD`)
3. Check browser console for Sentry initialization logs
4. Verify network requests to Sentry (check browser DevTools)

### Source Maps Not Working

1. Verify `build.sourcemap: true` in `vite.config.ts`
2. Check `SENTRY_AUTH_TOKEN` has correct permissions
3. Verify organization and project names are correct
4. Check build logs for source map upload confirmation

### High Volume of Events

1. Adjust `tracesSampleRate` (lower = fewer traces)
2. Adjust replay sample rates
3. Configure filters in Sentry dashboard
4. Use `beforeSend` hook to filter events

## Maintenance

### Updating Sentry SDK

```bash
npm update @sentry/vue @sentry/vite-plugin
```

### Monitoring Quota
- Review Sentry dashboard for quota usage
- Adjust sample rates if approaching limits
- Set up alerts for quota thresholds

## Resources

- [Sentry Vue Documentation](https://docs.sentry.io/platforms/javascript/guides/vue/)
- [Sentry Vite Plugin](https://docs.sentry.io/platforms/javascript/sourcemaps/uploading/vite/)
- [Performance Monitoring](https://docs.sentry.io/platforms/javascript/guides/vue/tracing/)
- [Session Replay](https://docs.sentry.io/platforms/javascript/session-replay/)

## Implementation Checklist

- [x] Install `@sentry/vue` package
- [x] Install `@sentry/vite-plugin` package
- [x] Create instrumentation file (`src/instrument.ts`)
- [x] Update main.ts with Sentry initialization
- [x] Add Sentry plugin to vite.config.ts
- [x] Enable source map generation in build config
- [x] Add environment variable types to env.d.ts
- [x] Create .env.example files with Sentry variables
- [x] Configure Pinia plugin for state tracking
- [x] Configure router integration for performance tracking
- [x] Document setup and usage

## Next Steps

1. **Create Sentry Project**: Create a new project in Sentry dashboard
2. **Get DSN**: Copy the DSN from Sentry project settings
3. **Create Auth Token**: Generate auth token for source map upload
4. **Configure CI/CD**: Add environment variables to deployment pipeline
5. **Test Integration**: Deploy to staging and verify error capture
6. **Set Up Alerts**: Configure alerts in Sentry for critical errors
7. **Review Dashboard**: Familiarize team with Sentry dashboard
8. **Adjust Sample Rates**: Fine-tune based on volume and quota
