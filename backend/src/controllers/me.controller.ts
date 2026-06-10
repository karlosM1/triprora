import type { Request, Response } from 'express'
import { DriverApplicationModel } from '../models/driver-application.model.js'

export async function getMe(req: Request, res: Response) {
  const profile = req.profile!
  const driverApplication = await DriverApplicationModel.findByProfileId(profile.id)

  res.json({
    id: profile.id,
    email: profile.email,
    fullName: profile.fullName,
    phone: profile.phone,
    role: profile.role,
    driverApplication: driverApplication
      ? {
          id: driverApplication.id,
          licenseNo: driverApplication.licenseNo,
          vehicleInfo: driverApplication.vehicleInfo,
          status: driverApplication.status,
          adminNotes: driverApplication.adminNotes,
          createdAt: driverApplication.createdAt,
          reviewedAt: driverApplication.reviewedAt,
        }
      : null,
  })
}
