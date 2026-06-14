import { Router } from 'express'
import {
  getMyDriverApplication,
  submitDriverApplication,
} from '../controllers/driver-applications.controller.js'
import {
  createDriverTrip,
  getDriverTripById,
  getDriverTrips,
} from '../controllers/driver-trips.controller.js'
import { asyncHandler } from '../middleware/async-handler.middleware.js'
import { authenticate, requireRole } from '../middleware/auth.middleware.js'
import { validateRequest } from '../middleware/validate-request.middleware.js'
import { submitDriverApplicationSchema } from '../validators/driver-applications.validator.js'
import {
  createDriverTripSchema,
  driverTripIdParamSchema,
} from '../validators/driver-trips.validator.js'

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
