import type { Request, Response } from 'express'
import { AdminModel } from '../models/admin.model.js'
import { DriverApplicationModel } from '../models/driver-application.model.js'
import { AppError } from '../utils/app-error.js'

export async function getAdminStats(_req: Request, res: Response) {
  const stats = await AdminModel.getStats()
  res.json(stats)
}

export async function listAdminTrips(_req: Request, res: Response) {
  const trips = await AdminModel.listTrips()
  res.json(trips)
}

export async function listAdminBookings(_req: Request, res: Response) {
  const bookings = await AdminModel.listBookings()
  res.json(bookings)
}

export async function listAdminUsers(_req: Request, res: Response) {
  const users = await AdminModel.listUsers()
  res.json(users)
}

export async function listPendingDriverApplications(_req: Request, res: Response) {
  const applications = await DriverApplicationModel.listPending()

  res.json(applications.map((application) => DriverApplicationModel.serialize(application)))
}

export async function reviewDriverApplication(req: Request, res: Response) {
  const application = await DriverApplicationModel.findById(req.params.id)

  if (!application || application.status !== 'pending') {
    throw new AppError('Driver application not found or already reviewed', 404)
  }

  const reviewed = await DriverApplicationModel.review(
    application.id,
    req.body.status,
    req.profile!.id,
    req.body.adminNotes,
  )

  res.json({
    id: reviewed.id,
    status: reviewed.status,
    reviewedAt: reviewed.reviewedAt,
    adminNotes: reviewed.adminNotes,
  })
}
