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
    durationHours: req.body.durationHours,
    tripCategory: req.body.tripCategory,
    vehicleName: req.body.vehicleName,
    plateNumber: req.body.plateNumber,
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

export async function updateDriverTrip(req: Request, res: Response) {
  const trip = await VanModel.updateDriverTrip(req.params.tripId, req.profile!.id, {
    departureLocation: req.body.departureLocation,
    arrivalLocation: req.body.arrivalLocation,
    departureDate: req.body.departureDate,
    departureTime: req.body.departureTime,
    durationHours: req.body.durationHours,
    tripCategory: req.body.tripCategory,
    vehicleName: req.body.vehicleName,
    plateNumber: req.body.plateNumber,
    price: req.body.price,
    totalSeats: req.body.totalSeats,
    status: req.body.status,
  })

  if (!trip) {
    throw new AppError('Draft trip not found', 404)
  }

  res.json(trip)
}

export async function startDriverTrip(req: Request, res: Response) {
  const result = await VanModel.startDriverTrip(
    req.params.tripId,
    req.profile!.id,
  )

  if (!result) {
    throw new AppError('Published trip not found', 404)
  }

  res.json(result)
}

export async function markPassengerDestinationReached(
  req: Request,
  res: Response,
) {
  const result = await VanModel.markPassengerDestinationReached(
    req.params.tripId,
    req.params.bookingId,
    req.profile!.id,
  )

  res.json(result)
}

export async function completeDriverTrip(req: Request, res: Response) {
  const trip = await VanModel.completeDriverTrip(
    req.params.tripId,
    req.profile!.id,
  )

  if (!trip) {
    throw new AppError('Active trip not found', 404)
  }

  res.json(trip)
}

export async function cancelDriverTrip(req: Request, res: Response) {
  const result = await VanModel.cancelDriverTrip(
    req.params.tripId,
    req.profile!.id,
  )

  if (!result) {
    throw new AppError('Trip not found or cannot be cancelled', 404)
  }

  res.json(result)
}
