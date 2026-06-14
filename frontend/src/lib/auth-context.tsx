import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { Session, User } from '@supabase/supabase-js'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { fetchProfile, profileQueryKey } from '@/lib/api/profile'
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
  isAdmin: boolean
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  const profileQuery = useQuery({
    queryKey: profileQueryKey,
    queryFn: fetchProfile,
    enabled: Boolean(session),
    retry: 2,
  })

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setLoading(false)
      if (nextSession) {
        void queryClient.invalidateQueries({ queryKey: profileQueryKey })
      } else {
        queryClient.removeQueries({ queryKey: profileQueryKey })
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

      const { error } = await supabase.auth.signInWithPassword({ email, password })
      return { error: error?.message ?? null }
    },
    [],
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
    queryClient.removeQueries({ queryKey: profileQueryKey })
  }, [queryClient])

  const refreshProfile = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: profileQueryKey })
  }, [queryClient])

  const profile = profileQuery.data ?? null
  const role = profile?.role ?? null

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      role,
      loading,
      profileLoading: Boolean(session) && profileQuery.isLoading,
      isAdmin: profile?.role === 'admin',
      isDriver: profile?.role === 'driver',
      isPassenger: profile?.role === 'passenger',
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
      profileQuery.isLoading,
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
