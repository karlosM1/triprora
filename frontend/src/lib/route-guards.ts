import { redirect } from '@tanstack/react-router'
import { fetchProfile, profileQueryKey } from '@/lib/api/profile'
import { resolveSession } from '@/lib/auth-session'
import { queryClient } from '@/lib/query-client'
import type { Role } from '@/lib/types/profile'

const PROFILE_STALE_TIME = 1000 * 60 * 5

export async function requireAuth(redirectTo: string) {
  const session = await resolveSession()

  if (!session) {
    throw redirect({
      to: '/sign-in',
      search: { redirect: redirectTo },
    })
  }

  return session
}

export async function requireRole(redirectTo: string, ...roles: Role[]) {
  const session = await requireAuth(redirectTo)
  const profile = await queryClient.ensureQueryData({
    queryKey: profileQueryKey(session.user.id),
    queryFn: fetchProfile,
    staleTime: PROFILE_STALE_TIME,
  })

  if (!roles.includes(profile.role)) {
    throw redirect({ to: '/my-bookings' })
  }

  return profile
}

export function isDriverRegisterPath(pathname: string) {
  return pathname === '/driver/register' || pathname.startsWith('/driver/register/')
}
