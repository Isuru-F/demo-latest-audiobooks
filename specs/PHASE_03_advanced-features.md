# Phase 3: Advanced Features - Sentry Implementation

## Phase Overview

**Goal**: Implement advanced Sentry features including performance monitoring, session replay, custom dashboards, and enhanced error context.

**Scope**:
- Enable comprehensive performance monitoring for both client and server
- Configure session replay for debugging user interactions
- Set up custom dashboards and alerting
- Implement advanced error context and user tracking
- Optimize error grouping and noise reduction

**Deliverables**:
- Performance monitoring dashboards showing API response times and frontend metrics
- Session replay capturing user interactions leading to errors
- Custom Sentry dashboards tailored to application needs
- Enhanced error context with user journeys and business metrics
- Alert configurations for critical error patterns

## Prerequisites

- Phase 1 (Client Foundation) and Phase 2 (Server Integration) completed successfully
- Sentry Professional/Team plan (required for session replay)
- Performance baseline metrics from Phase 2
- User flow and critical path documentation

## System State

### Current State After Phase 2
- **Error Capture**: Basic error tracking on client and server
- **Context**: Request context and basic business context
- **Monitoring**: Error counts and basic error details
- **Debugging**: Stack traces with source maps

### Target State After Phase 3
- **Performance**: Full application performance monitoring with Web Vitals
- **User Experience**: Session replay for visual debugging
- **Proactive Monitoring**: Custom alerts for performance degradation
- **Business Intelligence**: Error correlation with user actions and business metrics
- **Team Efficiency**: Custom dashboards for different team roles

## Implementation Plan

### Step 1: Client Performance Monitoring
**Time Estimate**: 45 minutes

**Location**: `client/src/main.ts`

**Enhancement**: Add comprehensive performance monitoring

```typescript
import { createApp } from 'vue'
import * as Sentry from '@sentry/vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)

if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    app,
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    
    integrations: [
      // Enhanced browser tracing with more detailed metrics
      Sentry.browserTracingIntegration({ 
        router,
        // Track component loading and navigation
        routingInstrumentation: Sentry.vueRouterInstrumentation(router),
        // Enable interaction tracking
        enableInteractionAutoInstrumentation: true,
      }),
      
      // Session replay for visual debugging
      Sentry.replayIntegration({
        // Capture 10% of all sessions
        maskAllText: false,
        maskAllInputs: true,
        blockAllMedia: false,
        
        // More detailed replay settings
        blockClass: 'sentry-block',
        maskClass: 'sentry-mask',
        
        // Network request recording
        networkDetailAllowUrls: [
          window.location.origin,
          /\/api\/spotify/
        ],
      }),
      
      // Browser performance metrics
      Sentry.metrics.metricsAggregatorIntegration(),
    ],
    
    // Performance monitoring configuration
    tracesSampleRate: import.meta.env.MODE === 'production' ? 0.3 : 1.0,
    
    // Session replay sampling
    replaysSessionSampleRate: 0.1, // 10% of sessions
    replaysOnErrorSampleRate: 1.0, // 100% of error sessions
    
    // Enhanced performance settings
    _experiments: {
      // Enable performance API usage
      enableInteractions: true,
      // Track long tasks
      enableLongTask: true,
    },
    
    beforeSend(event) {
      // Enhanced filtering
      if (import.meta.env.MODE === 'development') {
        const error = event.exception?.values?.[0]?.value || ''
        if (error.includes('HMR') || 
            error.includes('hot reload') ||
            error.includes('[vite]') ||
            error.includes('ResizeObserver loop limit exceeded')) {
          return null
        }
      }
      
      // Add application state context
      if (event.contexts) {
        event.contexts.app = {
          route: router.currentRoute.value.path,
          query: router.currentRoute.value.query,
          userAgent: navigator.userAgent,
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight
          }
        }
      }
      
      return event
    },
    
    beforeSendTransaction(event) {
      // Filter out very fast transactions that aren't meaningful
      if (event.start_timestamp && event.timestamp) {
        const duration = event.timestamp - event.start_timestamp
        if (duration < 0.01) { // Less than 10ms
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

**Validation**: Performance tab in Sentry shows Web Vitals and route performance

### Step 2: Enhanced API Performance Tracking
**Time Estimate**: 30 minutes

**Location**: `client/src/services/api.ts`

**Enhancement**: Add detailed API performance monitoring

```typescript
import axios from 'axios'
import * as Sentry from '@sentry/vue'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
})

// Request interceptor - enhanced with performance tracking
api.interceptors.request.use((config) => {
  // Start performance measurement
  const startTime = performance.now()
  
  // Create transaction for API call
  const transaction = Sentry.startTransaction({
    name: `${config.method?.toUpperCase()} ${config.url}`,
    op: 'http.client',
    data: {
      method: config.method,
      url: config.url,
      params: config.params
    }
  })
  
  // Store metadata for response interceptor
  config.metadata = { 
    transaction,
    startTime,
    method: config.method,
    url: config.url
  }
  
  // Add trace context for server correlation
  const traceId = Sentry.getCurrentHub().getScope()?.getTransaction()?.traceId
  if (traceId) {
    config.headers['X-Trace-ID'] = traceId
  }
  
  return config
})

// Response interceptor - enhanced error capture and performance tracking
api.interceptors.response.use(
  (response) => {
    const { transaction, startTime, method, url } = response.config.metadata || {}
    
    if (transaction && startTime) {
      // Calculate and record response time
      const duration = performance.now() - startTime
      
      // Add success metrics
      Sentry.setTag('api.success', 'true')
      Sentry.setExtra('api.responseTime', duration)
      Sentry.setExtra('api.responseSize', JSON.stringify(response.data).length)
      
      // Record custom metric
      Sentry.metrics.gauge('api.response_time', duration, {
        tags: {
          method: method?.toUpperCase(),
          endpoint: url,
          status: response.status.toString()
        }
      })
      
      transaction.setStatus('ok')
      transaction.finish()
    }
    
    return response
  },
  (error) => {
    const { transaction, startTime, method, url } = error.config?.metadata || {}
    
    if (import.meta.env.VITE_SENTRY_DSN) {
      // Enhanced error context
      Sentry.captureException(error, {
        tags: {
          section: 'api',
          method: error.config?.method,
          url: error.config?.url,
          status: error.response?.status?.toString()
        },
        extra: {
          status: error.response?.status,
          statusText: error.response?.statusText,
          responseData: error.response?.data,
          requestData: error.config?.data,
          duration: startTime ? performance.now() - startTime : null
        },
        contexts: {
          api: {
            method: error.config?.method,
            url: error.config?.url,
            baseURL: error.config?.baseURL,
            timeout: error.config?.timeout
          }
        }
      })
      
      // Record error metrics
      if (startTime) {
        const duration = performance.now() - startTime
        Sentry.metrics.gauge('api.error_response_time', duration, {
          tags: {
            method: method?.toUpperCase(),
            endpoint: url,
            status: error.response?.status?.toString() || 'network_error'
          }
        })
      }
    }
    
    if (transaction) {
      transaction.setStatus('internal_error')
      transaction.finish()
    }
    
    return Promise.reject(error)
  }
)

export default api
```

**Validation**: API performance metrics visible in Sentry dashboard

### Step 3: Enhanced Store Monitoring
**Time Estimate**: 30 minutes

**Location**: `client/src/stores/spotify.ts`

**Enhancement**: Add business metrics and user journey tracking

```typescript
import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as Sentry from '@sentry/vue'
import api from '@/services/api'

export const useSpotifyStore = defineStore('spotify', () => {
  const audiobooks = ref([])
  const isLoading = ref(false)
  const errorMessage = ref('')
  const lastFetchTime = ref(null)

  const fetchNewReleases = async (market = 'US') => {
    const operationStart = performance.now()
    
    // Create transaction for business operation
    const transaction = Sentry.startTransaction({
      name: 'Spotify: Fetch New Releases',
      op: 'business.operation',
      data: { market }
    })

    try {
      isLoading.value = true
      errorMessage.value = ''
      
      // Add breadcrumb for user journey
      Sentry.addBreadcrumb({
        message: `User fetching new releases for ${market}`,
        category: 'user.action',
        level: 'info',
        data: { 
          market,
          previousCount: audiobooks.value.length,
          timeSinceLastFetch: lastFetchTime.value ? 
            Date.now() - lastFetchTime.value : null
        }
      })
      
      const response = await api.get(`/api/spotify/new-releases?country=${market}`)
      const newAudiobooks = response.data.albums?.items || []
      audiobooks.value = newAudiobooks
      lastFetchTime.value = Date.now()
      
      // Record success metrics
      const operationDuration = performance.now() - operationStart
      
      Sentry.setTag('business.operation', 'fetch_releases')
      Sentry.setTag('business.success', 'true')
      Sentry.setExtra('business.results_count', newAudiobooks.length)
      Sentry.setExtra('business.operation_duration', operationDuration)
      Sentry.setExtra('business.market', market)
      
      // Custom business metric
      Sentry.metrics.gauge('business.audiobooks_fetched', newAudiobooks.length, {
        tags: { market }
      })
      
      Sentry.metrics.gauge('business.fetch_duration', operationDuration, {
        tags: { market, success: 'true' }
      })
      
      transaction.setStatus('ok')
      
    } catch (err) {
      const error = err as Error
      const operationDuration = performance.now() - operationStart
      
      if (import.meta.env.VITE_SENTRY_DSN) {
        Sentry.captureException(error, {
          tags: {
            store: 'spotify',
            action: 'fetchNewReleases',
            market,
            business_impact: 'high'
          },
          extra: {
            audiobooksCount: audiobooks.value.length,
            operationDuration,
            market,
            timeSinceLastFetch: lastFetchTime.value ? 
              Date.now() - lastFetchTime.value : null,
            timestamp: new Date().toISOString()
          },
          contexts: {
            business: {
              operation: 'fetch_new_releases',
              market,
              expectedResults: 20,
              previousSuccessfulFetch: lastFetchTime.value
            }
          }
        })
        
        // Business error metric
        Sentry.metrics.gauge('business.fetch_duration', operationDuration, {
          tags: { market, success: 'false' }
        })
      }
      
      errorMessage.value = 'Failed to fetch new releases'
      console.error('Error fetching new releases:', error)
      transaction.setStatus('internal_error')
      
    } finally {
      isLoading.value = false
      transaction.finish()
    }
  }

  // Enhanced search with user behavior tracking
  const searchAudiobooks = async (query: string, market = 'US') => {
    const operationStart = performance.now()
    
    const transaction = Sentry.startTransaction({
      name: 'Spotify: Search Audiobooks',
      op: 'business.operation',
      data: { query, market }
    })

    try {
      isLoading.value = true
      errorMessage.value = ''
      
      // Track search behavior
      Sentry.addBreadcrumb({
        message: `User searching: "${query}" in ${market}`,
        category: 'user.search',
        level: 'info',
        data: { 
          query,
          queryLength: query.length,
          market,
          previousResultsCount: audiobooks.value.length
        }
      })
      
      const response = await api.get(`/api/spotify/search`, {
        params: { q: query, type: 'audiobook', market }
      })
      
      const searchResults = response.data.audiobooks?.items || []
      audiobooks.value = searchResults
      
      const operationDuration = performance.now() - operationStart
      
      // Search success metrics
      Sentry.setTag('business.operation', 'search')
      Sentry.setTag('business.success', 'true')
      Sentry.setExtra('business.search_query', query)
      Sentry.setExtra('business.search_results', searchResults.length)
      Sentry.setExtra('business.operation_duration', operationDuration)
      
      // Search analytics
      Sentry.metrics.gauge('business.search_results', searchResults.length, {
        tags: { 
          market,
          query_length: Math.floor(query.length / 5) * 5 // Bucket by query length
        }
      })
      
      transaction.setStatus('ok')
      
    } catch (err) {
      const error = err as Error
      const operationDuration = performance.now() - operationStart
      
      if (import.meta.env.VITE_SENTRY_DSN) {
        Sentry.captureException(error, {
          tags: {
            store: 'spotify',
            action: 'searchAudiobooks',
            market,
            business_impact: 'medium'
          },
          extra: {
            query,
            queryLength: query.length,
            operationDuration,
            market,
            previousResultsCount: audiobooks.value.length
          },
          contexts: {
            business: {
              operation: 'search_audiobooks',
              query,
              market,
              userIntent: 'discovery'
            }
          }
        })
      }
      
      errorMessage.value = 'Failed to search audiobooks'
      console.error('Error searching audiobooks:', error)
      transaction.setStatus('internal_error')
      
    } finally {
      isLoading.value = false
      transaction.finish()
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

**Validation**: Business metrics and user journey data appear in Sentry

### Step 4: Server Performance Monitoring Enhancement
**Time Estimate**: 40 minutes

**Location**: `server/src/services/spotify.service.js`

**Enhancement**: Add comprehensive performance and business monitoring

```javascript
const Sentry = require('@sentry/node');

class SpotifyService {
  constructor() {
    this.spotifyApi = new SpotifyApi({
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET
    });
    
    // Track service initialization
    Sentry.addBreadcrumb({
      message: 'SpotifyService initialized',
      category: 'service',
      level: 'info'
    });
  }

  async getNewReleases(country = 'US', limit = 20) {
    const operationStart = Date.now();
    
    // Enhanced transaction with business context
    const transaction = Sentry.startTransaction({
      op: "business.spotify_api",
      name: "Get New Releases",
      data: { country, limit }
    });

    // Set business context
    Sentry.setTag("business.operation", "fetch_releases");
    Sentry.setTag("business.market", country);
    Sentry.setContext("business", {
      operation: "get_new_releases",
      market: country,
      requestedLimit: limit,
      expectedResultType: "audiobooks"
    });

    try {
      // Detailed operation tracking
      Sentry.addBreadcrumb({
        message: `Fetching new releases for ${country} (limit: ${limit})`,
        category: "spotify.operation",
        level: "info",
        data: { country, limit, operationId: transaction.traceId }
      });

      // API authentication span
      const authSpan = transaction.startChild({
        op: "spotify.auth",
        description: "Spotify API Authentication"
      });

      // Ensure we have a valid token
      await this.ensureValidToken();
      authSpan.finish();

      // API call span with detailed monitoring
      const apiSpan = transaction.startChild({
        op: "http.client",
        description: "Spotify API - Browse New Releases",
        data: {
          method: "GET",
          endpoint: "/browse/new-releases",
          country,
          limit
        }
      });

      const apiCallStart = Date.now();
      const response = await this.spotifyApi.getBrowseNewReleases({
        country,
        limit
      });
      const apiCallDuration = Date.now() - apiCallStart;

      apiSpan.setData("response.items_count", response.body.albums?.items?.length || 0);
      apiSpan.setData("response.duration_ms", apiCallDuration);
      apiSpan.finish();

      // Business metrics
      const resultCount = response.body.albums?.items?.length || 0;
      const operationDuration = Date.now() - operationStart;

      // Success tracking
      Sentry.setTag("spotify.success", "true");
      Sentry.setTag("spotify.result_quality", resultCount > 10 ? "good" : "limited");
      
      Sentry.setExtra("spotify.results", resultCount);
      Sentry.setExtra("spotify.api_duration", apiCallDuration);
      Sentry.setExtra("spotify.total_duration", operationDuration);
      Sentry.setExtra("spotify.results_per_second", resultCount / (operationDuration / 1000));

      // Performance monitoring
      if (apiCallDuration > 5000) { // Slow API call
        Sentry.captureMessage(`Slow Spotify API call: ${apiCallDuration}ms`, 'warning');
      }

      // Success breadcrumb
      Sentry.addBreadcrumb({
        message: `Successfully fetched ${resultCount} new releases in ${operationDuration}ms`,
        category: "spotify.success",
        level: "info",
        data: { 
          resultCount, 
          duration: operationDuration,
          apiDuration: apiCallDuration,
          efficiency: resultCount / (operationDuration / 1000)
        }
      });

      transaction.setStatus("ok");
      transaction.setData("business.results", resultCount);
      transaction.setData("performance.total_duration", operationDuration);

      return response.body;
      
    } catch (error) {
      const operationDuration = Date.now() - operationStart;
      
      // Enhanced error context
      transaction.setStatus("internal_error");
      transaction.setData("error.duration", operationDuration);
      
      const errorContext = {
        tags: {
          service: "spotify",
          operation: "getNewReleases",
          market: country,
          business_impact: this.assessBusinessImpact(error),
          error_category: this.categorizeError(error)
        },
        extra: {
          limit,
          operationDuration,
          errorCode: error.statusCode,
          errorMessage: error.message,
          retryable: this.isRetryableError(error),
          timestamp: new Date().toISOString()
        },
        contexts: {
          spotify: {
            operation: "getNewReleases",
            parameters: { country, limit },
            apiVersion: "v1",
            authenticationStatus: "authenticated"
          },
          performance: {
            operationDuration,
            expectedDuration: 2000, // Expected < 2s
            performanceImpact: operationDuration > 5000 ? "high" : "normal"
          }
        }
      };

      Sentry.captureException(error, errorContext);
      
      // Error breadcrumb with business context
      Sentry.addBreadcrumb({
        message: `Spotify API error: ${error.message} (${operationDuration}ms)`,
        category: "spotify.error",
        level: "error",
        data: {
          statusCode: error.statusCode,
          country,
          limit,
          duration: operationDuration,
          retryable: this.isRetryableError(error)
        }
      });

      console.error('Spotify API error:', error);
      throw error;
      
    } finally {
      transaction.finish();
    }
  }

  // Helper methods for enhanced error analysis
  assessBusinessImpact(error) {
    if (error.statusCode === 429) return "high"; // Rate limiting affects all users
    if (error.statusCode >= 500) return "high"; // Server errors are high impact
    if (error.statusCode === 401) return "medium"; // Auth issues
    return "low";
  }

  categorizeError(error) {
    if (error.statusCode === 429) return "rate_limit";
    if (error.statusCode === 401) return "authentication";
    if (error.statusCode >= 500) return "server_error";
    if (error.statusCode >= 400) return "client_error";
    if (error.code === 'ECONNREFUSED') return "network";
    return "unknown";
  }

  isRetryableError(error) {
    return error.statusCode === 429 || 
           error.statusCode >= 500 || 
           error.code === 'ECONNREFUSED';
  }

  async ensureValidToken() {
    // Implementation for token validation/refresh
    // Add Sentry tracking for authentication flow
  }
}

module.exports = SpotifyService;
```

**Validation**: Server performance metrics and business context in Sentry

### Step 5: Custom Dashboards and Alerts
**Time Estimate**: 60 minutes

**Create Custom Dashboards via Sentry UI**:

1. **Application Health Dashboard**
   - Error rate trends (client vs server)
   - API response time percentiles
   - Business operation success rates
   - Session replay conversion rate

2. **Performance Dashboard**
   - Web Vitals (LCP, FID, CLS)
   - API endpoint performance
   - Spotify API dependency health
   - User experience metrics

3. **Business Intelligence Dashboard**
   - Search success rates
   - Popular markets and queries
   - User journey completion rates
   - Feature adoption metrics

**Alert Configuration**:
```javascript
// Example alert conditions (configured in Sentry UI):
// 1. Error rate > 5% for 5 minutes
// 2. API response time > 95th percentile threshold
// 3. Spotify API error rate > 10%
// 4. Business operation failure rate > 2%
```

### Step 6: Session Replay Enhancement
**Time Estimate**: 30 minutes

**Location**: Create `client/src/utils/sentry-helpers.ts`

**Purpose**: Enhanced session context and replay tagging

```typescript
import * as Sentry from '@sentry/vue'

export class SentryHelpers {
  
  static setUserContext(user: { id?: string, email?: string, market?: string }) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      market: user.market
    });
  }

  static tagUserAction(action: string, context: Record<string, any> = {}) {
    Sentry.addBreadcrumb({
      message: `User action: ${action}`,
      category: 'user.interaction',
      level: 'info',
      data: {
        action,
        ...context,
        timestamp: new Date().toISOString(),
        url: window.location.href
      }
    });
  }

  static startUserFlow(flowName: string, startContext: Record<string, any> = {}) {
    const transaction = Sentry.startTransaction({
      name: `User Flow: ${flowName}`,
      op: 'user.flow',
      data: startContext
    });

    // Store transaction for later completion
    Sentry.getCurrentHub().configureScope(scope => {
      scope.setTag('user.flow', flowName);
      scope.setContext('flow.start', {
        name: flowName,
        startTime: Date.now(),
        ...startContext
      });
    });

    return transaction;
  }

  static completeUserFlow(transaction: any, success: boolean, endContext: Record<string, any> = {}) {
    transaction.setStatus(success ? 'ok' : 'internal_error');
    transaction.setData('flow.success', success);
    transaction.setData('flow.end_context', endContext);
    transaction.finish();

    Sentry.addBreadcrumb({
      message: `User flow completed: ${success ? 'success' : 'failure'}`,
      category: 'user.flow',
      level: success ? 'info' : 'warning',
      data: endContext
    });
  }

  static captureBusinessEvent(eventName: string, eventData: Record<string, any>) {
    Sentry.addBreadcrumb({
      message: `Business event: ${eventName}`,
      category: 'business.event',
      level: 'info',
      data: {
        event: eventName,
        ...eventData,
        timestamp: new Date().toISOString()
      }
    });

    // Send as custom event for analytics
    Sentry.captureMessage(`Business Event: ${eventName}`, {
      level: 'info',
      tags: {
        event_type: 'business',
        event_name: eventName
      },
      extra: eventData
    });
  }
}
```

**Usage in Components**:
```vue
<script setup lang="ts">
import { SentryHelpers } from '@/utils/sentry-helpers'

const handleSearch = async (query: string) => {
  SentryHelpers.tagUserAction('search_initiated', { query, queryLength: query.length });
  
  const flowTransaction = SentryHelpers.startUserFlow('audiobook_search', { 
    query, 
    source: 'search_bar' 
  });

  try {
    await spotifyStore.searchAudiobooks(query);
    SentryHelpers.completeUserFlow(flowTransaction, true, { 
      resultsFound: spotifyStore.audiobooks.length 
    });
    SentryHelpers.captureBusinessEvent('search_completed', {
      query,
      resultsCount: spotifyStore.audiobooks.length,
      successful: true
    });
  } catch (error) {
    SentryHelpers.completeUserFlow(flowTransaction, false, { error: error.message });
  }
};
</script>
```

## Testing Strategy

### Performance Testing
- [ ] Measure performance impact of session replay
- [ ] Validate Web Vitals collection accuracy
- [ ] Test dashboard update frequency
- [ ] Verify custom metrics calculation

### Session Replay Testing
- [ ] Test replay capture for error scenarios
- [ ] Verify privacy masking works correctly
- [ ] Test replay playback functionality
- [ ] Validate network request recording

### Alert Testing
- [ ] Trigger alert conditions in staging
- [ ] Verify alert delivery and escalation
- [ ] Test alert resolution workflows
- [ ] Validate alert fatigue prevention

### Business Metrics Validation
- [ ] Compare Sentry metrics with application logs
- [ ] Validate business event accuracy
- [ ] Test custom dashboard calculations
- [ ] Verify user journey tracking

## Success Criteria

### Functional Requirements
- [ ] Session replay captures user interactions leading to errors
- [ ] Performance monitoring shows Web Vitals and API metrics
- [ ] Custom dashboards display relevant business and technical metrics
- [ ] Alerts fire for configured thresholds
- [ ] User journey tracking provides actionable insights

### Performance Requirements
- [ ] Session replay overhead <5% on client performance
- [ ] Performance monitoring adds <20ms to transaction time
- [ ] Custom metrics don't impact application responsiveness
- [ ] Dashboard updates within 1 minute of events

### Business Value Delivered
- [ ] Reduced time to reproduce user-reported issues by 80%
- [ ] Proactive identification of performance regressions
- [ ] Business intelligence insights from user behavior data
- [ ] Improved user experience through performance optimization

## Rollback Plan

### Phase 3 Rollback Steps
1. **Disable Session Replay**: Set `replaysSessionSampleRate: 0`
2. **Reduce Performance Monitoring**: Decrease `tracesSampleRate`
3. **Disable Custom Metrics**: Comment out `Sentry.metrics` calls
4. **Revert Dashboard Changes**: Use default Sentry dashboards
5. **Alert Suspension**: Temporarily disable custom alerts

### Gradual Rollback Options
- Feature flags for individual advanced features
- Sampling rate adjustments for immediate impact reduction
- Dashboard visibility controls

## Next Phase Preparation

### Prerequisites for Phase 4
- [ ] Phase 3 success criteria validated
- [ ] Performance baselines established
- [ ] Alert thresholds fine-tuned
- [ ] Team trained on advanced features

### Production Readiness Items
- Session replay privacy review completed
- Performance impact assessed and acceptable
- Alert escalation procedures documented
- Business metrics validated with stakeholders

---

**Phase Duration**: 2 weeks  
**Effort Estimate**: 15-20 hours  
**Risk Level**: Medium-High  
**Dependencies**: Sentry Professional plan, Phase 1 & 2 completion  
**Success Metric**: Complete user experience visibility with <5% performance impact
