import type { Request, Response } from 'express'
import { VanModel } from '../models/van.model.js'
import { AppError } from '../utils/app-error.js'

export async function createDriverTrip(req: Request, res: Response) {
  const profile = req.profile!

  const trip = await VanModel.createDriverTrip({
    driverId: profile.id,
    driverName: profile.fullName,
    departureLocation: req.body.departureLocation,
    arrivalLocation: req.body.arrivalLocation,
    departureDate: req.body.departureDate,
    departureTime: req.body.departureTime,
    tripCategory: req.body.tripCategory,
    vehicleName: req.body.vehicleName,
    price: req.body.price,
    totalSeats: req.body.totalSeats,
    status: req.body.status,
  })

  res.status(201).json(trip)
}

export async function getDriverTrips(req: Request, res: Response) {
  const trips = await VanModel.findByDriverId(req.profile!.id)
  res.json(trips)
}

export async function getDriverTripById(req: Request, res: Response) {
  const details = await VanModel.findDriverTripDetails(
    req.params.tripId,
    req.profile!.id,
  )

  if (!details) {
    throw new AppError('Trip not found', 404)
  }

  res.json(details)
}
