import { logger } from './lib/logger.js'

export const isProduction = process.env.NODE_ENV === 'production'

export const port = Number(process.env.PORT) || 3001

/**
 * Comma-separated list of origins allowed to call the API from a browser.
 * e.g. CORS_ORIGINS="https://app.crabr.com,https://admin.crabr.com"
 */
export const allowedOrigins = (process.env.CORS_ORIGINS ?? '')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean)

const LOCALHOST_ORIGIN = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/

/**
 * Decide whether a browser Origin may call the API.
 * - Requests without an Origin header (server-to-server, curl, health checks) are allowed.
 * - Configured origins are always allowed.
 * - In non-production, localhost origins are allowed as a convenience.
 */
export function isOriginAllowed(origin: string | undefined): boolean {
  if (!origin) return true
  if (allowedOrigins.includes(origin)) return true
  if (!isProduction && LOCALHOST_ORIGIN.test(origin)) return true
  return false
}

if (isProduction && allowedOrigins.length === 0) {
  logger.warn(
    'CORS_ORIGINS is not set in production. All browser cross-origin requests will be blocked.',
  )
}
