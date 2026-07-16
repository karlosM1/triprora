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

export type Role = 'passenger' | 'driver' | 'admin' | 'superadmin'

export type DriverApplicationStatus = 'pending' | 'approved' | 'rejected'

export type DestinationAddress = {
  id: string
  label: string
  houseStreet: string
  barangay: string | null
  city: string
  province: string
  zipCode: string | null
  createdAt: string
  updatedAt: string
}

export type DestinationAddressPayload = {
  label: string
  houseStreet: string
  barangay: string
  city: string
  province: string
  zipCode: string
}

export type Profile = {
  id: string
  email: string
  fullName: string | null
  phone: string | null
  dateOfBirth: string | null
  gender: string | null
  nationality: string | null
  houseStreet: string | null
  barangay: string | null
  city: string | null
  province: string | null
  zipCode: string | null
  emergencyContactName: string | null
  emergencyContactRelationship: string | null
  emergencyContactPhone: string | null
  role: Role
  createdAt: string
  driverApplication: DriverApplication | null
}

export type UpdateProfilePayload = {
  fullName: string
  phone: string
  dateOfBirth: string
  gender: string
  nationality: string
  houseStreet: string
  barangay: string
  city: string
  province: string
  zipCode: string
  emergencyContactName: string
  emergencyContactRelationship: string
  emergencyContactPhone: string
}

export type PendingDriverApplication = DriverApplication & {
  applicant: {
    id: string
    email: string
    fullName: string | null
    phone: string | null
  }
}
