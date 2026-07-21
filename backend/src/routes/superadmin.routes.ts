import { Router } from 'express'
import {
  banAdminUser,
  getAdminStats,
  listAdminBookings,
  listAdminDrivers,
  listAdminTrips,
  listAdminUsers,
  setAdminUserPassword,
  updateAdminUserRole,
} from '../controllers/admin.controller.js'
import { asyncHandler } from '../middleware/async-handler.middleware.js'
import { authenticate, requireRole } from '../middleware/auth.middleware.js'
import { sensitiveRateLimiter } from '../middleware/rate-limit.middleware.js'
import { validateRequest } from '../middleware/validate-request.middleware.js'
import {
  adminBookingsQuerySchema,
  adminDriversQuerySchema,
  adminTripsQuerySchema,
  adminUsersQuerySchema,
  banUserSchema,
  setUserPasswordSchema,
  updateUserRoleSchema,
  userIdParamSchema,
} from '../validators/admin.validator.js'

export const superadminRouter = Router()

superadminRouter.use(authenticate, requireRole('superadmin'))

superadminRouter.get('/stats', asyncHandler(getAdminStats))
superadminRouter.get(
  '/trips',
  validateRequest({ query: adminTripsQuerySchema }),
  asyncHandler(listAdminTrips),
)
superadminRouter.get(
  '/bookings',
  validateRequest({ query: adminBookingsQuerySchema }),
  asyncHandler(listAdminBookings),
)
superadminRouter.get(
  '/users',
  validateRequest({ query: adminUsersQuerySchema }),
  asyncHandler(listAdminUsers),
)
superadminRouter.get(
  '/drivers',
  validateRequest({ query: adminDriversQuerySchema }),
  asyncHandler(listAdminDrivers),
)

superadminRouter.patch(
  '/users/:id/role',
  sensitiveRateLimiter,
  validateRequest({
    params: userIdParamSchema,
    body: updateUserRoleSchema,
  }),
  asyncHandler(updateAdminUserRole),
)

superadminRouter.patch(
  '/users/:id/ban',
  sensitiveRateLimiter,
  validateRequest({
    params: userIdParamSchema,
    body: banUserSchema,
  }),
  asyncHandler(banAdminUser),
)

superadminRouter.patch(
  '/users/:id/password',
  sensitiveRateLimiter,
  validateRequest({
    params: userIdParamSchema,
    body: setUserPasswordSchema,
  }),
  asyncHandler(setAdminUserPassword),
)
