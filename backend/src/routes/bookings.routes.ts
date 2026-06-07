import { Router } from 'express'
import {
  getBookingHistory,
  getUpcomingBooking,
} from '../controllers/bookings.controller.js'
import { asyncHandler } from '../middleware/async-handler.middleware.js'

export const bookingsRouter = Router()

bookingsRouter.get('/upcoming', asyncHandler(getUpcomingBooking))
bookingsRouter.get('/history', asyncHandler(getBookingHistory))
