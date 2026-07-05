import { z } from 'zod'

const optionalString = z.string().trim().max(200).optional().or(z.literal(''))

export const submitDriverApplicationSchema = z.object({
  // Profile updates
  phone: z.string().trim().min(7).max(20),

  // Personal information
  firstName: z.string().trim().min(1).max(50),
  middleName: optionalString,
  lastName: z.string().trim().min(1).max(50),
  suffix: optionalString,
  dateOfBirth: z.string().trim().min(1).max(20),
  gender: z.string().trim().min(1).max(30),
  nationality: z.string().trim().min(1).max(60),
  profilePhotoUrl: z.string().url().optional(),

  // Contact address
  houseStreet: z.string().trim().min(1).max(200),
  barangay: z.string().trim().min(1).max(100),
  city: z.string().trim().min(1).max(100),
  province: z.string().trim().min(1).max(100),
  zipCode: z.string().trim().min(3).max(12),

  // Driver's license
  licenseNo: z.string().trim().min(3).max(50),
  licenseType: z.string().trim().min(1).max(50),
  licenseExpiration: z.string().trim().min(1).max(20),
  licenseFrontUrl: z.string().url(),
  licenseBackUrl: z.string().url(),

  // Vehicle information
  vehiclePlateNumber: z.string().trim().min(3).max(20),
  vehicleMake: z.string().trim().min(1).max(50),
  vehicleModel: z.string().trim().min(1).max(50),
  vehicleYear: z.coerce.number().int().min(1980).max(new Date().getFullYear() + 1),
  vehicleColor: z.string().trim().min(1).max(30),
  vehicleCapacity: z.coerce.number().int().min(1).max(50),
  vehiclePhotoUrl: z.string().url().optional(),

  // Vehicle documents
  crDocumentUrl: z.string().url(),
  orDocumentUrl: z.string().url(),
  insuranceDocumentUrl: z.string().url(),
  inspectionDocumentUrl: z.string().url().optional(),

  // Emergency contact
  emergencyContactName: z.string().trim().min(2).max(100),
  emergencyContactRelationship: z.string().trim().min(2).max(50),
  emergencyContactPhone: z.string().trim().min(7).max(20),

  // Banking / payment (optional)
  gcashNumber: optionalString,
  bankAccountName: optionalString,
  bankName: optionalString,
  bankAccountNumber: optionalString,

  // Verification & consent
  certifyInfo: z.literal(true),
  agreeTerms: z.literal(true),
  agreePrivacy: z.literal(true),
})

export const reviewDriverApplicationSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  adminNotes: z.string().trim().max(500).optional(),
})

export const applicationIdParamSchema = z.object({
  id: z.string().min(1),
})
