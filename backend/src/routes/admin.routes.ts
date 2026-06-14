import { Router } from 'express'
import {
  getAdminStats,
  listAdminBookings,
  listAdminTrips,
  listAdminUsers,
  listPendingDriverApplications,
  reviewDriverApplication,
} from '../controllers/admin.controller.js'
import { asyncHandler } from '../middleware/async-handler.middleware.js'
import { authenticate, requireRole } from '../middleware/auth.middleware.js'
import { validateRequest } from '../middleware/validate-request.middleware.js'
import {
  applicationIdParamSchema,
  reviewDriverApplicationSchema,
} from '../validators/driver-applications.validator.js'

export const adminRouter = Router()

adminRouter.use(authenticate, requireRole('admin'))

adminRouter.get('/stats', asyncHandler(getAdminStats))
adminRouter.get('/trips', asyncHandler(listAdminTrips))
adminRouter.get('/bookings', asyncHandler(listAdminBookings))
adminRouter.get('/users', asyncHandler(listAdminUsers))

adminRouter.get(
  '/driver-applications',
  asyncHandler(listPendingDriverApplications),
)

adminRouter.patch(
  '/driver-applications/:id',
  validateRequest({
    params: applicationIdParamSchema,
    body: reviewDriverApplicationSchema,
  }),
  asyncHandler(reviewDriverApplication),
)
