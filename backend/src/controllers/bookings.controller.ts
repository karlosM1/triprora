import type { Request, Response } from 'express'
import { BookingModel } from '../models/booking.model.js'

export async function createBooking(req: Request, res: Response) {
  const booking = await BookingModel.create({
    userId: req.profile!.id,
    vanId: req.body.vanId,
    seat: req.body.seat,
    pickupAddress: req.body.pickupAddress,
    dropoffAddress: req.body.dropoffAddress,
    paymentMethod: 'cash',
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

export async function acceptDriverBooking(req: Request, res: Response) {
  const passenger = await BookingModel.acceptByDriver(
    req.params.tripId,
    req.params.bookingId,
    req.profile!.id,
  )
  res.json(passenger)
}

export async function declineDriverBooking(req: Request, res: Response) {
  const passenger = await BookingModel.declineByDriver(
    req.params.tripId,
    req.params.bookingId,
    req.profile!.id,
    req.body.reason,
  )
  res.json(passenger)
}
