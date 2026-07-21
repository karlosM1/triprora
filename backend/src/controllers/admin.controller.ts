import type { Request, Response } from 'express'
import { getSupabaseAdmin } from '../lib/supabase-admin.js'
import { invalidateAuthForUser } from '../middleware/auth.middleware.js'
import { AdminModel } from '../models/admin.model.js'
import { AuditLogModel } from '../models/audit-log.model.js'
import { DriverApplicationModel } from '../models/driver-application.model.js'
import { ProfileModel } from '../models/profile.model.js'
import { AppError } from '../utils/app-error.js'
import type {
  AdminBookingsQuery,
  AdminDriversQuery,
  AdminTripsQuery,
  AdminUsersQuery,
  BanUserBody,
  SetUserPasswordBody,
  UpdateUserRoleBody,
} from '../validators/admin.validator.js'

function assertCanMutateUser(actorId: string, target: { id: string; role: string }) {
  if (target.id === actorId) {
    throw new AppError('You cannot modify your own account this way', 400)
  }
  if (target.role === 'superadmin') {
    throw new AppError('Cannot modify another superadmin', 403)
  }
}

export async function getAdminStats(_req: Request, res: Response) {
  const stats = await AdminModel.getStats()
  res.json(stats)
}

export async function listAdminTrips(req: Request, res: Response) {
  const query = req.query as unknown as AdminTripsQuery
  const trips = await AdminModel.listTrips(query)
  res.json(trips)
}

export async function listAdminBookings(req: Request, res: Response) {
  const query = req.query as unknown as AdminBookingsQuery
  const bookings = await AdminModel.listBookings(query)
  res.json(bookings)
}

export async function listAdminUsers(req: Request, res: Response) {
  const query = req.query as unknown as AdminUsersQuery
  const users = await AdminModel.listUsers(query)
  res.json(users)
}

export async function listAdminDrivers(req: Request, res: Response) {
  const query = req.query as unknown as AdminDriversQuery
  const drivers = await AdminModel.listDrivers(query)
  res.json(drivers)
}

export async function updateAdminUserRole(req: Request, res: Response) {
  const body = req.body as UpdateUserRoleBody
  const target = await AdminModel.findUserById(req.params.id)

  if (!target) {
    throw new AppError('User not found', 404)
  }

  assertCanMutateUser(req.profile!.id, target)

  if (body.role === 'superadmin' && req.role !== 'superadmin') {
    throw new AppError('Only a superadmin can assign the superadmin role', 403)
  }

  const updated = await ProfileModel.updateRole(target.id, body.role)

  invalidateAuthForUser(target.id)
  await AuditLogModel.record({
    actorProfileId: req.profile!.id,
    action: 'user_role_changed',
    entityType: 'Profile',
    entityId: target.id,
    before: { role: target.role },
    after: { role: updated.role },
    ip: req.ip ?? null,
  })

  res.json({
    id: updated.id,
    role: updated.role,
  })
}

export async function banAdminUser(req: Request, res: Response) {
  const body = req.body as BanUserBody
  const target = await AdminModel.findUserById(req.params.id)

  if (!target) {
    throw new AppError('User not found', 404)
  }

  assertCanMutateUser(req.profile!.id, target)

  const updated = await ProfileModel.setBanned(
    target.id,
    body.isBanned,
    body.reason,
  )

  invalidateAuthForUser(target.id)
  await AuditLogModel.record({
    actorProfileId: req.profile!.id,
    action: body.isBanned ? 'user_banned' : 'user_unbanned',
    entityType: 'Profile',
    entityId: target.id,
    before: { isBanned: target.isBanned },
    after: { isBanned: updated.isBanned, bannedReason: updated.bannedReason },
    ip: req.ip ?? null,
  })

  res.json({
    id: updated.id,
    isBanned: updated.isBanned,
    bannedAt: updated.bannedAt,
    bannedReason: updated.bannedReason,
  })
}

export async function setAdminUserPassword(req: Request, res: Response) {
  const body = req.body as SetUserPasswordBody
  const target = await AdminModel.findUserById(req.params.id)

  if (!target) {
    throw new AppError('User not found', 404)
  }

  assertCanMutateUser(req.profile!.id, target)

  const { error } = await getSupabaseAdmin().auth.admin.updateUserById(
    target.id,
    { password: body.password },
  )

  if (error) {
    throw new AppError(error.message || 'Failed to update password', 400)
  }

  invalidateAuthForUser(target.id)
  await AuditLogModel.record({
    actorProfileId: req.profile!.id,
    action: 'user_password_reset',
    entityType: 'Profile',
    entityId: target.id,
    // Never store the password itself.
    metadata: { via: 'superadmin' },
    ip: req.ip ?? null,
  })

  res.json({ id: target.id, updated: true })
}

export async function listPendingDriverApplications(_req: Request, res: Response) {
  const applications = await DriverApplicationModel.listPending()

  res.json(applications.map((application) => DriverApplicationModel.serialize(application)))
}

export async function reviewDriverApplication(req: Request, res: Response) {
  const application = await DriverApplicationModel.findById(req.params.id)

  if (!application || application.status !== 'pending') {
    throw new AppError('Driver application not found or already reviewed', 404)
  }

  const reviewed = await DriverApplicationModel.review(
    application.id,
    req.body.status,
    req.profile!.id,
    req.body.adminNotes,
  )

  if (reviewed.status === 'approved' || reviewed.status === 'rejected') {
    invalidateAuthForUser(application.profileId)
  }
  await AuditLogModel.record({
    actorProfileId: req.profile!.id,
    action: `driver_application_${reviewed.status}`,
    entityType: 'DriverApplication',
    entityId: reviewed.id,
    before: { status: 'pending' },
    after: { status: reviewed.status },
    metadata: { profileId: application.profileId },
    ip: req.ip ?? null,
  })

  res.json({
    id: reviewed.id,
    status: reviewed.status,
    reviewedAt: reviewed.reviewedAt,
    adminNotes: reviewed.adminNotes,
  })
}
