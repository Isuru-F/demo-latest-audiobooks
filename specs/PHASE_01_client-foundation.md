# Phase 1: Client Foundation - Sentry Implementation

## Phase Overview

**Goal**: Establish basic Sentry error tracking in the Vue 3.5/TypeScript client application.

**Scope**: 
- Install and configure Sentry for Vue 3.5
- Replace console.error with Sentry capture in existing error handling
- Maintain current error UI patterns
- Filter development environment noise

**Deliverables**:
- Sentry initialized in Vue app
- Client-side errors captured and visible in Sentry dashboard
- Existing error handling patterns preserved
- Development environment optimized

## Prerequisites

- Sentry account created with project configured
- VITE_SENTRY_DSN environment variable obtained
- Current error handling patterns documented

## System State

### Current State
- **Error Handling**: console.error in try/catch blocks throughout client
- **Error UI**: Local error state in Vue stores (errorMessage reactive refs)
- **Development**: HMR errors and development noise in console
- **Monitoring**: No centralized error tracking

### Target State After Phase 1
- **Error Capture**: All client-side errors sent to Sentry
- **Error UI**: Existing error messages and UI patterns maintained
- **Development**: Clean development experience with filtered noise
- **Monitoring**: Real-time visibility into client-side issues

## Implementation Plan

### Step 1: Dependencies Installation
**Time Estimate**: 15 minutes

```bash
cd client
npm install @sentry/vue @sentry/vite-plugin
```

**Validation**: Package.json contains new dependencies

### Step 2: Environment Configuration
**Time Estimate**: 10 minutes

**Create**: `client/.env.example`
```bash
# Sentry Configuration
VITE_SENTRY_DSN=https://your-dsn@sentry.io/project-id
VITE_API_URL=http://localhost:3000
```

**Update**: Local `.env` file with actual DSN
**Validation**: Environment variables accessible in Vite

### Step 3: Basic Sentry Integration
**Time Estimate**: 30 minutes

**Location**: `client/src/main.ts`

```typescript
import { createApp } from 'vue'
import * as Sentry from '@sentry/vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)

// Only initialize Sentry if DSN is provided
if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    app,
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    
    // Basic integration - no performance monitoring yet
    integrations: [
      Sentry.browserTracingIntegration({ router }),
    ],
    
    // Conservative sampling for Phase 1
    tracesSampleRate: import.meta.env.MODE === 'production' ? 0.1 : 1.0,
    
    beforeSend(event) {
      // Filter development noise
      if (import.meta.env.MODE === 'development') {
        const error = event.exception?.values?.[0]?.value || ''
        if (error.includes('HMR') || 
            error.includes('hot reload') ||
            error.includes('[vite]')) {
          return null
        }
      }
      return event
    }
  })
}

app.use(router)
app.mount('#app')
```

**Validation**: Sentry dashboard shows "First Event" received

### Step 4: Store Error Handling Enhancement
**Time Estimate**: 45 minutes

**Location**: `client/src/stores/spotify.ts`

**Current Pattern Analysis**: Review existing error handling
**Enhancement**: Add Sentry capture while maintaining existing patterns

```typescript
import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as Sentry from '@sentry/vue'
import api from '@/services/api'

export const useSpotifyStore = defineStore('spotify', () => {
  const audiobooks = ref([])
  const isLoading = ref(false)
  const errorMessage = ref('')

  const fetchNewReleases = async (market = 'US') => {
    try {
      isLoading.value = true
      errorMessage.value = '' // Clear previous errors
      
      const response = await api.get(`/api/spotify/new-releases?country=${market}`)
      audiobooks.value = response.data.albums?.items || []
      
    } catch (err) {
      const error = err as Error
      
      // Capture to Sentry with context (only if initialized)
      if (import.meta.env.VITE_SENTRY_DSN) {
        Sentry.captureException(error, {
          tags: {
            store: 'spotify',
            action: 'fetchNewReleases',
            market
          },
          extra: {
            audiobooksCount: audiobooks.value.length,
            timestamp: new Date().toISOString()
          }
        })
      }
      
      // Maintain existing error UI pattern
      errorMessage.value = 'Failed to fetch new releases'
      console.error('Error fetching new releases:', error)
      
    } finally {
      isLoading.value = false
    }
  }

  const searchAudiobooks = async (query: string, market = 'US') => {
    try {
      isLoading.value = true
      errorMessage.value = ''
      
      const response = await api.get(`/api/spotify/search`, {
        params: { q: query, type: 'audiobook', market }
      })
      audiobooks.value = response.data.audiobooks?.items || []
      
    } catch (err) {
      const error = err as Error
      
      // Capture to Sentry with search context
      if (import.meta.env.VITE_SENTRY_DSN) {
        Sentry.captureException(error, {
          tags: {
            store: 'spotify',
            action: 'searchAudiobooks',
            market
          },
          extra: {
            query,
            audiobooksCount: audiobooks.value.length,
            timestamp: new Date().toISOString()
          }
        })
      }
      
      // Maintain existing error UI pattern
      errorMessage.value = 'Failed to search audiobooks'
      console.error('Error searching audiobooks:', error)
      
    } finally {
      isLoading.value = false
    }
  }

  return {
    audiobooks,
    isLoading,
    errorMessage,
    fetchNewReleases,
    searchAudiobooks
  }
})
```

**Validation**: Store errors appear in Sentry with proper context

### Step 5: API Service Error Handling
**Time Estimate**: 30 minutes

**Location**: `client/src/services/api.ts`

**Enhancement**: Add basic Sentry capture to axios interceptors

```typescript
import axios from 'axios'
import * as Sentry from '@sentry/vue'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
})

// Response interceptor for error capture
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Capture API errors to Sentry (only if initialized)
    if (import.meta.env.VITE_SENTRY_DSN) {
      Sentry.captureException(error, {
        tags: {
          section: 'api',
          method: error.config?.method,
          url: error.config?.url
        },
        extra: {
          status: error.response?.status,
          statusText: error.response?.statusText,
          responseData: error.response?.data
        }
      })
    }
    
    return Promise.reject(error)
  }
)

export default api
```

**Validation**: API errors captured with proper HTTP context

## Testing Strategy

### Manual Testing Checklist
- [ ] Trigger a network error and verify it appears in Sentry
- [ ] Test Spotify store error scenarios (invalid market, API down)
- [ ] Verify existing error UI still displays correctly
- [ ] Confirm development HMR errors are filtered out
- [ ] Test in both development and production builds

### Error Scenarios to Test
1. **Network Failure**: Disconnect internet, trigger API call
2. **Invalid API Response**: Mock server error response
3. **Store Error**: Trigger error in fetchNewReleases
4. **Component Error**: Throw error in Vue component
5. **Development Noise**: Verify HMR errors don't reach Sentry

### Success Validation
- [ ] At least 3 different error types captured in Sentry dashboard
- [ ] Error messages still display correctly in UI
- [ ] Development experience remains clean
- [ ] No performance regression in client app

## Rollback Plan

### Phase 1 Rollback Steps
1. **Environment Variable**: Remove VITE_SENTRY_DSN to disable Sentry
2. **Code Rollback**: Revert main.ts, stores, and api.ts changes
3. **Dependencies**: Remove Sentry packages if needed
4. **Validation**: Confirm app works with original console.error pattern

### Quick Disable Option
Environment variable removal provides immediate disable without code changes.

## Success Criteria

### Functional Requirements
- [ ] Client-side errors captured in Sentry dashboard
- [ ] Existing error UI patterns maintained
- [ ] Development environment remains clean
- [ ] Error context includes component, action, and relevant data

### Non-Functional Requirements
- [ ] No noticeable performance impact on client app
- [ ] Bundle size increase <50KB
- [ ] Development HMR errors filtered out
- [ ] Error capture rate >90% for legitimate errors

### Business Value Delivered
- [ ] Real-time visibility into client-side issues
- [ ] Structured error data with context
- [ ] Foundation for advanced error tracking
- [ ] Improved debugging capabilities

## Next Phase Preparation

### Prerequisites for Phase 2
- [ ] Phase 1 success criteria met
- [ ] Sentry dashboard access confirmed
- [ ] Server-side Sentry account/project configured
- [ ] Team comfortable with basic Sentry workflow

### Handoff Documentation
- Document any client-specific error patterns discovered
- Note any performance considerations for server implementation
- Record Sentry configuration decisions for consistency

---

**Phase Duration**: 1 week  
**Effort Estimate**: 8-10 hours  
**Risk Level**: Low  
**Dependencies**: Sentry account setup  
**Success Metric**: >90% client error capture rate
