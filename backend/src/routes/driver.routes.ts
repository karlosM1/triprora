import { Router } from 'express'
import {
  getMyDriverApplication,
  submitDriverApplication,
} from '../controllers/driver-applications.controller.js'
import {
  cancelDriverTrip,
  completeDriverTrip,
  createDriverTrip,
  getDriverTripById,
  getDriverTrips,
  markPassengerDestinationReached,
  startDriverTrip,
  updateDriverTrip,
} from '../controllers/driver-trips.controller.js'
import {
  acceptDriverDelivery,
  declineDriverDelivery,
} from '../controllers/deliveries.controller.js'
import {
  acceptDriverBooking,
  declineDriverBooking,
} from '../controllers/bookings.controller.js'
import {
  getDriverWallet,
  getDriverWalletHistory,
  getDriverWalletSettlements,
} from '../controllers/wallet.controller.js'
import { asyncHandler } from '../middleware/async-handler.middleware.js'
import { authenticate, requireRole } from '../middleware/auth.middleware.js'
import { validateRequest } from '../middleware/validate-request.middleware.js'
import { submitDriverApplicationSchema } from '../validators/driver-applications.validator.js'
import { deliveryIdParamSchema, acceptDeliverySchema } from '../validators/deliveries.validator.js'
import { bookingIdParamSchema, declineBookingSchema } from '../validators/bookings.validator.js'
import {
  createDriverTripSchema,
  driverTripIdParamSchema,
  updateDriverTripSchema,
} from '../validators/driver-trips.validator.js'
import { walletHistoryQuerySchema } from '../validators/wallet.validator.js'

export const driverRouter = Router()

driverRouter.post(
  '/applications',
  authenticate,
  requireRole('passenger'),
  validateRequest({ body: submitDriverApplicationSchema }),
  asyncHandler(submitDriverApplication),
)

driverRouter.get(
  '/applications/me',
  authenticate,
  asyncHandler(getMyDriverApplication),
)

driverRouter.post(
  '/trips',
  authenticate,
  requireRole('driver'),
  validateRequest({ body: createDriverTripSchema }),
  asyncHandler(createDriverTrip),
)

driverRouter.get(
  '/trips',
  authenticate,
  requireRole('driver'),
  asyncHandler(getDriverTrips),
)

driverRouter.get(
  '/trips/:tripId',
  authenticate,
  requireRole('driver'),
  validateRequest({ params: driverTripIdParamSchema }),
  asyncHandler(getDriverTripById),
)

driverRouter.patch(
  '/trips/:tripId',
  authenticate,
  requireRole('driver'),
  validateRequest({
    params: driverTripIdParamSchema,
    body: updateDriverTripSchema,
  }),
  asyncHandler(updateDriverTrip),
)

driverRouter.post(
  '/trips/:tripId/start',
  authenticate,
  requireRole('driver'),
  validateRequest({ params: driverTripIdParamSchema }),
  asyncHandler(startDriverTrip),
)

driverRouter.post(
  '/trips/:tripId/complete',
  authenticate,
  requireRole('driver'),
  validateRequest({ params: driverTripIdParamSchema }),
  asyncHandler(completeDriverTrip),
)

driverRouter.post(
  '/trips/:tripId/cancel',
  authenticate,
  requireRole('driver'),
  validateRequest({ params: driverTripIdParamSchema }),
  asyncHandler(cancelDriverTrip),
)

driverRouter.post(
  '/trips/:tripId/bookings/:bookingId/accept',
  authenticate,
  requireRole('driver'),
  validateRequest({
    params: driverTripIdParamSchema.merge(bookingIdParamSchema),
  }),
  asyncHandler(acceptDriverBooking),
)

driverRouter.post(
  '/trips/:tripId/bookings/:bookingId/decline',
  authenticate,
  requireRole('driver'),
  validateRequest({
    params: driverTripIdParamSchema.merge(bookingIdParamSchema),
    body: declineBookingSchema,
  }),
  asyncHandler(declineDriverBooking),
)

driverRouter.post(
  '/trips/:tripId/bookings/:bookingId/reach-destination',
  authenticate,
  requireRole('driver'),
  validateRequest({
    params: driverTripIdParamSchema.merge(bookingIdParamSchema),
  }),
  asyncHandler(markPassengerDestinationReached),
)

driverRouter.post(
  '/trips/:tripId/deliveries/:deliveryId/accept',
  authenticate,
  requireRole('driver'),
  validateRequest({
    params: driverTripIdParamSchema.merge(deliveryIdParamSchema),
    body: acceptDeliverySchema,
  }),
  asyncHandler(acceptDriverDelivery),
)

driverRouter.post(
  '/trips/:tripId/deliveries/:deliveryId/decline',
  authenticate,
  requireRole('driver'),
  validateRequest({
    params: driverTripIdParamSchema.merge(deliveryIdParamSchema),
  }),
  asyncHandler(declineDriverDelivery),
)

driverRouter.get(
  '/wallet',
  authenticate,
  requireRole('driver'),
  asyncHandler(getDriverWallet),
)

driverRouter.get(
  '/wallet/history',
  authenticate,
  requireRole('driver'),
  validateRequest({ query: walletHistoryQuerySchema }),
  asyncHandler(getDriverWalletHistory),
)

driverRouter.get(
  '/wallet/settlements',
  authenticate,
  requireRole('driver'),
  asyncHandler(getDriverWalletSettlements),
)
