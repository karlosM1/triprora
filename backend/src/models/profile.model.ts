import type { Role } from '@prisma/client'
import { Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma.js'

function resolveInitialRole(email: string): Role {
  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase()
  if (adminEmail && email.toLowerCase() === adminEmail) {
    return 'admin'
  }
  return 'passenger'
}

export const ProfileModel = {
  async findById(id: string) {
    return prisma.profile.findUnique({ where: { id } })
  },

  async ensureProfile(id: string, email: string) {
    const existingById = await prisma.profile.findUnique({ where: { id } })
    if (existingById) {
      return existingById
    }

    // A profile with this email but a different id means the previous auth user
    // was deleted and re-created (same email, new UUID). Treat it as a brand-new
    // account: drop the stale profile (its driver application cascades away) so
    // the recreated user does not inherit the old role.
    const existingByEmail = await prisma.profile.findUnique({ where: { email } })
    if (existingByEmail) {
      await prisma.profile.delete({ where: { id: existingByEmail.id } })
    }

    try {
      return await prisma.profile.create({
        data: {
          id,
          email,
          role: resolveInitialRole(email),
        },
      })
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const conflicting = await prisma.profile.findUnique({ where: { email } })
        if (conflicting && conflicting.id !== id) {
          await prisma.profile.delete({ where: { id: conflicting.id } })
          return await prisma.profile.create({
            data: {
              id,
              email,
              role: resolveInitialRole(email),
            },
          })
        }
        if (conflicting) {
          return conflicting
        }
      }

      throw error
    }
  },

  async updateRole(id: string, role: Role) {
    return prisma.profile.update({
      where: { id },
      data: { role },
    })
  },
}
