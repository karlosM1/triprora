export type Role = 'passenger' | 'driver' | 'admin'

export type DriverApplicationStatus = 'pending' | 'approved' | 'rejected'

export type DriverApplication = {
  id: string
  licenseNo: string
  vehicleInfo: string | null
  status: DriverApplicationStatus
  adminNotes: string | null
  createdAt: string
  reviewedAt: string | null
}

export type Profile = {
  id: string
  email: string
  fullName: string | null
  phone: string | null
  role: Role
  driverApplication: DriverApplication | null
}

export type PendingDriverApplication = {
  id: string
  status: DriverApplicationStatus
  licenseNo: string
  vehicleInfo: string | null
  createdAt: string
  applicant: {
    id: string
    email: string
    fullName: string | null
    phone: string | null
  }
}
