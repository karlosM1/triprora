import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { Session, User } from '@supabase/supabase-js'
import { isAxiosError } from 'axios'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { fetchProfile, profileQueryKey } from '@/lib/api/profile'
import {
  getCachedSession,
  setCachedSession,
} from '@/lib/auth-session'
import {
  clearRememberedEmail,
  getAuthRedirectUrl,
  setRememberedEmail,
  setRememberMePreference,
  supabase,
} from '@/lib/supabase'
import type { Profile, Role } from '@/lib/types/profile'

type AuthContextValue = {
  session: Session | null
  user: User | null
  profile: Profile | null
  role: Role | null
  loading: boolean
  profileLoading: boolean
  profileReady: boolean
  isAdmin: boolean
  isSuperAdmin: boolean
  isDriver: boolean
  isPassenger: boolean
  signIn: (
    email: string,
    password: string,
    rememberMe?: boolean,
  ) => Promise<{ error: string | null }>
  signUp: (
    email: string,
    password: string,
    fullName: string,
  ) => Promise<{
    error: string | null
    needsEmailConfirmation: boolean
  }>
  signInWithGoogle: (redirectTo?: string) => Promise<{ error: string | null }>
  resetPassword: (email: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

const PROFILE_STALE_TIME = 1000 * 60 * 5

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [session, setSession] = useState<Session | null>(() => getCachedSession())
  const [loading, setLoading] = useState(() => !getCachedSession())
  const previousUserIdRef = useRef(session?.user?.id ?? null)

  const userId = session?.user?.id ?? null

  const profileQuery = useQuery({
    queryKey: profileQueryKey(userId),
    queryFn: fetchProfile,
    enabled: Boolean(userId),
    retry: false,
    staleTime: PROFILE_STALE_TIME,
  })

  useEffect(() => {
    if (!profileQuery.isError || !userId) return

    const error = profileQuery.error
    if (!isAxiosError(error)) {
      void supabase.auth.signOut()
      queryClient.removeQueries({ queryKey: ['profile'] })
      return
    }

    const status = error.response?.status
    // Any failed profile load with a session means the account is unusable.
    if (status === 401 || status === 403 || status === 404) {
      void supabase.auth.signOut()
      queryClient.removeQueries({ queryKey: ['profile'] })
      setCachedSession(null)
      setSession(null)
    }
  }, [profileQuery.isError, profileQuery.error, userId, queryClient])

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      const previousUserId = previousUserIdRef.current
      const nextUserId = nextSession?.user?.id ?? null

      setCachedSession(nextSession)
      setSession(nextSession)
      setLoading(false)
      previousUserIdRef.current = nextUserId

      if (
        event === 'SIGNED_OUT' ||
        (previousUserId && nextUserId && previousUserId !== nextUserId) ||
        (previousUserId && !nextUserId)
      ) {
        queryClient.removeQueries({ queryKey: ['profile'] })
      }
    })

    return () => subscription.unsubscribe()
  }, [queryClient])

  const signIn = useCallback(
    async (email: string, password: string, rememberMe = true) => {
      setRememberMePreference(rememberMe)

      if (rememberMe) {
        setRememberedEmail(email)
      } else {
        clearRememberedEmail()
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) {
        return { error: error.message }
      }

      // Auth can succeed even after the app profile was deleted. Confirm the
      // profile still exists before treating login as successful.
      try {
        await fetchProfile()
      } catch (profileError) {
        await supabase.auth.signOut()
        queryClient.removeQueries({ queryKey: ['profile'] })

        if (
          isAxiosError(profileError) &&
          profileError.response?.status === 401
        ) {
          return {
            error:
              'This account no longer exists. It may have been removed by an administrator.',
          }
        }

        return {
          error: 'Signed in, but your account profile could not be loaded.',
        }
      }

      if (data.session) {
        setCachedSession(data.session)
        setSession(data.session)
      }

      return { error: null }
    },
    [queryClient],
  )

  const signUp = useCallback(
    async (email: string, password: string, fullName: string) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName.trim() },
          emailRedirectTo: getAuthRedirectUrl('/sign-in'),
        },
      })

      const needsEmailConfirmation = Boolean(
        data.user && !data.session && data.user.identities?.length,
      )

      return {
        error: error?.message ?? null,
        needsEmailConfirmation,
      }
    },
    [],
  )

  const signInWithGoogle = useCallback(async (redirectTo = '/my-bookings') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: getAuthRedirectUrl(redirectTo),
      },
    })
    return { error: error?.message ?? null }
  }, [])

  const resetPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: getAuthRedirectUrl('/sign-in'),
    })
    return { error: error?.message ?? null }
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    queryClient.removeQueries({ queryKey: ['profile'] })
  }, [queryClient])

  const refreshProfile = useCallback(async () => {
    if (!userId) return
    await queryClient.invalidateQueries({ queryKey: profileQueryKey(userId) })
  }, [queryClient, userId])

  const profile = profileQuery.isSuccess ? (profileQuery.data ?? null) : null
  const role = profile?.role ?? null
  const profileReady = Boolean(userId) && profileQuery.isSuccess
  const profileLoading =
    Boolean(userId) && profileQuery.isLoading && !profileQuery.data

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      role,
      loading,
      profileLoading,
      profileReady,
      isAdmin: profileReady && profile?.role === 'admin',
      isSuperAdmin: profileReady && profile?.role === 'superadmin',
      isDriver: profileReady && profile?.role === 'driver',
      isPassenger: profileReady && profile?.role === 'passenger',
      signIn,
      signUp,
      signInWithGoogle,
      resetPassword,
      signOut,
      refreshProfile,
    }),
    [
      session,
      profile,
      role,
      loading,
      profileLoading,
      profileReady,
      signIn,
      signUp,
      signInWithGoogle,
      resetPassword,
      signOut,
      refreshProfile,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
