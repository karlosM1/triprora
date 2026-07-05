import { api } from '@/lib/axios'
import type { driverRegistrationFormToPayload } from '@/lib/types/driver-registration'
import type { PendingDriverApplication, Profile } from '@/lib/types/profile'

export async function fetchProfile() {
  const { data } = await api.get<Profile>('/me')
  return data
}

export async function submitDriverApplication(
  payload: ReturnType<typeof driverRegistrationFormToPayload>,
) {
  const { data } = await api.post<{ id: string; status: string; createdAt: string }>(
    '/driver/applications',
    payload,
  )
  return data
}

export async function fetchPendingDriverApplications() {
  const { data } = await api.get<PendingDriverApplication[]>('/admin/driver-applications')
  return data
}

export async function reviewDriverApplication(
  id: string,
  payload: { status: 'approved' | 'rejected'; adminNotes?: string },
) {
  const { data } = await api.patch<{
    id: string
    status: string
    reviewedAt: string
    adminNotes: string | null
  }>(`/admin/driver-applications/${id}`, payload)
  return data
}

export function profileQueryKey(userId?: string | null) {
  return ['profile', 'me', userId] as const
}
export const pendingApplicationsQueryKey = ['admin', 'driver-applications'] as const
