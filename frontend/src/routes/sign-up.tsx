import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
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
import { setRememberMePreference } from '@/lib/supabase'
import { cn } from '@/lib/utils'

type SignUpSearch = {
  redirect?: string
}

export const Route = createFileRoute('/sign-up')({
  validateSearch: (search: Record<string, unknown>): SignUpSearch => ({
    redirect: typeof search.redirect === 'string' ? search.redirect : undefined,
  }),
  beforeLoad: async ({ search }) => {
    const session = await resolveSession()

    if (session) {
      throw redirect({ to: search.redirect ?? '/my-bookings' })
    }
  },
  component: SignUpPage,
})

function SignUpPage() {
  const { redirect } = Route.useSearch()
  const navigate = useNavigate()
  const { signUp, signInWithGoogle } = useAuth()
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    setSuccess(null)

    if (!fullName.trim()) {
      setError('Please enter your full name.')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setSubmitting(true)
    const result = await signUp(email, password, fullName.trim())
    setSubmitting(false)

    if (result.error) {
      setError(result.error)
      return
    }

    if (result.needsEmailConfirmation) {
      setSuccess('Check your email to confirm your account, then sign in.')
      return
    }

    await navigate({ to: redirect ?? '/my-bookings' })
  }

  async function handleGoogleSignUp() {
    setError(null)
    setGoogleLoading(true)
    setRememberMePreference(true)
    const result = await signInWithGoogle(redirect ?? '/my-bookings')
    setGoogleLoading(false)

    if (result.error) {
      setError(result.error)
    }
  }

  const linkSearch = redirect ? { redirect } : undefined

  return (
    <AuthLayout
      title="Create account"
      subtitle="Register to book door-to-door vans between Aurora and Metro Manila, both ways."
      footer={
        <>
          Already have an account?{' '}
          <AuthLink to="/sign-in" search={linkSearch}>
            Sign in
          </AuthLink>
        </>
      }
    >
      {error && <AuthAlert variant="error">{error}</AuthAlert>}
      {success && <AuthAlert variant="success">{success}</AuthAlert>}

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
          label="Full name"
          type="text"
          placeholder="Your full name"
          value={fullName}
          onChange={setFullName}
          autoComplete="name"
          required
        />
        <AuthField
          label="Password"
          type="password"
          placeholder="At least 8 characters"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          required
        />

        <Button
          type="submit"
          disabled={submitting}
          className={cn(
            'h-11 w-full rounded-full bg-[#0071e3] text-[15px] font-normal hover:bg-[#0077ed]',
          )}
        >
          {submitting ? 'Creating account...' : 'Create account'}
        </Button>
      </form>

      <AuthDivider label="or" />

      <GoogleAuthButton
        label="Sign up with Google"
        onClick={handleGoogleSignUp}
        disabled={submitting || googleLoading}
      />
    </AuthLayout>
  )
}
