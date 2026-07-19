import type { Profile, Role } from '@prisma/client'
import { Prisma } from '@prisma/client'
import { getSupabaseAdmin } from '../lib/supabase-admin.js'
import { prisma } from '../lib/prisma.js'
import { AppError } from '../utils/app-error.js'
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

async function applyBootstrapRole(
  profile: Profile,
  authEmail?: string,
): Promise<Profile> {
  const bootstrapRole = resolveInitialRole(authEmail ?? profile.email)
  if (
    bootstrapRole !== 'passenger' &&
    profile.role !== bootstrapRole &&
    profile.role !== 'superadmin'
  ) {
    if (
      bootstrapRole === 'superadmin' ||
      (bootstrapRole === 'admin' && profile.role === 'passenger')
    ) {
      return prisma.profile.update({
        where: { id: profile.id },
        data: { role: bootstrapRole },
      })
    }
  }
  return profile
}

async function revokeAccount(
  authUserId: string,
  email: string,
  reason: string,
) {
  const normalizedEmail = email.toLowerCase()
  await prisma.revokedAccount.upsert({
    where: { authUserId },
    create: {
      authUserId,
      email: normalizedEmail,
      reason,
    },
    update: {
      email: normalizedEmail,
      reason,
      revokedAt: new Date(),
    },
  })
}

async function destroyAuthUser(authUserId: string) {
  const admin = getSupabaseAdmin()

  // Ban first so existing JWTs stop working even if delete is delayed.
  const { error: banError } = await admin.auth.admin.updateUserById(authUserId, {
    ban_duration: '876600h',
  })
  if (banError && !/not found|user not found/i.test(banError.message)) {
    console.error('Failed to ban auth user:', banError.message)
  }

  const { error: deleteError } = await admin.auth.admin.deleteUser(authUserId)
  if (deleteError && !/not found|user not found/i.test(deleteError.message)) {
    console.error('Failed to delete auth user:', deleteError.message)
  }
}

export const ProfileModel = {
  async findById(id: string) {
    return prisma.profile.findUnique({ where: { id } })
  },

  async deleteById(id: string) {
    const existing = await prisma.profile.findUnique({ where: { id } })
    if (!existing) return

    await revokeAccount(id, existing.email, 'profile_deleted')

    await prisma.$transaction(async (tx) => {
      await tx.booking.updateMany({
        where: {
          van: { driverId: id },
          status: { in: ['pending', 'confirmed'] },
        },
        data: { status: 'cancelled' },
      })

      await tx.profile.delete({ where: { id } })
    })

    try {
      await destroyAuthUser(id)
    } catch (error) {
      console.error('Failed to destroy auth user after profile delete:', error)
    }
  },

  /**
   * Resolve the profile for an authenticated Auth user.
   * Missing profiles are treated as revoked accounts — never recreated.
   */
  async resolveForAuth(
    id: string,
    email: string,
    options?: { authCreatedAt?: string },
  ) {
    const normalizedEmail = email.toLowerCase()

    const revoked = await prisma.revokedAccount.findUnique({
      where: { authUserId: id },
    })
    if (revoked) {
      try {
        await destroyAuthUser(id)
      } catch (error) {
        console.error('Failed to destroy revoked auth user:', error)
      }
      throw new AppError(
        'Account no longer exists. Your profile was removed; contact support if this is unexpected.',
        401,
      )
    }

    const existingById = await prisma.profile.findUnique({ where: { id } })
    if (existingById) {
      // Old ensureProfile() recreated empty shells after a manual profile delete.
      // Auth user is old; profile row is new and blank → treat as revoked.
      const authCreatedMs = options?.authCreatedAt
        ? new Date(options.authCreatedAt).getTime()
        : NaN
      const profileCreatedMs = existingById.createdAt.getTime()
      const recreatedEmptyShell =
        Number.isFinite(authCreatedMs) &&
        profileCreatedMs - authCreatedMs > 60_000 &&
        existingById.role === 'passenger' &&
        !existingById.fullName &&
        !existingById.phone

      if (recreatedEmptyShell) {
        const hasDriverApp = await prisma.driverApplication.findUnique({
          where: { profileId: id },
          select: { id: true },
        })
        if (!hasDriverApp) {
          await revokeAccount(id, normalizedEmail, 'recreated_empty_profile')
          await prisma.profile.delete({ where: { id } }).catch(() => undefined)
          try {
            await destroyAuthUser(id)
          } catch (error) {
            console.error('Failed to destroy recreated empty auth user:', error)
          }
          throw new AppError(
            'Account no longer exists. Your profile was removed; contact support if this is unexpected.',
            401,
          )
        }
      }

      return applyBootstrapRole(existingById, email)
    }

    // Profile row was deleted outside deleteById (e.g. manual SQL).
    await revokeAccount(id, normalizedEmail, 'missing_profile_on_login')
    try {
      await destroyAuthUser(id)
    } catch (error) {
      console.error('Failed to delete orphaned auth user:', error)
    }

    throw new AppError(
      'Account no longer exists. Your profile was removed; contact support if this is unexpected.',
      401,
    )
  },

  /**
   * Create a profile for a brand-new Auth user (signup / OAuth).
   * Blocked only when this specific Auth user id was revoked (not by email —
   * the same email may register again as a new account).
   */
  async provisionNewProfile(id: string, email: string, fullName?: string | null) {
    const normalizedEmail = email.toLowerCase()

    const revoked = await prisma.revokedAccount.findUnique({
      where: { authUserId: id },
    })
    if (revoked) {
      try {
        await destroyAuthUser(id)
      } catch {
        // ignore
      }
      throw new AppError(
        'Account no longer exists. Contact support if you need access restored.',
        403,
      )
    }

    const existingById = await prisma.profile.findUnique({ where: { id } })
    if (existingById) {
      return applyBootstrapRole(existingById)
    }

    const existingByEmail = await prisma.profile.findUnique({
      where: { email: normalizedEmail },
    })
    if (existingByEmail) {
      await ProfileModel.deleteById(existingByEmail.id)
    }

    try {
      return await prisma.profile.create({
        data: {
          id,
          email: normalizedEmail,
          fullName: fullName?.trim() || null,
          role: resolveInitialRole(normalizedEmail),
        },
      })
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const conflicting = await prisma.profile.findUnique({
          where: { email: normalizedEmail },
        })
        if (conflicting && conflicting.id !== id) {
          await ProfileModel.deleteById(conflicting.id)
          return await prisma.profile.create({
            data: {
              id,
              email: normalizedEmail,
              fullName: fullName?.trim() || null,
              role: resolveInitialRole(normalizedEmail),
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
