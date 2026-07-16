import type { Role } from '@prisma/client'
import { Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma.js'
import type { UpdateProfileBody } from '../validators/me.validator.js'

type UpdateProfileData = UpdateProfileBody

function resolveInitialRole(email: string): Role {
  const normalized = email.toLowerCase()
  const superadminEmail = process.env.SUPERADMIN_EMAIL?.toLowerCase()
  if (superadminEmail && normalized === superadminEmail) {
    return 'superadmin'
  }
  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase()
  if (adminEmail && normalized === adminEmail) {
    return 'admin'
  }
  return 'passenger'
}

export const ProfileModel = {
  async findById(id: string) {
    return prisma.profile.findUnique({ where: { id } })
  },

  async deleteById(id: string) {
    return prisma.$transaction(async (tx) => {
      await tx.booking.updateMany({
        where: {
          van: { driverId: id },
          status: 'confirmed',
        },
        data: { status: 'cancelled' },
      })

      await tx.profile.delete({ where: { id } })
    })
  },

  async ensureProfile(id: string, email: string) {
    const existingById = await prisma.profile.findUnique({ where: { id } })
    if (existingById) {
      const bootstrapRole = resolveInitialRole(email)
      if (
        bootstrapRole !== 'passenger' &&
        existingById.role !== bootstrapRole &&
        existingById.role !== 'superadmin'
      ) {
        // Promote env-bootstrap emails without demoting an existing superadmin.
        if (
          bootstrapRole === 'superadmin' ||
          (bootstrapRole === 'admin' && existingById.role === 'passenger')
        ) {
          return prisma.profile.update({
            where: { id },
            data: { role: bootstrapRole },
          })
        }
      }
      return existingById
    }

    // A profile with this email but a different id means the previous auth user
    // was deleted and re-created (same email, new UUID). Treat it as a brand-new
    // account: drop the stale profile (driver application and trips cascade away)
    // so the recreated user does not inherit the old role or published trips.
    const existingByEmail = await prisma.profile.findUnique({ where: { email } })
    if (existingByEmail) {
      await ProfileModel.deleteById(existingByEmail.id)
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
          await ProfileModel.deleteById(conflicting.id)
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

  async setBanned(
    id: string,
    isBanned: boolean,
    bannedReason?: string | null,
  ) {
    return prisma.profile.update({
      where: { id },
      data: {
        isBanned,
        bannedAt: isBanned ? new Date() : null,
        bannedReason: isBanned ? (bannedReason ?? null) : null,
      },
    })
  },

  async update(id: string, data: UpdateProfileData) {
    return prisma.profile.update({
      where: { id },
      data,
    })
  },
}
