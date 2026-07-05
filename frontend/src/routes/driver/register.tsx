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
import { useAuth } from '@/lib/auth-context'
import {
  createEmptyDriverRegistrationForm,
  driverRegistrationFormToPayload,
  validateDriverRegistrationStep,
  type DriverRegistrationFormData,
  type DriverRegistrationStep,
} from '@/lib/types/driver-registration'
import { requireAuth } from '@/lib/route-guards'

export const Route = createFileRoute('/driver/register')({
  beforeLoad: async () => {
    await requireAuth('/driver/register')
  },
  component: DriverRegisterRoute,
})

function splitFullName(fullName: string | null | undefined) {
  if (!fullName?.trim()) {
    return { firstName: '', lastName: '' }
  }

  const parts = fullName.trim().split(/\s+/)
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: '' }
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  }
}

function DriverRegisterRoute() {
  const queryClient = useQueryClient()
  const { user, profile, profileLoading } = useAuth()

  const [currentStep, setCurrentStep] = useState<DriverRegistrationStep>(1)
  const [form, setForm] = useState<DriverRegistrationFormData>(() =>
    createEmptyDriverRegistrationForm(),
  )
  const [error, setError] = useState<string | null>(null)
  const [prefilled, setPrefilled] = useState(false)
  const [reapplying, setReapplying] = useState(false)

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
      const { firstName, lastName } = splitFullName(profile.fullName)
      setForm((current) => ({
        ...current,
        email: profile.email,
        phone: profile.phone ?? '',
        firstName,
        lastName,
      }))
      setPrefilled(true)
    }
  }, [profile, prefilled])

  function updateForm<K extends keyof DriverRegistrationFormData>(
    key: K,
    value: DriverRegistrationFormData[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function handleBack() {
    setError(null)
    setCurrentStep((step) => Math.max(1, step - 1) as DriverRegistrationStep)
  }

  function handleNext() {
    setError(null)
    const validationError = validateDriverRegistrationStep(currentStep, form)
    if (validationError) {
      setError(validationError)
      return
    }
    setCurrentStep((step) => Math.min(8, step + 1) as DriverRegistrationStep)
  }

  function handleStartNewRegistration() {
    if (!profile) return

    const { firstName, lastName } = splitFullName(profile.fullName)
    setForm({
      ...createEmptyDriverRegistrationForm(profile.email),
      phone: profile.phone ?? '',
      firstName,
      lastName,
    })
    setCurrentStep(1)
    setError(null)
    setReapplying(true)
  }

  async function handleSubmit() {
    setError(null)
    const validationError = validateDriverRegistrationStep(8, form)
    if (validationError) {
      setError(validationError)
      return
    }

    try {
      await mutation.mutateAsync(driverRegistrationFormToPayload(form))
      setReapplying(false)
    } catch (err) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data
              ?.message
          : null
      setError(message ?? 'Failed to submit application. Please try again.')
    }
  }

  if (profileLoading || !user?.id) {
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

  if (application?.status === 'rejected' && !reapplying) {
    return (
      <DriverRegisterRejectedPage
        application={application}
        onStartNewRegistration={handleStartNewRegistration}
      />
    )
  }

  return (
    <DriverRegisterFormPage
      currentStep={currentStep}
      form={form}
      userId={user.id}
      error={error}
      submitting={mutation.isPending}
      onChange={updateForm}
      onBack={handleBack}
      onNext={handleNext}
      onSubmit={handleSubmit}
    />
  )
}
