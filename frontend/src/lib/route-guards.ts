import { redirect } from '@tanstack/react-router'
import { isAxiosError } from 'axios'
import { fetchProfile, profileQueryKey } from '@/lib/api/profile'
import { resolveSession, setCachedSession } from '@/lib/auth-session'
import { queryClient } from '@/lib/query-client'
import { supabase } from '@/lib/supabase'
import type { Role } from '@/lib/types/profile'

const PROFILE_STALE_TIME = 1000 * 60 * 5

async function forceSignOut() {
  setCachedSession(null)
  queryClient.removeQueries({ queryKey: ['profile'] })
  await supabase.auth.signOut()
}

export async function requireAuth(redirectTo: string) {
  const session = await resolveSession()

  if (!session) {
    throw redirect({
      to: '/sign-in',
      search: { redirect: redirectTo },
    })
  }

  try {
    await queryClient.ensureQueryData({
      queryKey: profileQueryKey(session.user.id),
      queryFn: fetchProfile,
      staleTime: PROFILE_STALE_TIME,
    })
  } catch (error) {
    await forceSignOut()

    const removed =
      isAxiosError(error) &&
      (error.response?.status === 401 || error.response?.status === 403)

    throw redirect({
      to: '/sign-in',
      search: {
        redirect: redirectTo,
        ...(removed ? { error: 'account-removed' } : {}),
      },
    })
  }

  return session
}

export async function requireRole(redirectTo: string, ...roles: Role[]) {
  const session = await requireAuth(redirectTo)
  const profile = queryClient.getQueryData(
    profileQueryKey(session.user.id),
  ) as { role: Role } | undefined

  if (!profile || !roles.includes(profile.role)) {
    throw redirect({
      to: profile?.role === 'driver' ? '/driver' : '/my-bookings',
    })
  }

  return profile
}

/** Passenger-facing pages (bookings, tickets). Drivers are sent to the portal. */
export async function requirePassenger(redirectTo: string) {
  const session = await requireAuth(redirectTo)
  const profile = queryClient.getQueryData(
    profileQueryKey(session.user.id),
  ) as { role: Role } | undefined

  if (profile?.role === 'driver') {
    throw redirect({ to: '/driver' })
  }

  return session
}

export function isDriverRegisterPath(pathname: string) {
  return pathname === '/driver/register' || pathname.startsWith('/driver/register/')
}
