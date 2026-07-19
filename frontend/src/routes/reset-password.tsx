import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { AuthField } from '@/components/auth/auth-field'
import { AuthAlert, AuthLayout, AuthLink } from '@/components/auth/auth-layout'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/reset-password')({
  component: ResetPasswordPage,
})

function ResetPasswordPage() {
  const navigate = useNavigate()
  const { session, loading, updatePassword, signOut } = useAuth()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (loading) return
    setReady(true)
  }, [loading])

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (!session) {
      setError('This reset link is invalid or has expired. Request a new one.')
      return
    }

    setSubmitting(true)
    const result = await updatePassword(password)
    setSubmitting(false)

    if (result.error) {
      setError(result.error)
      return
    }

    await signOut()
    await navigate({
      to: '/sign-in',
      search: { reset: 'success' },
    })
  }

  if (!ready) {
    return (
      <AuthLayout
        title="Set new password"
        subtitle="Preparing your secure reset session…"
        footer={
          <>
            Remember your password? <AuthLink to="/sign-in">Sign in</AuthLink>
          </>
        }
      >
        <p className="text-center text-[14px] text-[#86868b]">Loading…</p>
      </AuthLayout>
    )
  }

  if (!session) {
    return (
      <AuthLayout
        title="Link expired"
        subtitle="This password reset link is invalid or has expired."
        footer={
          <>
            <AuthLink to="/sign-in">Back to sign in</AuthLink>
          </>
        }
      >
        <AuthAlert variant="error">
          Request a new reset link from the sign-in page and try again.
        </AuthAlert>
        <Button
          type="button"
          onClick={() => navigate({ to: '/sign-in' })}
          className="h-11 w-full rounded-full bg-[#0071e3] text-[15px] font-normal hover:bg-[#0077ed]"
        >
          Go to sign in
        </Button>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Set new password"
      subtitle="Choose a new password for your Crabr account."
      footer={
        <>
          Remember your password? <AuthLink to="/sign-in">Sign in</AuthLink>
        </>
      }
    >
      {error && <AuthAlert variant="error">{error}</AuthAlert>}

      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthField
          label="New password"
          type="password"
          placeholder="At least 8 characters"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          required
          minLength={8}
        />
        <AuthField
          label="Confirm password"
          type="password"
          placeholder="Re-enter your new password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          autoComplete="new-password"
          required
          minLength={8}
        />

        <Button
          type="submit"
          disabled={submitting}
          className={cn(
            'h-11 w-full rounded-full bg-[#0071e3] text-[15px] font-normal hover:bg-[#0077ed]',
          )}
        >
          {submitting ? 'Updating password...' : 'Update password'}
        </Button>
      </form>
    </AuthLayout>
  )
}
