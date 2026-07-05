import type { DriverApplicationStatus, Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma.js'

export type CreateDriverApplicationData = {
  profileId: string
  phone: string
  firstName: string
  middleName?: string
  lastName: string
  suffix?: string
  dateOfBirth: string
  gender: string
  nationality: string
  profilePhotoUrl?: string
  houseStreet: string
  barangay: string
  city: string
  province: string
  zipCode: string
  licenseNo: string
  licenseType: string
  licenseExpiration: string
  licenseFrontUrl: string
  licenseBackUrl: string
  vehiclePlateNumber: string
  vehicleMake: string
  vehicleModel: string
  vehicleYear: number
  vehicleColor: string
  vehicleCapacity: number
  vehiclePhotoUrl?: string
  crDocumentUrl: string
  orDocumentUrl: string
  insuranceDocumentUrl: string
  inspectionDocumentUrl?: string
  emergencyContactName: string
  emergencyContactRelationship: string
  emergencyContactPhone: string
  gcashNumber?: string
  bankAccountName?: string
  bankName?: string
  bankAccountNumber?: string
  certifyInfo: boolean
  agreeTerms: boolean
  agreePrivacy: boolean
}

function serializeApplication(application: Prisma.DriverApplicationGetPayload<{ include: { profile: true } }>) {
  return {
    id: application.id,
    status: application.status,
    adminNotes: application.adminNotes,
    createdAt: application.createdAt,
    reviewedAt: application.reviewedAt,
    firstName: application.firstName,
    middleName: application.middleName,
    lastName: application.lastName,
    suffix: application.suffix,
    dateOfBirth: application.dateOfBirth,
    gender: application.gender,
    nationality: application.nationality,
    profilePhotoUrl: application.profilePhotoUrl,
    houseStreet: application.houseStreet,
    barangay: application.barangay,
    city: application.city,
    province: application.province,
    zipCode: application.zipCode,
    licenseNo: application.licenseNo,
    licenseType: application.licenseType,
    licenseExpiration: application.licenseExpiration,
    licenseFrontUrl: application.licenseFrontUrl,
    licenseBackUrl: application.licenseBackUrl,
    vehiclePlateNumber: application.vehiclePlateNumber,
    vehicleMake: application.vehicleMake,
    vehicleModel: application.vehicleModel,
    vehicleYear: application.vehicleYear,
    vehicleColor: application.vehicleColor,
    vehicleCapacity: application.vehicleCapacity,
    vehiclePhotoUrl: application.vehiclePhotoUrl,
    crDocumentUrl: application.crDocumentUrl,
    orDocumentUrl: application.orDocumentUrl,
    insuranceDocumentUrl: application.insuranceDocumentUrl,
    inspectionDocumentUrl: application.inspectionDocumentUrl,
    emergencyContactName: application.emergencyContactName,
    emergencyContactRelationship: application.emergencyContactRelationship,
    emergencyContactPhone: application.emergencyContactPhone,
    gcashNumber: application.gcashNumber,
    bankAccountName: application.bankAccountName,
    bankName: application.bankName,
    bankAccountNumber: application.bankAccountNumber,
    certifyInfo: application.certifyInfo,
    agreeTerms: application.agreeTerms,
    agreePrivacy: application.agreePrivacy,
    applicant: {
      id: application.profile.id,
      email: application.profile.email,
      fullName: application.profile.fullName,
      phone: application.profile.phone,
    },
  }
}

export const DriverApplicationModel = {
  serialize: serializeApplication,

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

  async deleteRejectedByProfileId(profileId: string) {
    return prisma.driverApplication.deleteMany({
      where: { profileId, status: 'rejected' },
    })
  },

  async create(data: CreateDriverApplicationData) {
    const {
      profileId,
      phone,
      firstName,
      middleName,
      lastName,
      suffix,
      ...rest
    } = data
    const fullName = [firstName, middleName, lastName, suffix].filter(Boolean).join(' ')

    return prisma.$transaction(async (tx) => {
      await tx.profile.update({
        where: { id: profileId },
        data: { fullName, phone },
      })

      return tx.driverApplication.create({
        data: {
          profileId,
          firstName,
          middleName: middleName || null,
          lastName,
          suffix: suffix || null,
          ...rest,
          profilePhotoUrl: rest.profilePhotoUrl || null,
          vehiclePhotoUrl: rest.vehiclePhotoUrl || null,
          inspectionDocumentUrl: rest.inspectionDocumentUrl || null,
          gcashNumber: rest.gcashNumber || null,
          bankAccountName: rest.bankAccountName || null,
          bankName: rest.bankName || null,
          bankAccountNumber: rest.bankAccountNumber || null,
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
