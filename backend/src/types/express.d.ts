import type { Profile, Role } from '@prisma/client'

declare global {
  namespace Express {
    interface Request {
      authUser?: {
        id: string
        email: string
      }
      profile?: Profile
      role?: Role
    }
  }
}

export {}
