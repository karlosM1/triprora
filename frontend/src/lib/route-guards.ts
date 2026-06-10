import { redirect } from '@tanstack/react-router'
import { fetchProfile } from '@/lib/api/profile'
import { supabase } from '@/lib/supabase'
import type { Role } from '@/lib/types/profile'

export async function requireAuth(redirectTo: string) {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    throw redirect({
      to: '/sign-in',
      search: { redirect: redirectTo },
    })
  }

  return session
}

export async function requireRole(redirectTo: string, ...roles: Role[]) {
  await requireAuth(redirectTo)
  const profile = await fetchProfile()

  if (!roles.includes(profile.role)) {
    throw redirect({ to: '/my-bookings' })
  }

  return profile
}
