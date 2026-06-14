import type { Request, Response } from 'express'
import { BookingModel } from '../models/booking.model.js'

export async function createBooking(req: Request, res: Response) {
  const profile = req.profile!

  const booking = await BookingModel.create({
    userId: profile.id,
    vanId: req.body.vanId,
    seat: req.body.seat,
  })

  res.status(201).json(booking)
}

export async function getUpcomingBooking(req: Request, res: Response) {
  const booking = await BookingModel.getUpcoming(req.profile!.id)
  res.json(booking)
}

export async function getBookingHistory(req: Request, res: Response) {
  const history = await BookingModel.getHistory(req.profile!.id)
  res.json(history)
}
