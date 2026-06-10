import type { DriverApplicationStatus } from '@prisma/client'
import { prisma } from '../lib/prisma.js'

export const DriverApplicationModel = {
  async findById(id: string) {
    return prisma.driverApplication.findUnique({
      where: { id },
      include: { profile: true },
    })
  },

  async findByProfileId(profileId: string) {
    return prisma.driverApplication.findUnique({
      where: { profileId },
      include: { profile: true },
    })
  },

  async create(data: {
    profileId: string
    licenseNo: string
    vehicleInfo?: string
    fullName?: string
    phone?: string
  }) {
    const { profileId, licenseNo, vehicleInfo, fullName, phone } = data

    return prisma.$transaction(async (tx) => {
      if (fullName || phone) {
        await tx.profile.update({
          where: { id: profileId },
          data: {
            ...(fullName ? { fullName } : {}),
            ...(phone ? { phone } : {}),
          },
        })
      }

      return tx.driverApplication.create({
        data: {
          profileId,
          licenseNo,
          vehicleInfo,
        },
        include: { profile: true },
      })
    })
  },

  async listPending() {
    return prisma.driverApplication.findMany({
      where: { status: 'pending' },
      include: { profile: true },
      orderBy: { createdAt: 'asc' },
    })
  },

  async review(
    id: string,
    status: Extract<DriverApplicationStatus, 'approved' | 'rejected'>,
    reviewedBy: string,
    adminNotes?: string,
  ) {
    return prisma.$transaction(async (tx) => {
      const application = await tx.driverApplication.update({
        where: { id },
        data: {
          status,
          reviewedBy,
          reviewedAt: new Date(),
          adminNotes,
        },
        include: { profile: true },
      })

      if (status === 'approved') {
        await tx.profile.update({
          where: { id: application.profileId },
          data: { role: 'driver' },
        })
      }

      return application
    })
  },
}
