export type DriverApplication = {
  id: string
  status: DriverApplicationStatus
  adminNotes: string | null
  createdAt: string
  reviewedAt: string | null
  firstName: string
  middleName: string | null
  lastName: string
  suffix: string | null
  dateOfBirth: string
  gender: string
  nationality: string
  profilePhotoUrl: string | null
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
  vehiclePhotoUrl: string | null
  crDocumentUrl: string
  orDocumentUrl: string
  insuranceDocumentUrl: string
  inspectionDocumentUrl: string | null
  emergencyContactName: string
  emergencyContactRelationship: string
  emergencyContactPhone: string
  gcashNumber: string | null
  bankAccountName: string | null
  bankName: string | null
  bankAccountNumber: string | null
  certifyInfo: boolean
  agreeTerms: boolean
  agreePrivacy: boolean
}

export type Role = 'passenger' | 'driver' | 'admin'

export type DriverApplicationStatus = 'pending' | 'approved' | 'rejected'

export type Profile = {
  id: string
  email: string
  fullName: string | null
  phone: string | null
  role: Role
  driverApplication: DriverApplication | null
}

export type PendingDriverApplication = DriverApplication & {
  applicant: {
    id: string
    email: string
    fullName: string | null
    phone: string | null
  }
}
