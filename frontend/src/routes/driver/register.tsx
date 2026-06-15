import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import {
  DriverRegisterAdminPage,
  DriverRegisterApprovedPage,
  DriverRegisterFormPage,
  DriverRegisterLoadingPage,
  DriverRegisterPendingPage,
  DriverRegisterRejectedPage,
} from '@/components/driver/driver-register-page'
import {
  profileQueryKey,
  submitDriverApplication,
} from '@/lib/api/profile'
import { requireAuth } from '@/lib/route-guards'
import { useAuth } from '@/lib/auth-context'

export const Route = createFileRoute('/driver/register')({
  beforeLoad: async () => {
    await requireAuth('/driver/register')
  },
  component: DriverRegisterRoute,
})

function DriverRegisterRoute() {
  const queryClient = useQueryClient()
  const { user, profile, profileLoading } = useAuth()

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [licenseNo, setLicenseNo] = useState('')
  const [vehicleInfo, setVehicleInfo] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [prefilled, setPrefilled] = useState(false)

  const mutation = useMutation({
    mutationFn: submitDriverApplication,
    onSuccess: async () => {
      if (user?.id) {
        await queryClient.invalidateQueries({ queryKey: profileQueryKey(user.id) })
      }
    },
  })

  const application = profile?.driverApplication

  useEffect(() => {
    if (profile && !prefilled) {
      setFullName(profile.fullName ?? '')
      setPhone(profile.phone ?? '')
      setPrefilled(true)
    }
  }, [profile, prefilled])

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

  if (profileLoading) {
    return <DriverRegisterLoadingPage />
  }

  if (profile?.role === 'driver') {
    return <DriverRegisterApprovedPage />
  }

  if (profile?.role === 'admin') {
    return <DriverRegisterAdminPage />
  }

  if (application?.status === 'pending') {
    return <DriverRegisterPendingPage application={application} />
  }

  if (application?.status === 'rejected') {
    return <DriverRegisterRejectedPage application={application} />
  }

  return (
    <DriverRegisterFormPage
      fullName={fullName}
      phone={phone}
      licenseNo={licenseNo}
      vehicleInfo={vehicleInfo}
      error={error}
      submitting={mutation.isPending}
      profileEmail={profile?.email}
      onFullNameChange={setFullName}
      onPhoneChange={setPhone}
      onLicenseNoChange={setLicenseNo}
      onVehicleInfoChange={setVehicleInfo}
      onSubmit={handleSubmit}
    />
  )
}
