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
    throw new AppError(
      'Your previous application was rejected. Contact support to reapply.',
      400,
    )
  }

  const application = await DriverApplicationModel.create({
    profileId: profile.id,
    fullName: req.body.fullName,
    phone: req.body.phone,
    licenseNo: req.body.licenseNo,
    vehicleInfo: req.body.vehicleInfo,
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

  res.json({
    id: application.id,
    licenseNo: application.licenseNo,
    vehicleInfo: application.vehicleInfo,
    status: application.status,
    adminNotes: application.adminNotes,
    createdAt: application.createdAt,
    reviewedAt: application.reviewedAt,
  })
}
