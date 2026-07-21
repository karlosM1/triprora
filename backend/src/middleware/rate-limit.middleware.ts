import rateLimit, { ipKeyGenerator } from 'express-rate-limit'

const parseLimit = (value: string | undefined, fallback: number) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

/** Broad limiter applied to the whole API to blunt scraping / DoS. */
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: parseLimit(process.env.RATE_LIMIT_MAX, 600),
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many requests. Please try again later.' },
})

/**
 * Tight limiter for privileged / abuse-prone write endpoints
 * (role changes, bans, password resets, payout mutations).
 * Keyed by authenticated user when available, else by IP.
 */
export const sensitiveRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: parseLimit(process.env.SENSITIVE_RATE_LIMIT_MAX, 30),
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many attempts. Please slow down and try again.' },
  keyGenerator: (req) =>
    req.authUser?.id ?? ipKeyGenerator(req.ip ?? 'unknown'),
})
