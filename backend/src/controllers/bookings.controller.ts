import type { Request, Response } from 'express'
import { BookingModel } from '../models/booking.model.js'

export function getUpcomingBooking(_req: Request, res: Response) {
  res.json(BookingModel.getUpcoming())
}

export function getBookingHistory(_req: Request, res: Response) {
  res.json(BookingModel.getHistory())
}
