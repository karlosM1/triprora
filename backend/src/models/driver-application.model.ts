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

const applicationInclude = {
  profile: true,
  address: true,
  emergencyContact: true,
  bankAccount: true,
  vehicle: {
    include: {
      documents: true,
    },
  },
  documents: true,
} as const

type SerializedApplication = ReturnType<typeof serializeApplication>

function getVehicleDocumentUrl(
  vehicle: Prisma.VehicleGetPayload<{ include: { documents: true } }> | null,
  type: 'cr' | 'or' | 'insurance' | 'inspection',
) {
  return vehicle?.documents.find((document) => document.type === type)?.url ?? null
}

function getDriverDocumentUrl(
  documents: Array<{ type: string; url: string }>,
  type: 'profile_photo' | 'license_front' | 'license_back',
) {
  return documents.find((document) => document.type === type)?.url ?? null
}

function serializeApplication(
  application: Prisma.DriverApplicationGetPayload<{ include: typeof applicationInclude }>,
) {
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
    profilePhotoUrl: getDriverDocumentUrl(application.documents, 'profile_photo'),
    houseStreet: application.address.houseStreet,
    barangay: application.address.barangay,
    city: application.address.city,
    province: application.address.province,
    zipCode: application.address.zipCode,
    licenseNo: application.licenseNo,
    licenseType: application.licenseType,
    licenseExpiration: application.licenseExpiration,
    licenseFrontUrl: getDriverDocumentUrl(application.documents, 'license_front') ?? '',
    licenseBackUrl: getDriverDocumentUrl(application.documents, 'license_back') ?? '',
    vehiclePlateNumber: application.vehicle?.plateNumber ?? '',
    vehicleMake: application.vehicle?.make ?? '',
    vehicleModel: application.vehicle?.model ?? '',
    vehicleYear: application.vehicle?.year ?? 0,
    vehicleColor: application.vehicle?.color ?? '',
    vehicleCapacity: application.vehicle?.capacity ?? 0,
    vehiclePhotoUrl: application.vehicle?.photoUrl,
    crDocumentUrl: getVehicleDocumentUrl(application.vehicle, 'cr') ?? '',
    orDocumentUrl: getVehicleDocumentUrl(application.vehicle, 'or') ?? '',
    insuranceDocumentUrl: getVehicleDocumentUrl(application.vehicle, 'insurance') ?? '',
    inspectionDocumentUrl: getVehicleDocumentUrl(application.vehicle, 'inspection'),
    emergencyContactName: application.emergencyContact.name,
    emergencyContactRelationship: application.emergencyContact.relationship,
    emergencyContactPhone: application.emergencyContact.phone,
    gcashNumber: application.bankAccount?.gcashNumber,
    bankAccountName: application.bankAccount?.accountName,
    bankName: application.bankAccount?.bankName,
    bankAccountNumber: application.bankAccount?.accountNumber,
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
      include: applicationInclude,
    })
  },

  async findByProfileId(profileId: string) {
    return prisma.driverApplication.findUnique({
      where: { profileId },
      include: applicationInclude,
    })
  },

  async deleteRejectedByProfileId(profileId: string) {
    const application = await prisma.driverApplication.findUnique({
      where: { profileId, status: 'rejected' },
      select: {
        id: true,
        addressId: true,
        emergencyContactId: true,
        bankAccountId: true,
        vehicleId: true,
      },
    })

    if (!application) {
      return { count: 0 }
    }

    return prisma.$transaction(async (tx) => {
      await tx.driverApplication.delete({ where: { id: application.id } })

      await tx.address.delete({ where: { id: application.addressId } })
      await tx.emergencyContact.delete({ where: { id: application.emergencyContactId } })

      if (application.bankAccountId) {
        await tx.driverBankAccount.delete({ where: { id: application.bankAccountId } })
      }

      if (application.vehicleId) {
        await tx.vehicleDocument.deleteMany({ where: { vehicleId: application.vehicleId } })
        await tx.vehicle.delete({ where: { id: application.vehicleId } })
      }

      return { count: 1 }
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
      profilePhotoUrl,
      houseStreet,
      barangay,
      city,
      province,
      zipCode,
      licenseFrontUrl,
      licenseBackUrl,
      vehiclePlateNumber,
      vehicleMake,
      vehicleModel,
      vehicleYear,
      vehicleColor,
      vehicleCapacity,
      vehiclePhotoUrl,
      crDocumentUrl,
      orDocumentUrl,
      insuranceDocumentUrl,
      inspectionDocumentUrl,
      emergencyContactName,
      emergencyContactRelationship,
      emergencyContactPhone,
      gcashNumber,
      bankAccountName,
      bankName,
      bankAccountNumber,
      ...rest
    } = data
    const fullName = [firstName, middleName, lastName, suffix].filter(Boolean).join(' ')
    const hasBankDetails = Boolean(
      gcashNumber || bankAccountName || bankName || bankAccountNumber,
    )

    return prisma.$transaction(async (tx) => {
      await tx.profile.update({
        where: { id: profileId },
        data: { fullName, phone },
      })

      const address = await tx.address.create({
        data: {
          houseStreet,
          barangay,
          city,
          province,
          zipCode,
        },
      })

      const emergencyContact = await tx.emergencyContact.create({
        data: {
          name: emergencyContactName,
          relationship: emergencyContactRelationship,
          phone: emergencyContactPhone,
        },
      })

      const bankAccount = hasBankDetails
        ? await tx.driverBankAccount.create({
            data: {
              gcashNumber: gcashNumber || null,
              accountName: bankAccountName || null,
              bankName: bankName || null,
              accountNumber: bankAccountNumber || null,
            },
          })
        : null

      const vehicle = await tx.vehicle.create({
        data: {
          ownerProfileId: profileId,
          plateNumber: vehiclePlateNumber,
          make: vehicleMake,
          model: vehicleModel,
          year: vehicleYear,
          color: vehicleColor,
          capacity: vehicleCapacity,
          photoUrl: vehiclePhotoUrl || null,
          documents: {
            create: [
              { type: 'cr', url: crDocumentUrl },
              { type: 'or', url: orDocumentUrl },
              { type: 'insurance', url: insuranceDocumentUrl },
              ...(inspectionDocumentUrl
                ? [{ type: 'inspection' as const, url: inspectionDocumentUrl }]
                : []),
            ],
          },
        },
      })

      return tx.driverApplication.create({
        data: {
          profileId,
          firstName,
          middleName: middleName || null,
          lastName,
          suffix: suffix || null,
          ...rest,
          addressId: address.id,
          emergencyContactId: emergencyContact.id,
          bankAccountId: bankAccount?.id ?? null,
          vehicleId: vehicle.id,
          documents: {
            create: [
              ...(profilePhotoUrl
                ? [{ type: 'profile_photo' as const, url: profilePhotoUrl }]
                : []),
              { type: 'license_front', url: licenseFrontUrl },
              { type: 'license_back', url: licenseBackUrl },
            ],
          },
        },
        include: applicationInclude,
      })
    })
  },

  async listPending() {
    return prisma.driverApplication.findMany({
      where: { status: 'pending' },
      include: applicationInclude,
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
        include: applicationInclude,
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

export type { SerializedApplication }
