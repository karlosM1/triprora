import type { Profile } from '@prisma/client'
import type { NextFunction, Request, Response } from 'express'
import { supabase } from '../lib/supabase.js'
import { ProfileModel } from '../models/profile.model.js'
import type { AppRole } from '../types/role.js'
import { AppError } from '../utils/app-error.js'

export type { AppRole } from '../types/role.js'

type CachedAuth = {
  authUser: { id: string; email: string }
  profile: Profile
  role: AppRole
  expiresAt: number
}

// Short-lived cache to avoid a Supabase Auth network round-trip + several DB
// queries on every authenticated request. Set AUTH_CACHE_TTL_MS=0 to disable.
const AUTH_CACHE_TTL_MS = Number(process.env.AUTH_CACHE_TTL_MS ?? 30_000)
const AUTH_CACHE_MAX_ENTRIES = 5_000

const authCache = new Map<string, CachedAuth>()
const tokensByUser = new Map<string, Set<string>>()

function readCache(token: string): CachedAuth | null {
  const entry = authCache.get(token)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    dropToken(token, entry.authUser.id)
    return null
  }
  return entry
}

function dropToken(token: string, userId: string) {
  authCache.delete(token)
  const set = tokensByUser.get(userId)
  if (set) {
    set.delete(token)
    if (set.size === 0) tokensByUser.delete(userId)
  }
}

function writeCache(token: string, entry: CachedAuth) {
  if (AUTH_CACHE_TTL_MS <= 0) return

  if (authCache.size >= AUTH_CACHE_MAX_ENTRIES) {
    const oldest = authCache.keys().next().value
    if (oldest) {
      const stale = authCache.get(oldest)
      if (stale) dropToken(oldest, stale.authUser.id)
    }
  }

  authCache.set(token, entry)
  const set = tokensByUser.get(entry.authUser.id) ?? new Set<string>()
  set.add(token)
  tokensByUser.set(entry.authUser.id, set)
}

/**
 * Immediately evict cached auth for a user. Call after privileged mutations
 * (ban, role change, password reset, deletion) so they take effect at once
 * instead of waiting for the cache TTL to expire.
 */
export function invalidateAuthForUser(userId: string) {
  const tokens = tokensByUser.get(userId)
  if (!tokens) return
  for (const token of tokens) authCache.delete(token)
  tokensByUser.delete(userId)
}

export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    next(new AppError('Authentication required', 401))
    return
  }

  const token = header.slice('Bearer '.length)

  const cached = readCache(token)
  if (cached) {
    req.authUser = cached.authUser
    req.profile = cached.profile
    req.role = cached.role
    next()
    return
  }

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token)

    if (error || !user?.email) {
      next(new AppError('Invalid or expired token', 401))
      return
    }

    const profile = await ProfileModel.resolveForAuth(user.id, user.email, {
      authCreatedAt: user.created_at,
    })

    if (profile.isBanned) {
      next(
        new AppError(
          profile.bannedReason
            ? `Your account has been banned: ${profile.bannedReason}`
            : 'Your account has been banned',
          403,
        ),
      )
      return
    }

    const authUser = { id: user.id, email: user.email }
    req.authUser = authUser
    req.profile = profile
    req.role = profile.role

    writeCache(token, {
      authUser,
      profile,
      role: profile.role,
      expiresAt: Date.now() + AUTH_CACHE_TTL_MS,
    })

    next()
  } catch (error) {
    next(error)
  }
}

export function requireRole(...roles: AppRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.role || !roles.includes(req.role)) {
      next(new AppError('Insufficient permissions', 403))
      return
    }
    next()
  }
}
