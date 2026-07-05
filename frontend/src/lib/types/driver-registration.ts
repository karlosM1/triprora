export type DriverRegistrationFormData = {
  // Contact
  phone: string
  email: string

  // Personal information
  firstName: string
  middleName: string
  lastName: string
  suffix: string
  dateOfBirth: string
  gender: string
  nationality: string
  profilePhotoUrl: string

  // Contact address
  houseStreet: string
  barangay: string
  city: string
  province: string
  zipCode: string

  // Driver's license
  licenseNo: string
  licenseType: string
  licenseExpiration: string
  licenseFrontUrl: string
  licenseBackUrl: string

  // Vehicle information
  vehiclePlateNumber: string
  vehicleMake: string
  vehicleModel: string
  vehicleYear: string
  vehicleColor: string
  vehicleCapacity: string
  vehiclePhotoUrl: string

  // Vehicle documents
  crDocumentUrl: string
  orDocumentUrl: string
  insuranceDocumentUrl: string
  inspectionDocumentUrl: string

  // Emergency contact
  emergencyContactName: string
  emergencyContactRelationship: string
  emergencyContactPhone: string

  // Verification & consent
  certifyInfo: boolean
  agreeTerms: boolean
  agreePrivacy: boolean
}

export const DRIVER_REGISTRATION_STEPS = [
  { id: 1, label: 'Personal' },
  { id: 2, label: 'Contact' },
  { id: 3, label: 'License' },
  { id: 4, label: 'Vehicle' },
  { id: 5, label: 'Documents' },
  { id: 6, label: 'Emergency' },
  { id: 7, label: 'Account' },
  { id: 8, label: 'Review' },
] as const

export type DriverRegistrationStep = (typeof DRIVER_REGISTRATION_STEPS)[number]['id']

export function createEmptyDriverRegistrationForm(email = ''): DriverRegistrationFormData {
  return {
    phone: '',
    email,
    firstName: '',
    middleName: '',
    lastName: '',
    suffix: '',
    dateOfBirth: '',
    gender: '',
    nationality: 'Filipino',
    profilePhotoUrl: '',
    houseStreet: '',
    barangay: '',
    city: '',
    province: '',
    zipCode: '',
    licenseNo: '',
    licenseType: '',
    licenseExpiration: '',
    licenseFrontUrl: '',
    licenseBackUrl: '',
    vehiclePlateNumber: '',
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: '',
    vehicleColor: '',
    vehicleCapacity: '',
    vehiclePhotoUrl: '',
    crDocumentUrl: '',
    orDocumentUrl: '',
    insuranceDocumentUrl: '',
    inspectionDocumentUrl: '',
    emergencyContactName: '',
    emergencyContactRelationship: '',
    emergencyContactPhone: '',
    certifyInfo: false,
    agreeTerms: false,
    agreePrivacy: false,
  }
}

export function driverRegistrationFormToPayload(form: DriverRegistrationFormData) {
  return {
    phone: form.phone,
    firstName: form.firstName,
    middleName: form.middleName || undefined,
    lastName: form.lastName,
    suffix: form.suffix || undefined,
    dateOfBirth: form.dateOfBirth,
    gender: form.gender,
    nationality: form.nationality,
    profilePhotoUrl: form.profilePhotoUrl || undefined,
    houseStreet: form.houseStreet,
    barangay: form.barangay,
    city: form.city,
    province: form.province,
    zipCode: form.zipCode,
    licenseNo: form.licenseNo,
    licenseType: form.licenseType,
    licenseExpiration: form.licenseExpiration,
    licenseFrontUrl: form.licenseFrontUrl,
    licenseBackUrl: form.licenseBackUrl,
    vehiclePlateNumber: form.vehiclePlateNumber,
    vehicleMake: form.vehicleMake,
    vehicleModel: form.vehicleModel,
    vehicleYear: Number(form.vehicleYear),
    vehicleColor: form.vehicleColor,
    vehicleCapacity: Number(form.vehicleCapacity),
    vehiclePhotoUrl: form.vehiclePhotoUrl || undefined,
    crDocumentUrl: form.crDocumentUrl,
    orDocumentUrl: form.orDocumentUrl,
    insuranceDocumentUrl: form.insuranceDocumentUrl,
    inspectionDocumentUrl: form.inspectionDocumentUrl || undefined,
    emergencyContactName: form.emergencyContactName,
    emergencyContactRelationship: form.emergencyContactRelationship,
    emergencyContactPhone: form.emergencyContactPhone,
    certifyInfo: true as const,
    agreeTerms: true as const,
    agreePrivacy: true as const,
  }
}

export function validateDriverRegistrationStep(
  step: DriverRegistrationStep,
  form: DriverRegistrationFormData,
): string | null {
  switch (step) {
    case 1:
      if (!form.firstName.trim()) return 'First name is required.'
      if (!form.lastName.trim()) return 'Last name is required.'
      if (!form.dateOfBirth) return 'Date of birth is required.'
      if (!form.gender) return 'Gender is required.'
      if (!form.nationality.trim()) return 'Nationality is required.'
      return null
    case 2:
      if (!form.phone.trim()) return 'Mobile number is required.'
      if (!form.email.trim()) return 'Email address is required.'
      if (!form.houseStreet.trim()) return 'House number/street is required.'
      if (!form.barangay.trim()) return 'Barangay is required.'
      if (!form.city.trim()) return 'City/municipality is required.'
      if (!form.province.trim()) return 'Province is required.'
      if (!form.zipCode.trim()) return 'ZIP code is required.'
      return null
    case 3:
      if (!form.licenseNo.trim()) return "Driver's license number is required."
      if (!form.licenseType.trim()) return 'License type/restriction code is required.'
      if (!form.licenseExpiration) return 'License expiration date is required.'
      if (!form.licenseFrontUrl) return 'Upload the front of your license.'
      if (!form.licenseBackUrl) return 'Upload the back of your license.'
      return null
    case 4:
      if (!form.vehiclePlateNumber.trim()) return 'Vehicle plate number is required.'
      if (!form.vehicleMake.trim()) return 'Vehicle make is required.'
      if (!form.vehicleModel.trim()) return 'Vehicle model is required.'
      if (!form.vehicleYear.trim()) return 'Vehicle year is required.'
      if (!form.vehicleColor.trim()) return 'Vehicle color is required.'
      if (!form.vehicleCapacity.trim()) return 'Vehicle capacity is required.'
      return null
    case 5:
      if (!form.crDocumentUrl) return 'Upload your Certificate of Registration (CR).'
      if (!form.orDocumentUrl) return 'Upload your Official Receipt (OR).'
      if (!form.insuranceDocumentUrl) return 'Upload your insurance document.'
      return null
    case 6:
      if (!form.emergencyContactName.trim()) return 'Emergency contact name is required.'
      if (!form.emergencyContactRelationship.trim()) return 'Relationship is required.'
      if (!form.emergencyContactPhone.trim()) return 'Emergency contact number is required.'
      return null
    case 7:
      return null
    case 8:
      if (!form.certifyInfo) return 'You must certify that the information is true.'
      if (!form.agreeTerms) return 'You must agree to the Terms and Conditions.'
      if (!form.agreePrivacy) return 'You must agree to the Privacy Policy.'
      return null
    default:
      return null
  }
}
