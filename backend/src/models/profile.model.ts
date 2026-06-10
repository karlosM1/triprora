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

    const existingByEmail = await prisma.profile.findUnique({ where: { email } })
    if (existingByEmail) {
      return existingByEmail
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
        const profile = await prisma.profile.findUnique({ where: { email } })
        if (profile) {
          return profile
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
