# Phase 2: Server Integration - Sentry Implementation

## Phase Overview

**Goal**: Integrate Sentry error tracking and request context into the Node.js/Express server application.

**Scope**:
- Install and configure Sentry for Node.js/Express
- Replace console.error with Sentry capture in server-side error handling
- Add request context and user tracking
- Establish error correlation between client and server

**Deliverables**:
- Sentry middleware integrated in Express app
- Server-side errors captured with request context
- Enhanced service layer error handling
- Error correlation capability established

## Prerequisites

- Phase 1 (Client Foundation) completed successfully
- Server-side Sentry DSN obtained (can reuse client DSN)
- Current server error handling patterns documented
- Express middleware stack understood

## System State

### Current State
- **Error Handling**: Basic Express error middleware with console.error
- **Context**: Limited request context in error logs
- **Services**: Try/catch blocks in Spotify service with console.error
- **Monitoring**: No centralized server error tracking

### Target State After Phase 2
- **Error Capture**: All server-side errors and exceptions sent to Sentry
- **Context**: Rich request context (method, URL, headers, user agent)
- **Correlation**: Ability to link client errors with server errors
- **Services**: Enhanced error capture in service layer with business context

## Implementation Plan

### Step 1: Dependencies Installation
**Time Estimate**: 10 minutes

```bash
cd server
npm install @sentry/node @sentry/profiling-node
```

**Validation**: Package.json contains new dependencies

### Step 2: Environment Configuration
**Time Estimate**: 10 minutes

**Create**: `server/.env.example`
```bash
# Sentry Configuration
SENTRY_DSN=https://your-dsn@sentry.io/project-id
SENTRY_ENVIRONMENT=development
NODE_ENV=development

# Optional
SENTRY_RELEASE=1.0.0
```

**Update**: Local `.env` file with actual values
**Validation**: Environment variables accessible in Node.js

### Step 3: Sentry Instrumentation Setup
**Time Estimate**: 20 minutes

**Create**: `server/instrument.js` (new file)

```javascript
const Sentry = require("@sentry/node");
const { nodeProfilingIntegration } = require("@sentry/profiling-node");

// Initialize Sentry BEFORE any other modules
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
  
  // Disable in development for Phase 2 testing
  enabled: process.env.NODE_ENV !== 'development',
  
  // Basic performance monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  profilesSampleRate: 1.0,
  
  integrations: [
    nodeProfilingIntegration()
  ],
  
  beforeSend(event) {
    // Remove sensitive data from requests
    if (event.request?.headers) {
      // Remove authorization headers
      delete event.request.headers.authorization
      delete event.request.headers.cookie
      delete event.request.headers['x-api-key']
    }
    
    // Filter out common dev/test noise
    if (process.env.NODE_ENV === 'development') {
      const errorMessage = event.exception?.values?.[0]?.value || ''
      if (errorMessage.includes('ECONNREFUSED') && 
          errorMessage.includes('localhost')) {
        return null // Skip local connection errors in dev
      }
    }
    
    return event
  }
});

module.exports = Sentry;
```

**Validation**: Instrument file created and exports Sentry

### Step 4: Express App Integration
**Time Estimate**: 30 minutes

**Location**: `server/index.js`

**Current State Analysis**: Review existing middleware and error handling
**Enhancement**: Add Sentry middleware and error handler

```javascript
// Import instrument FIRST - before any other modules
require('./instrument');

const express = require('express');
const Sentry = require('@sentry/node');
const cors = require('cors');
const spotifyRoutes = require('./src/routes/spotify');

const app = express();
const PORT = process.env.PORT || 3000;

// Standard middleware
app.use(cors());
app.use(express.json());

// Sentry request context middleware
app.use((req, res, next) => {
  // Set request tags for categorization
  Sentry.setTag("route", req.path);
  Sentry.setTag("method", req.method);
  
  // Set request context for debugging
  Sentry.setContext("request", {
    method: req.method,
    url: req.url,
    userAgent: req.get("User-Agent"),
    ip: req.ip,
    query: req.query,
    params: req.params
  });
  
  // Add breadcrumb for request tracking
  Sentry.addBreadcrumb({
    message: `${req.method} ${req.path}`,
    category: "http",
    level: "info",
    data: {
      query: req.query,
      userAgent: req.get("User-Agent")
    }
  });
  
  next();
});

// Routes
app.use('/api/spotify', spotifyRoutes);

// Health check endpoint for monitoring
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Sentry error handler - MUST be after routes but BEFORE other error handlers
Sentry.setupExpressErrorHandler(app);

// Custom error handler - maintains existing behavior
app.use((error, req, res, next) => {
  // Log locally for development
  console.error('Error:', error);
  
  // Determine error status
  const status = error.status || error.statusCode || 500;
  
  // Response varies by environment
  const errorResponse = {
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error.message,
    timestamp: new Date().toISOString()
  };
  
  // Add request ID for debugging if available
  if (req.id) {
    errorResponse.requestId = req.id;
  }
  
  res.status(status).json(errorResponse);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Sentry enabled: ${!!process.env.SENTRY_DSN}`);
});
```

**Validation**: Server starts successfully, middleware executes in order

### Step 5: Service Layer Enhancement
**Time Estimate**: 45 minutes

**Location**: `server/src/services/spotify.service.js`

**Current Pattern Analysis**: Review existing error handling in services
**Enhancement**: Add Sentry capture with business context

```javascript
const Sentry = require('@sentry/node');

class SpotifyService {
  constructor() {
    // Initialize Spotify API client
    this.spotifyApi = new SpotifyApi({
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET
    });
  }

  async getNewReleases(country = 'US', limit = 20) {
    // Create transaction for performance tracking
    const transaction = Sentry.startTransaction({
      op: "spotify.api",
      name: "Get New Releases",
      data: { country, limit }
    });

    try {
      // Add breadcrumb for operation tracking
      Sentry.addBreadcrumb({
        message: `Fetching new releases for ${country}`,
        category: "spotify",
        level: "info",
        data: { country, limit }
      });

      // Set user context if available (for future user tracking)
      Sentry.setTag("spotify.operation", "getNewReleases");
      Sentry.setTag("spotify.market", country);

      // Perform API call with span tracking
      const span = transaction.startChild({
        op: "http.client",
        description: "Spotify API - Browse New Releases"
      });

      const response = await this.spotifyApi.getBrowseNewReleases({
        country,
        limit
      });

      span.finish();

      // Track success metrics
      const resultCount = response.body.albums?.items?.length || 0;
      Sentry.setTag("spotify.success", "true");
      Sentry.setExtra("spotify.results", resultCount);
      
      // Add success breadcrumb
      Sentry.addBreadcrumb({
        message: `Successfully fetched ${resultCount} new releases`,
        category: "spotify",
        level: "info",
        data: { resultCount }
      });

      return response.body;
      
    } catch (error) {
      // Set transaction status
      transaction.setStatus("internal_error");
      
      // Capture exception with rich context
      Sentry.captureException(error, {
        tags: {
          service: "spotify",
          operation: "getNewReleases",
          market: country
        },
        extra: {
          limit,
          errorCode: error.statusCode,
          errorMessage: error.message,
          timestamp: new Date().toISOString()
        },
        contexts: {
          spotify: {
            operation: "getNewReleases",
            parameters: { country, limit },
            apiVersion: "v1"
          }
        }
      });
      
      // Add error breadcrumb
      Sentry.addBreadcrumb({
        message: `Spotify API error: ${error.message}`,
        category: "spotify",
        level: "error",
        data: {
          statusCode: error.statusCode,
          country,
          limit
        }
      });

      // Log locally for development
      console.error('Spotify API error:', error);
      
      // Re-throw for Express error handler
      throw error;
      
    } finally {
      transaction.finish();
    }
  }

  async searchAudiobooks(query, market = 'US', limit = 20) {
    const transaction = Sentry.startTransaction({
      op: "spotify.api",
      name: "Search Audiobooks",
      data: { query, market, limit }
    });

    try {
      Sentry.addBreadcrumb({
        message: `Searching audiobooks: "${query}" in ${market}`,
        category: "spotify",
        level: "info",
        data: { query, market, limit }
      });

      Sentry.setTag("spotify.operation", "searchAudiobooks");
      Sentry.setTag("spotify.market", market);
      
      const span = transaction.startChild({
        op: "http.client",
        description: "Spotify API - Search"
      });

      const response = await this.spotifyApi.search(query, ['audiobook'], {
        market,
        limit
      });

      span.finish();

      const resultCount = response.body.audiobooks?.items?.length || 0;
      Sentry.setTag("spotify.success", "true");
      Sentry.setExtra("spotify.results", resultCount);
      
      return response.body;
      
    } catch (error) {
      transaction.setStatus("internal_error");
      
      Sentry.captureException(error, {
        tags: {
          service: "spotify",
          operation: "searchAudiobooks",
          market
        },
        extra: {
          query,
          limit,
          errorCode: error.statusCode,
          errorMessage: error.message
        },
        contexts: {
          spotify: {
            operation: "searchAudiobooks",
            parameters: { query, market, limit },
            apiVersion: "v1"
          }
        }
      });

      console.error('Spotify search error:', error);
      throw error;
      
    } finally {
      transaction.finish();
    }
  }
}

module.exports = SpotifyService;
```

**Validation**: Service errors captured with business context

### Step 6: Route Error Handling Enhancement
**Time Estimate**: 20 minutes

**Location**: `server/src/routes/spotify.js`

**Enhancement**: Add route-level error context

```javascript
const express = require('express');
const Sentry = require('@sentry/node');
const SpotifyService = require('../services/spotify.service');

const router = express.Router();
const spotifyService = new SpotifyService();

// Middleware for route-specific context
router.use((req, res, next) => {
  Sentry.setTag("api.module", "spotify");
  next();
});

router.get('/new-releases', async (req, res, next) => {
  try {
    const { country = 'US', limit = 20 } = req.query;
    
    // Add route-specific context
    Sentry.setContext("route", {
      endpoint: "/new-releases",
      parameters: { country, limit }
    });
    
    const data = await spotifyService.getNewReleases(country, parseInt(limit));
    
    res.json(data);
    
  } catch (error) {
    // Pass to Express error handler (which will use Sentry)
    next(error);
  }
});

router.get('/search', async (req, res, next) => {
  try {
    const { q: query, market = 'US', limit = 20 } = req.query;
    
    if (!query) {
      const error = new Error('Search query is required');
      error.status = 400;
      throw error;
    }
    
    Sentry.setContext("route", {
      endpoint: "/search",
      parameters: { query, market, limit }
    });
    
    const data = await spotifyService.searchAudiobooks(query, market, parseInt(limit));
    
    res.json(data);
    
  } catch (error) {
    next(error);
  }
});

module.exports = router;
```

**Validation**: Route-level errors include endpoint context

## Testing Strategy

### Manual Testing Checklist
- [ ] Trigger server startup and verify Sentry connection
- [ ] Test API endpoint errors (invalid parameters, network issues)
- [ ] Verify request context appears in Sentry events
- [ ] Test service layer errors with business context
- [ ] Confirm error correlation between client and server

### Error Scenarios to Test
1. **Invalid API Parameters**: Send malformed requests to endpoints
2. **Spotify API Failures**: Mock Spotify API errors
3. **Service Errors**: Trigger service-level exceptions
4. **Middleware Errors**: Test Express middleware error handling
5. **Network Issues**: Test connection failures

### Performance Testing
- [ ] Measure middleware overhead with/without Sentry
- [ ] Verify <10ms impact per request
- [ ] Test memory usage over time
- [ ] Monitor transaction volume

### Success Validation
- [ ] Server errors appear in Sentry dashboard with full context
- [ ] Request context includes method, URL, query parameters
- [ ] Service errors include business context and operation details
- [ ] Error correlation possible between client and server events

## Error Correlation Setup

### Trace ID Implementation
**Purpose**: Link client-side errors with server-side errors for same request

**Client Enhancement** (add to Phase 1):
```typescript
// In api.ts interceptor
api.interceptors.request.use((config) => {
  // Add trace header for correlation
  const traceId = Sentry.getCurrentHub().getScope()?.getTransaction()?.traceId;
  if (traceId) {
    config.headers['X-Trace-ID'] = traceId;
  }
  return config;
});
```

**Server Enhancement** (add to context middleware):
```javascript
app.use((req, res, next) => {
  // Extract trace ID from client request
  const traceId = req.headers['x-trace-id'];
  if (traceId) {
    Sentry.setTag("trace.id", traceId);
    Sentry.setExtra("client.traceId", traceId);
  }
  next();
});
```

## Rollback Plan

### Phase 2 Rollback Steps
1. **Environment Variable**: Remove SENTRY_DSN to disable Sentry
2. **Code Rollback**: Revert index.js and service changes
3. **File Cleanup**: Remove instrument.js file
4. **Dependencies**: Remove Sentry packages if needed
5. **Validation**: Confirm server works with original error handling

### Gradual Rollback Option
Environment variable removal provides immediate disable while preserving code changes.

## Success Criteria

### Functional Requirements
- [ ] Server-side errors captured in Sentry dashboard
- [ ] Request context includes method, URL, headers, query params
- [ ] Service layer errors include business context
- [ ] Express error handler integration maintains existing API responses
- [ ] Error correlation capability established

### Non-Functional Requirements
- [ ] <10ms middleware overhead per request
- [ ] No memory leaks during extended operation
- [ ] Sensitive data (auth headers, cookies) filtered from events
- [ ] Error capture rate >95% for server-side issues

### Business Value Delivered
- [ ] Full-stack error visibility
- [ ] Rich debugging context for server issues
- [ ] Improved mean time to resolution (MTTR)
- [ ] Proactive server-side issue identification

## Next Phase Preparation

### Prerequisites for Phase 3
- [ ] Phase 2 success criteria met
- [ ] Performance monitoring baseline established
- [ ] Error correlation working between client and server
- [ ] Team comfortable with server-side Sentry workflow

### Advanced Features Ready
- Performance monitoring foundations established
- Request context patterns proven
- Service layer instrumentation patterns documented
- Ready for session replay and advanced monitoring

---

**Phase Duration**: 1 week  
**Effort Estimate**: 10-12 hours  
**Risk Level**: Medium  
**Dependencies**: Phase 1 completion, Sentry account access  
**Success Metric**: >95% server error capture rate with full context
