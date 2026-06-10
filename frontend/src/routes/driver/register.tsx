import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { AuthField } from '@/components/auth/auth-field'
import { Header } from '@/components/landing/header'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  fetchProfile,
  profileQueryKey,
  submitDriverApplication,
} from '@/lib/api/profile'
import { requireAuth } from '@/lib/route-guards'

export const Route = createFileRoute('/driver/register')({
  beforeLoad: async () => {
    await requireAuth('/driver/register')
  },
  component: DriverRegisterPage,
})

function DriverRegisterPage() {
  const queryClient = useQueryClient()
  const profileQuery = useQuery({
    queryKey: profileQueryKey,
    queryFn: fetchProfile,
  })

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [licenseNo, setLicenseNo] = useState('')
  const [vehicleInfo, setVehicleInfo] = useState('')
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: submitDriverApplication,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: profileQueryKey })
    },
  })

  const profile = profileQuery.data
  const application = profile?.driverApplication

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)

    try {
      await mutation.mutateAsync({
        fullName,
        phone,
        licenseNo,
        vehicleInfo: vehicleInfo || undefined,
      })
    } catch (err) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data
              ?.message
          : null
      setError(message ?? 'Failed to submit application. Please try again.')
    }
  }

  if (profileQuery.isLoading) {
    return (
      <div className="min-h-svh bg-[#F8F9FB]">
        <Header />
        <main className="mx-auto max-w-lg px-6 py-16">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </main>
      </div>
    )
  }

  if (profile?.role === 'driver') {
    return (
      <div className="min-h-svh bg-[#F8F9FB]">
        <Header />
        <main className="mx-auto max-w-lg px-6 py-16">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">You&apos;re a driver</CardTitle>
              <CardDescription>
                Your account has driver access. An admin approved your registration.
              </CardDescription>
            </CardHeader>
          </Card>
        </main>
      </div>
    )
  }

  if (profile?.role === 'admin') {
    return (
      <div className="min-h-svh bg-[#F8F9FB]">
        <Header />
        <main className="mx-auto max-w-lg px-6 py-16">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Admin account</CardTitle>
              <CardDescription>
                Admins manage driver approvals from the admin panel.
              </CardDescription>
            </CardHeader>
          </Card>
        </main>
      </div>
    )
  }

  if (application?.status === 'pending') {
    return (
      <div className="min-h-svh bg-[#F8F9FB]">
        <Header />
        <main className="mx-auto max-w-lg px-6 py-16">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Application pending</CardTitle>
              <CardDescription>
                Your driver registration is awaiting admin approval. You&apos;ll get
                driver access once an admin reviews your application.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>License: {application.licenseNo}</p>
              {application.vehicleInfo && <p>Vehicle: {application.vehicleInfo}</p>}
              <p>Submitted: {new Date(application.createdAt).toLocaleDateString()}</p>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  if (application?.status === 'rejected') {
    return (
      <div className="min-h-svh bg-[#F8F9FB]">
        <Header />
        <main className="mx-auto max-w-lg px-6 py-16">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Application rejected</CardTitle>
              <CardDescription>
                Your driver application was not approved.
                {application.adminNotes
                  ? ` Reason: ${application.adminNotes}`
                  : ' Contact support for more information.'}
              </CardDescription>
            </CardHeader>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-svh bg-[#F8F9FB]">
      <Header />

      <main className="mx-auto max-w-lg px-6 py-16">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Register as a driver</CardTitle>
            <CardDescription>
              Submit your details to apply for driver access. An admin must approve
              your application before you can operate as a driver.
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </p>
              )}

              <AuthField
                label="Full name"
                placeholder="Juan Dela Cruz"
                value={fullName}
                onChange={setFullName}
                required
              />
              <AuthField
                label="Phone"
                type="tel"
                placeholder="+63 912 345 6789"
                value={phone}
                onChange={setPhone}
                required
              />
              <AuthField
                label="Driver's license number"
                placeholder="N01-12-345678"
                value={licenseNo}
                onChange={setLicenseNo}
                required
              />
              <AuthField
                label="Vehicle info (optional)"
                placeholder="Toyota Hiace 2020, plate ABC 1234"
                value={vehicleInfo}
                onChange={setVehicleInfo}
              />
            </CardContent>

            <CardFooter className="flex flex-col gap-4 border-t-0 bg-transparent">
              <Button type="submit" className="w-full" disabled={mutation.isPending}>
                {mutation.isPending ? 'Submitting...' : 'Submit application'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </main>
    </div>
  )
}
