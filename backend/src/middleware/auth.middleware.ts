import type { Role } from '@prisma/client'
import type { NextFunction, Request, Response } from 'express'
import { supabase } from '../lib/supabase.js'
import { ProfileModel } from '../models/profile.model.js'
import { AppError } from '../utils/app-error.js'

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

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token)

    if (error || !user?.email) {
      next(new AppError('Invalid or expired token', 401))
      return
    }

    const profile = await ProfileModel.ensureProfile(user.id, user.email)

    req.authUser = { id: user.id, email: user.email }
    req.profile = profile
    req.role = profile.role
    next()
  } catch (error) {
    next(error)
  }
}

export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.role || !roles.includes(req.role)) {
      next(new AppError('Insufficient permissions', 403))
      return
    }
    next()
  }
}
