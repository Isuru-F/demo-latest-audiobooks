import * as Sentry from '@sentry/vue'

export function logError(error: Error, context?: Record<string, any>) {
  Sentry.captureException(error, {
    extra: context,
  })
}

export function logMessage(message: string, level: Sentry.SeverityLevel = 'info') {
  Sentry.captureMessage(message, level)
}

export function setUserContext(user: { id: string; email?: string; username?: string }) {
  Sentry.setUser(user)
}

export function clearUserContext() {
  Sentry.setUser(null)
}

export function addBreadcrumb(message: string, category: string, data?: Record<string, any>) {
  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level: 'info',
  })
}

export function testSentryIntegration() {
  try {
    throw new Error('This is a test error to verify Sentry integration')
  } catch (error) {
    logError(error as Error, { test: true, timestamp: new Date().toISOString() })
  }
}
