import type { Request, Response } from 'express'
import { syncPaymentStatus } from '../lib/paymongo.js'
import { BookingModel } from '../models/booking.model.js'
import { AppError } from '../utils/app-error.js'

export async function createBooking(req: Request, res: Response) {
  const profile = req.profile!
  const paymentIntentId = req.body.paymentIntentId as string

  const payment = await syncPaymentStatus(profile.id, paymentIntentId)

  if (payment.status !== 'succeeded') {
    throw new AppError('Payment is not completed yet. Please finish paying via QR Ph.', 402)
  }

  const booking = await BookingModel.create({
    userId: profile.id,
    vanId: req.body.vanId,
    seat: req.body.seat,
    pickupAddress: req.body.pickupAddress,
    dropoffAddress: req.body.dropoffAddress,
    paymentIntentId,
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

export async function updateBooking(req: Request, res: Response) {
  const booking = await BookingModel.update(
    req.profile!.id,
    req.params.bookingId,
    req.body,
  )

  res.json(booking)
}

export async function cancelBooking(req: Request, res: Response) {
  const booking = await BookingModel.cancel(
    req.profile!.id,
    req.params.bookingId,
  )

  res.json(booking)
}
