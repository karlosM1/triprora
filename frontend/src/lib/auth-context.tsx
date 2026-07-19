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
  detectPasswordRecoveryFromUrl,
  getAuthRedirectUrl,
  isPasswordRecoveryActive,
  setPasswordRecoveryActive,
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
  isPasswordRecovery: boolean
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
  updatePassword: (password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

const PROFILE_STALE_TIME = 1000 * 60 * 5

function readInitialRecoveryState() {
  if (detectPasswordRecoveryFromUrl()) {
    setPasswordRecoveryActive(true)
    return true
  }
  return isPasswordRecoveryActive()
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(() =>
    readInitialRecoveryState(),
  )
  const [session, setSession] = useState<Session | null>(() =>
    isPasswordRecoveryActive() ? null : getCachedSession(),
  )
  const [loading, setLoading] = useState(() => {
    if (isPasswordRecoveryActive()) return true
    return !getCachedSession()
  })
  const previousUserIdRef = useRef(
    isPasswordRecoveryActive() ? null : (getCachedSession()?.user?.id ?? null),
  )

  // Recovery sessions must not look like a normal login (header, APIs, guards).
  useEffect(() => {
    if (!isPasswordRecovery) return
    setCachedSession(null)
    queryClient.removeQueries({ queryKey: ['profile'] })
  }, [isPasswordRecovery, queryClient])

  const userId =
    isPasswordRecovery || !session?.user?.id ? null : session.user.id

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

      if (event === 'PASSWORD_RECOVERY') {
        setPasswordRecoveryActive(true)
        setIsPasswordRecovery(true)
        setCachedSession(null)
        setSession(null)
        setLoading(false)
        previousUserIdRef.current = null
        queryClient.removeQueries({ queryKey: ['profile'] })

        if (window.location.pathname !== '/reset-password') {
          window.location.replace(`${window.location.origin}/reset-password`)
        }
        return
      }

      if (event === 'SIGNED_OUT') {
        setPasswordRecoveryActive(false)
        setIsPasswordRecovery(false)
      }

      // Normal auth events clear recovery mode (e.g. a real sign-in).
      if (
        event === 'SIGNED_IN' &&
        isPasswordRecoveryActive() &&
        window.location.pathname !== '/reset-password'
      ) {
        setPasswordRecoveryActive(false)
        setIsPasswordRecovery(false)
      }

      if (isPasswordRecoveryActive() && event !== 'SIGNED_OUT') {
        setCachedSession(null)
        setSession(null)
        setLoading(false)
        previousUserIdRef.current = null
        return
      }

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

  // If we refreshed mid-recovery, keep Supabase's session for updateUser only.
  useEffect(() => {
    if (!isPasswordRecovery) return

    void supabase.auth.getSession().then(() => {
      setCachedSession(null)
      setSession(null)
      setLoading(false)
    })
  }, [isPasswordRecovery])

  const signIn = useCallback(
    async (email: string, password: string, rememberMe = true) => {
      setPasswordRecoveryActive(false)
      setIsPasswordRecovery(false)
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
      redirectTo: getAuthRedirectUrl('/reset-password'),
    })
    return { error: error?.message ?? null }
  }, [])

  const updatePassword = useCallback(async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password })
    return { error: error?.message ?? null }
  }, [])

  const signOut = useCallback(async () => {
    setPasswordRecoveryActive(false)
    setIsPasswordRecovery(false)
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
      // Mask recovery as logged-out for the rest of the app.
      session: isPasswordRecovery ? null : session,
      user: isPasswordRecovery ? null : (session?.user ?? null),
      profile: isPasswordRecovery ? null : profile,
      role: isPasswordRecovery ? null : role,
      loading,
      profileLoading: isPasswordRecovery ? false : profileLoading,
      profileReady: isPasswordRecovery ? false : profileReady,
      isPasswordRecovery,
      isAdmin: !isPasswordRecovery && profileReady && profile?.role === 'admin',
      isSuperAdmin:
        !isPasswordRecovery &&
        profileReady &&
        profile?.role === 'superadmin',
      isDriver:
        !isPasswordRecovery && profileReady && profile?.role === 'driver',
      isPassenger:
        !isPasswordRecovery && profileReady && profile?.role === 'passenger',
      signIn,
      signUp,
      signInWithGoogle,
      resetPassword,
      updatePassword,
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
      isPasswordRecovery,
      signIn,
      signUp,
      signInWithGoogle,
      resetPassword,
      updatePassword,
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
