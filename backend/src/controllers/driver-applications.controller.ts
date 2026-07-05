import type { Request, Response } from 'express'
import { DriverApplicationModel } from '../models/driver-application.model.js'
import { AppError } from '../utils/app-error.js'

export async function submitDriverApplication(req: Request, res: Response) {
  const profile = req.profile!

  if (profile.role === 'driver') {
    throw new AppError('You are already registered as a driver', 400)
  }

  if (profile.role === 'admin') {
    throw new AppError('Admins cannot submit driver applications', 400)
  }

  const existing = await DriverApplicationModel.findByProfileId(profile.id)
  if (existing) {
    if (existing.status === 'pending') {
      throw new AppError('You already have a pending driver application', 400)
    }
    if (existing.status === 'approved') {
      throw new AppError('Your driver application has already been approved', 400)
    }
    if (existing.status === 'rejected') {
      await DriverApplicationModel.deleteRejectedByProfileId(profile.id)
    }
  }

  const application = await DriverApplicationModel.create({
    profileId: profile.id,
    ...req.body,
  })

  res.status(201).json({
    id: application.id,
    status: application.status,
    createdAt: application.createdAt,
  })
}

export async function getMyDriverApplication(req: Request, res: Response) {
  const application = await DriverApplicationModel.findByProfileId(req.profile!.id)

  if (!application) {
    res.json(null)
    return
  }

  res.json(DriverApplicationModel.serialize(application))
}
