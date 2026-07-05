import type { Profile } from '@prisma/client'
import type { Request, Response } from 'express'
import { DriverApplicationModel } from '../models/driver-application.model.js'
import { ProfileModel } from '../models/profile.model.js'

function serializeProfileFields(profile: Profile) {
  return {
    id: profile.id,
    email: profile.email,
    fullName: profile.fullName,
    phone: profile.phone,
    dateOfBirth: profile.dateOfBirth,
    gender: profile.gender,
    nationality: profile.nationality,
    houseStreet: profile.houseStreet,
    barangay: profile.barangay,
    city: profile.city,
    province: profile.province,
    zipCode: profile.zipCode,
    emergencyContactName: profile.emergencyContactName,
    emergencyContactRelationship: profile.emergencyContactRelationship,
    emergencyContactPhone: profile.emergencyContactPhone,
    role: profile.role,
    createdAt: profile.createdAt.toISOString(),
  }
}

async function serializeProfile(profile: Profile) {
  const driverApplication = await DriverApplicationModel.findByProfileId(profile.id)

  return {
    ...serializeProfileFields(profile),
    driverApplication: driverApplication
      ? DriverApplicationModel.serialize(driverApplication)
      : null,
  }
}

export async function getMe(req: Request, res: Response) {
  res.json(await serializeProfile(req.profile!))
}

export async function updateMe(req: Request, res: Response) {
  const profile = await ProfileModel.update(req.profile!.id, req.body)

  res.json(await serializeProfile(profile))
}
