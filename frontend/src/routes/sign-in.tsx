import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { AuthField } from '@/components/auth/auth-field'
import {
  AuthAlert,
  AuthDivider,
  AuthLayout,
  AuthLink,
} from '@/components/auth/auth-layout'
import { GoogleAuthButton } from '@/components/auth/google-auth-button'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'
import { resolveSession } from '@/lib/auth-session'
import { getRememberedEmail, setRememberMePreference } from '@/lib/supabase'
import { cn } from '@/lib/utils'

type SignInSearch = {
  redirect?: string
}

export const Route = createFileRoute('/sign-in')({
  validateSearch: (search: Record<string, unknown>): SignInSearch => ({
    redirect: typeof search.redirect === 'string' ? search.redirect : undefined,
  }),
  beforeLoad: async ({ search }) => {
    const session = await resolveSession()

    if (session) {
      throw redirect({ to: search.redirect ?? '/my-bookings' })
    }
  },
  component: SignInPage,
})

function SignInPage() {
  const { redirect } = Route.useSearch()
  const navigate = useNavigate()
  const { signIn, signInWithGoogle, resetPassword, refreshProfile } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  useEffect(() => {
    const rememberedEmail = getRememberedEmail()
    if (rememberedEmail) {
      setEmail(rememberedEmail)
      setRememberMe(true)
    }
  }, [])

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    setSuccess(null)
    setSubmitting(true)

    const result = await signIn(email, password, rememberMe)
    setSubmitting(false)

    if (result.error) {
      setError(result.error)
      return
    }

    await refreshProfile()
    await navigate({ to: redirect ?? '/my-bookings' })
  }

  async function handleForgotPassword(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    setSuccess(null)

    if (!email.trim()) {
      setError('Enter your email address to reset your password.')
      return
    }

    setSubmitting(true)
    const result = await resetPassword(email.trim())
    setSubmitting(false)

    if (result.error) {
      setError(result.error)
      return
    }

    setSuccess('Check your email for a password reset link.')
    setShowForgotPassword(false)
  }

  async function handleGoogleSignIn() {
    setError(null)
    setGoogleLoading(true)
    setRememberMePreference(rememberMe)
    const result = await signInWithGoogle(redirect ?? '/my-bookings')
    setGoogleLoading(false)

    if (result.error) {
      setError(result.error)
    }
  }

  const linkSearch = redirect ? { redirect } : undefined

  return (
    <AuthLayout
      title={showForgotPassword ? 'Reset password' : 'Sign in'}
      subtitle={
        showForgotPassword
          ? 'Enter your email and we’ll send you a reset link.'
          : 'Access your bookings and continue your journey with Crabi.'
      }
      footer={
        <>
          Don&apos;t have an account?{' '}
          <AuthLink to="/sign-up" search={linkSearch}>
            Create one
          </AuthLink>
        </>
      }
    >
      {error && <AuthAlert variant="error">{error}</AuthAlert>}
      {success && <AuthAlert variant="success">{success}</AuthAlert>}

      {showForgotPassword ? (
        <form onSubmit={handleForgotPassword} className="space-y-5">
          <AuthField
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={setEmail}
            autoComplete="email"
            required
          />

          <Button
            type="submit"
            disabled={submitting}
            className="h-11 w-full rounded-full bg-[#0071e3] text-[15px] font-normal hover:bg-[#0077ed]"
          >
            {submitting ? 'Sending link...' : 'Send reset link'}
          </Button>

          <button
            type="button"
            onClick={() => {
              setShowForgotPassword(false)
              setError(null)
            }}
            className="w-full text-center text-[14px] text-[#0066cc] hover:underline"
          >
            Back to sign in
          </button>
        </form>
      ) : (
        <>
          <form onSubmit={handleSubmit} className="space-y-5">
            <AuthField
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={setEmail}
              autoComplete="email"
              required
            />
            <AuthField
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={setPassword}
              autoComplete="current-password"
              required
            />

            <div className="flex items-center justify-between gap-4">
              <label className="inline-flex cursor-pointer items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                  className="size-4 rounded border-[#d2d2d7] text-[#0071e3] focus:ring-[#0071e3]/40"
                />
                <span className="text-[14px] text-[#1d1d1f]">Remember me</span>
              </label>

              <button
                type="button"
                onClick={() => {
                  setShowForgotPassword(true)
                  setError(null)
                  setSuccess(null)
                }}
                className="text-[14px] text-[#0066cc] transition-colors hover:text-[#0077ed] hover:underline"
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className={cn(
                'h-11 w-full rounded-full bg-[#0071e3] text-[15px] font-normal hover:bg-[#0077ed]',
              )}
            >
              {submitting ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <AuthDivider label="or" />

          <GoogleAuthButton
            label="Continue with Google"
            onClick={handleGoogleSignIn}
            disabled={submitting || googleLoading}
          />
        </>
      )}
    </AuthLayout>
  )
}
