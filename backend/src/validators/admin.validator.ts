import { z } from 'zod'

export const ADMIN_PAGE_SIZE = 10

const searchField = z
  .string()
  .trim()
  .max(100)
  .optional()
  .transform((value) => (value && value.length > 0 ? value : undefined))

export const adminListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .optional()
    .default(ADMIN_PAGE_SIZE),
  search: searchField,
})

export const adminTripsQuerySchema = adminListQuerySchema.extend({
  status: z
    .enum(['all', 'upcoming', 'ongoing', 'completed', 'cancelled', 'draft'])
    .optional()
    .default('all'),
})

export const adminUsersQuerySchema = adminListQuerySchema.extend({
  role: z
    .enum(['all', 'passenger', 'driver', 'admin', 'superadmin'])
    .optional()
    .default('all'),
  banned: z.enum(['all', 'active', 'banned']).optional().default('all'),
})

export const adminDriversQuerySchema = adminListQuerySchema.extend({
  banned: z.enum(['all', 'active', 'banned']).optional().default('all'),
  applicationStatus: z
    .enum(['all', 'pending', 'approved', 'rejected'])
    .optional()
    .default('all'),
})

export const adminBookingsQuerySchema = adminListQuerySchema.extend({
  status: z
    .enum(['all', 'confirmed', 'completed', 'cancelled'])
    .optional()
    .default('all'),
})

export const userIdParamSchema = z.object({
  id: z.string().uuid(),
})

export const updateUserRoleSchema = z.object({
  role: z.enum(['passenger', 'driver', 'admin', 'superadmin']),
})

export const banUserSchema = z.object({
  isBanned: z.boolean(),
  reason: z.string().trim().max(500).optional().nullable(),
})

export const setUserPasswordSchema = z.object({
  password: z.string().min(8).max(72),
})

export type AdminListQuery = z.infer<typeof adminListQuerySchema>
export type AdminTripsQuery = z.infer<typeof adminTripsQuerySchema>
export type AdminUsersQuery = z.infer<typeof adminUsersQuerySchema>
export type AdminDriversQuery = z.infer<typeof adminDriversQuerySchema>
export type AdminBookingsQuery = z.infer<typeof adminBookingsQuerySchema>
export type UpdateUserRoleBody = z.infer<typeof updateUserRoleSchema>
export type BanUserBody = z.infer<typeof banUserSchema>
export type SetUserPasswordBody = z.infer<typeof setUserPasswordSchema>
