import * as Sentry from '@sentry/vue'

export const captureError = (error: Error, context?: Record<string, unknown>) => {
  Sentry.captureException(error, {
    extra: context,
  })
}

export const captureMessage = (message: string, level: Sentry.SeverityLevel = 'info') => {
  Sentry.captureMessage(message, level)
}

export const setUserContext = (user: { id: string; email?: string; username?: string }) => {
  Sentry.setUser(user)
}

export const clearUserContext = () => {
  Sentry.setUser(null)
}

export const addBreadcrumb = (breadcrumb: {
  message: string
  category?: string
  level?: Sentry.SeverityLevel
  data?: Record<string, unknown>
}) => {
  Sentry.addBreadcrumb(breadcrumb)
}
