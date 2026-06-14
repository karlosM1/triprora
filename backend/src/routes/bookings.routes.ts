import { Router } from 'express'
import {
  createBooking,
  getBookingHistory,
  getUpcomingBooking,
} from '../controllers/bookings.controller.js'
import { asyncHandler } from '../middleware/async-handler.middleware.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { validateRequest } from '../middleware/validate-request.middleware.js'
import { createBookingSchema } from '../validators/bookings.validator.js'

export const bookingsRouter = Router()

bookingsRouter.use(authenticate)

bookingsRouter.post(
  '/',
  validateRequest({ body: createBookingSchema }),
  asyncHandler(createBooking),
)
bookingsRouter.get('/upcoming', asyncHandler(getUpcomingBooking))
bookingsRouter.get('/history', asyncHandler(getBookingHistory))
