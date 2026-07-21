import { Router } from 'express'
import {
  getAdminStats,
  listAdminBookings,
  listAdminTrips,
  listAdminUsers,
  listPendingDriverApplications,
  reviewDriverApplication,
} from '../controllers/admin.controller.js'
import {
  finalizeAdminSettlements,
  getAdminDriverWallet,
  listAdminPayouts,
  listAdminSettlements,
  listAdminWallets,
  updateAdminPayout,
} from '../controllers/wallet.controller.js'
import { asyncHandler } from '../middleware/async-handler.middleware.js'
import { authenticate, requireRole } from '../middleware/auth.middleware.js'
import { sensitiveRateLimiter } from '../middleware/rate-limit.middleware.js'
import { validateRequest } from '../middleware/validate-request.middleware.js'
import {
  applicationIdParamSchema,
  reviewDriverApplicationSchema,
} from '../validators/driver-applications.validator.js'
import {
  adminListQuerySchema,
  adminTripsQuerySchema,
} from '../validators/admin.validator.js'
import {
  adminPayoutsQuerySchema,
  adminUpdatePayoutSchema,
  driverIdParamSchema,
  finalizeSettlementSchema,
  payoutIdParamSchema,
  settlementsQuerySchema,
} from '../validators/wallet.validator.js'

export const adminRouter = Router()

adminRouter.use(authenticate, requireRole('admin'))

adminRouter.get('/stats', asyncHandler(getAdminStats))
adminRouter.get(
  '/trips',
  validateRequest({ query: adminTripsQuerySchema }),
  asyncHandler(listAdminTrips),
)
adminRouter.get(
  '/bookings',
  validateRequest({ query: adminListQuerySchema }),
  asyncHandler(listAdminBookings),
)
adminRouter.get(
  '/users',
  validateRequest({ query: adminListQuerySchema }),
  asyncHandler(listAdminUsers),
)

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

adminRouter.get('/wallets', asyncHandler(listAdminWallets))

adminRouter.get(
  '/wallets/:driverId',
  validateRequest({ params: driverIdParamSchema }),
  asyncHandler(getAdminDriverWallet),
)

adminRouter.get(
  '/settlements',
  validateRequest({ query: settlementsQuerySchema }),
  asyncHandler(listAdminSettlements),
)

adminRouter.post(
  '/settlements/finalize',
  sensitiveRateLimiter,
  validateRequest({ body: finalizeSettlementSchema }),
  asyncHandler(finalizeAdminSettlements),
)

adminRouter.get(
  '/payouts',
  validateRequest({ query: adminPayoutsQuerySchema }),
  asyncHandler(listAdminPayouts),
)

adminRouter.patch(
  '/payouts/:id',
  sensitiveRateLimiter,
  validateRequest({
    params: payoutIdParamSchema,
    body: adminUpdatePayoutSchema,
  }),
  asyncHandler(updateAdminPayout),
)
