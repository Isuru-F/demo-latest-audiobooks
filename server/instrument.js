const * as Sentry from '@sentry/node';
const { nodeProfilingIntegration } = require('@sentry/profiling-node');

// Initialize Sentry before importing any other modules
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.SENTRY_ENVIRONMENT || 'development',
  debug: process.env.SENTRY_DEBUG === 'true',
  
  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Profiling
  profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.05 : 1.0,
  
  integrations: [
    // Enable profiling
    nodeProfilingIntegration(),
    
    // HTTP integration for request tracking
    Sentry.httpIntegration({
      tracing: true,
    }),
    
    // Express integration
    Sentry.expressIntegration({
      shouldCreateSpanForRequest: (url) => {
        // Don't create spans for health checks
        return !url.includes('/health');
      },
    }),
  ],

  // Error filtering
  beforeSend(event, hint) {
    // Filter out common non-critical errors
    if (hint.originalException) {
      const error = hint.originalException;
      
      // Skip CORS errors
      if (error.message && error.message.includes('CORS')) {
        return null;
      }
      
      // Skip connection errors
      if (error.code === 'ECONNRESET' || error.code === 'ECONNREFUSED') {
        return null;
      }
    }
    
    return event;
  },

  // Data scrubbing for sensitive information
  beforeSendTransaction(event) {
    // Remove sensitive headers
    if (event.request?.headers) {
      delete event.request.headers.authorization;
      delete event.request.headers.cookie;
      delete event.request.headers['x-api-key'];
    }
    
    return event;
  },

  // Release tracking
  release: process.env.SENTRY_RELEASE,
});

// Export Sentry for use in other modules
module.exports = Sentry;
