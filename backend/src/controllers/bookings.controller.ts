import type { Request, Response } from 'express'
import { BookingModel } from '../models/booking.model.js'

export async function getUpcomingBooking(_req: Request, res: Response) {
  const booking = await BookingModel.getUpcoming()
  res.json(booking)
}

export async function getBookingHistory(_req: Request, res: Response) {
  const history = await BookingModel.getHistory()
  res.json(history)
}
