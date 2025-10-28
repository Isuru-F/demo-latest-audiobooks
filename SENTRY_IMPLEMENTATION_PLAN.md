# Implementation Plan: Sentry Logging for Client-Side

## Overview
Implement Sentry error and performance monitoring on the client-side of the demo-latest-audiobooks project.

## Technology Stack
- Sentry SDK: `@sentry/vue` (latest version)
- Vite Plugin: `@sentry/vite-plugin` for source map uploading
- Framework: Vue 3.5 with TypeScript
- State Management: Pinia
- Build Tool: Vite

## Implementation Steps

### 1. Install Dependencies
```bash
cd client
npm install @sentry/vue --save
npm install @sentry/vite-plugin --save-dev
```

### 2. Create Sentry Configuration File
- Create `client/src/sentry.ts` with Sentry initialization logic
- Configure integrations:
  - Browser Tracing (performance monitoring)
  - Replay (session replay for debugging)
  - Pinia Plugin (state management tracking)
- Use environment variable for DSN: `VITE_SENTRY_DSN`

### 3. Update Main Application Entry Point
- Import Sentry configuration in `main.ts` before app initialization
- Initialize Sentry with app and router instances
- Add Pinia plugin for state tracking

### 4. Configure Vite for Source Maps
- Update `vite.config.ts` to:
  - Enable source map generation in build
  - Add Sentry Vite plugin for automatic source map upload
- Use environment variables:
  - `SENTRY_AUTH_TOKEN` (for source map upload)
  - `SENTRY_ORG` (Sentry organization slug)
  - `SENTRY_PROJECT` (Sentry project name)

### 5. Environment Configuration
- Create `.env.example` with template for required variables:
  ```
  VITE_SENTRY_DSN=
  SENTRY_AUTH_TOKEN=
  SENTRY_ORG=
  SENTRY_PROJECT=
  ```
- Update `.gitignore` to exclude `.env` if not already present

### 6. Configuration Options
- **Sample Rates:**
  - `tracesSampleRate: 0.1` (10% of transactions for performance)
  - `replaysSessionSampleRate: 0.1` (10% of sessions)
  - `replaysOnErrorSampleRate: 1.0` (100% of error sessions)
- **Trace Propagation:**
  - Include localhost for development
  - Include production API endpoints

### 7. Testing
- Verify Sentry is initialized correctly
- Test error capture by throwing test error
- Verify source maps are uploaded in production build
- Check Pinia state is captured in error context

## Files to Create/Modify

### New Files:
1. `client/src/sentry.ts` - Sentry initialization
2. `client/.env.example` - Environment variable template

### Modified Files:
1. `client/src/main.ts` - Add Sentry import and initialization
2. `client/vite.config.ts` - Add Sentry plugin and source map config
3. `client/package.json` - Add dependencies (via npm install)

## Security Considerations
- DSN is public and safe to expose in client-side code
- Auth token must be kept secret (environment variable only)
- Never commit `.env` file to repository
- Use different Sentry projects for dev/staging/production

## Production Checklist
- [ ] Adjust sample rates for production traffic volume
- [ ] Configure release tracking for deployment versioning
- [ ] Set up alerts in Sentry dashboard
- [ ] Configure user feedback integration (optional)
- [ ] Test source map upload in CI/CD pipeline
