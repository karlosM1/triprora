import type { Profile } from '@prisma/client'
import type { AppRole } from './role.js'

declare global {
  namespace Express {
    interface Request {
      authUser?: {
        id: string
        email: string
      }
      profile?: Profile
      role?: AppRole
    }
  }
}

export {}
