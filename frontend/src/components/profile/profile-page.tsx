import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { format } from 'date-fns'
import { useEffect, useState } from 'react'
import { AuthAlert } from '@/components/auth/auth-layout'
import { AuthField } from '@/components/auth/auth-field'
import { AppleCard, PageHeader } from '@/components/layout/page-header'
import { Footer } from '@/components/landing/footer'
import { Header } from '@/components/landing/header'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { profileQueryKey, updateProfile } from '@/lib/api/profile'
import { useAuth } from '@/lib/auth-context'
import type {
  DriverApplicationStatus,
  Profile,
  Role,
  UpdateProfilePayload,
} from '@/lib/types/profile'
import { todayDateInputValue } from '@/lib/trip-search'
import { cn } from '@/lib/utils'

const roleLabels: Record<Role, string> = {
  passenger: 'Passenger',
  driver: 'Driver',
  admin: 'Admin',
}

const applicationStatusLabels: Record<DriverApplicationStatus, string> = {
  pending: 'Under review',
  approved: 'Approved',
  rejected: 'Not approved',
}

const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
] as const

const datePickerClassName =
  'h-11 rounded-xl bg-white px-4 ring-1 ring-[#d2d2d7] hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]/40'

function getInitials(fullName: string | null, email: string) {
  if (fullName?.trim()) {
    const parts = fullName.trim().split(/\s+/)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return parts[0].slice(0, 2).toUpperCase()
  }

  return (email.split('@')[0] ?? 'U').slice(0, 2).toUpperCase()
}

function profileToForm(profile: Profile): UpdateProfilePayload {
  return {
    fullName: profile.fullName ?? '',
    phone: profile.phone ?? '',
    dateOfBirth: profile.dateOfBirth ?? '',
    gender: profile.gender ?? '',
    nationality: profile.nationality ?? '',
    houseStreet: profile.houseStreet ?? '',
    barangay: profile.barangay ?? '',
    city: profile.city ?? '',
    province: profile.province ?? '',
    zipCode: profile.zipCode ?? '',
    emergencyContactName: profile.emergencyContactName ?? '',
    emergencyContactRelationship: profile.emergencyContactRelationship ?? '',
    emergencyContactPhone: profile.emergencyContactPhone ?? '',
  }
}

function SectionHeading({
  title,
  subtitle,
}: {
  title: string
  subtitle: string
}) {
  return (
    <div>
      <h2 className="text-[20px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">
        {title}
      </h2>
      <p className="mt-1 text-[14px] text-[#86868b]">{subtitle}</p>
    </div>
  )
}

export function ProfilePage() {
  const queryClient = useQueryClient()
  const {
    user,
    profile,
    profileLoading,
    profileReady,
    isDriver,
    isPassenger,
    refreshProfile,
  } = useAuth()

  const [form, setForm] = useState<UpdateProfilePayload>(() => ({
    fullName: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    nationality: '',
    houseStreet: '',
    barangay: '',
    city: '',
    province: '',
    zipCode: '',
    emergencyContactName: '',
    emergencyContactRelationship: '',
    emergencyContactPhone: '',
  }))
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (profile) {
      setForm(profileToForm(profile))
    }
  }, [profile])

  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: async () => {
      if (user?.id) {
        await queryClient.invalidateQueries({ queryKey: profileQueryKey(user.id) })
      }
      await refreshProfile()
      setSuccess('Your profile has been updated.')
      setError(null)
    },
    onError: () => {
      setSuccess(null)
      setError('Unable to save your profile. Please try again.')
    },
  })

  function updateField<K extends keyof UpdateProfilePayload>(
    key: K,
    value: UpdateProfilePayload[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    setSuccess(null)

    if (!form.fullName.trim()) {
      setError('Please enter your full name.')
      return
    }

    mutation.mutate({
      ...form,
      fullName: form.fullName.trim(),
      phone: form.phone.trim(),
      dateOfBirth: form.dateOfBirth.trim(),
      gender: form.gender.trim(),
      nationality: form.nationality.trim(),
      houseStreet: form.houseStreet.trim(),
      barangay: form.barangay.trim(),
      city: form.city.trim(),
      province: form.province.trim(),
      zipCode: form.zipCode.trim(),
      emergencyContactName: form.emergencyContactName.trim(),
      emergencyContactRelationship: form.emergencyContactRelationship.trim(),
      emergencyContactPhone: form.emergencyContactPhone.trim(),
    })
  }

  const application = profile?.driverApplication
  const displayEmail = profile?.email ?? user?.email ?? ''
  const initials = getInitials(profile?.fullName ?? null, displayEmail)
  const memberSince = profile?.createdAt
    ? format(new Date(profile.createdAt), 'MMMM yyyy')
    : null

  return (
    <div className="app-page min-h-svh bg-[#f5f5f7]">
      <Header activeLink="profile" />

      <main className="mx-auto max-w-[980px] px-6 py-10 lg:px-8 lg:py-14">
        <PageHeader
          eyebrow="Account"
          title="Profile"
          subtitle="Manage your personal details, address, and emergency contact."
        />

        {profileLoading && !profile ? (
          <p className="mt-12 text-[15px] text-[#86868b]">Loading profile...</p>
        ) : (
          <div className="mt-12 space-y-8">
            <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
              <AppleCard className="p-6">
                <div className="flex flex-col items-center text-center">
                  <Avatar size="lg" className="size-20">
                    <AvatarFallback className="bg-[#0071e3] text-[22px] font-semibold text-white">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <p className="mt-4 text-[17px] font-semibold text-[#1d1d1f]">
                    {profile?.fullName?.trim() || 'Your account'}
                  </p>
                  <p className="mt-1 text-[14px] text-[#86868b]">{displayEmail}</p>
                  {memberSince && (
                    <p className="mt-2 text-[13px] text-[#86868b]">
                      Member since {memberSince}
                    </p>
                  )}
                  {profileReady && profile && (
                    <span
                      className={cn(
                        'mt-4 inline-flex rounded-full px-3 py-1 text-[12px] font-medium',
                        profile.role === 'admin' && 'bg-[#f0f7ff] text-[#0066cc]',
                        profile.role === 'driver' && 'bg-[#f0fdf4] text-[#15803d]',
                        profile.role === 'passenger' && 'bg-[#f5f5f7] text-[#1d1d1f]',
                      )}
                    >
                      {roleLabels[profile.role]}
                    </span>
                  )}
                </div>
              </AppleCard>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && <AuthAlert variant="error">{error}</AuthAlert>}
                {success && <AuthAlert variant="success">{success}</AuthAlert>}

                <AppleCard className="p-6 sm:p-8">
                  <SectionHeading
                    title="Personal information"
                    subtitle="Your name and contact details for bookings and trip updates."
                  />

                  <div className="mt-8 space-y-5">
                    <AuthField
                      label="Full name"
                      value={form.fullName}
                      onChange={(value) => updateField('fullName', value)}
                      autoComplete="name"
                      required
                    />

                    <AuthField
                      label="Phone number"
                      type="tel"
                      value={form.phone}
                      onChange={(value) => updateField('phone', value)}
                      autoComplete="tel"
                      placeholder="+63 912 345 6789"
                    />

                    <div className="grid gap-5 sm:grid-cols-2">
                      <div className="block">
                        <span className="mb-2 block text-[13px] font-medium text-[#1d1d1f]">
                          Date of birth
                        </span>
                        <DatePicker
                          value={form.dateOfBirth}
                          onChange={(value) => updateField('dateOfBirth', value)}
                          max={todayDateInputValue()}
                          placeholder="Select date"
                          captionLayout="dropdown"
                          className={datePickerClassName}
                        />
                      </div>

                      <div className="block">
                        <span className="mb-2 block text-[13px] font-medium text-[#1d1d1f]">
                          Gender
                        </span>
                        <Select
                          value={form.gender || undefined}
                          onValueChange={(value) => updateField('gender', value)}
                        >
                          <SelectTrigger
                            className={cn(
                              '!h-11 min-h-11 w-full rounded-xl border-0 bg-white px-4 py-0 text-[15px] text-[#1d1d1f] shadow-none ring-1 ring-[#d2d2d7]',
                              'focus-visible:border-0 focus-visible:ring-2 focus-visible:ring-[#0071e3]/40',
                              !form.gender && 'text-[#86868b]',
                            )}
                          >
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-[#d2d2d7]">
                            {GENDER_OPTIONS.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                                className="text-[15px]"
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <AuthField
                      label="Nationality"
                      value={form.nationality}
                      onChange={(value) => updateField('nationality', value)}
                      placeholder="Filipino"
                    />
                  </div>
                </AppleCard>

                <AppleCard className="p-6 sm:p-8">
                  <SectionHeading
                    title="Home address"
                    subtitle="Used as your default location for pickup and drop-off."
                  />

                  <div className="mt-8 space-y-5">
                    <AuthField
                      label="House no. / Street"
                      value={form.houseStreet}
                      onChange={(value) => updateField('houseStreet', value)}
                      autoComplete="street-address"
                      placeholder="123 Rizal Street"
                    />

                    <div className="grid gap-5 sm:grid-cols-2">
                      <AuthField
                        label="Barangay"
                        value={form.barangay}
                        onChange={(value) => updateField('barangay', value)}
                      />
                      <AuthField
                        label="City / Municipality"
                        value={form.city}
                        onChange={(value) => updateField('city', value)}
                        autoComplete="address-level2"
                      />
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <AuthField
                        label="Province"
                        value={form.province}
                        onChange={(value) => updateField('province', value)}
                        autoComplete="address-level1"
                      />
                      <AuthField
                        label="ZIP code"
                        value={form.zipCode}
                        onChange={(value) => updateField('zipCode', value)}
                        autoComplete="postal-code"
                        placeholder="3200"
                      />
                    </div>
                  </div>
                </AppleCard>

                <AppleCard className="p-6 sm:p-8">
                  <SectionHeading
                    title="Emergency contact"
                    subtitle="Someone we can reach if needed during your trip."
                  />

                  <div className="mt-8 space-y-5">
                    <AuthField
                      label="Contact name"
                      value={form.emergencyContactName}
                      onChange={(value) => updateField('emergencyContactName', value)}
                      autoComplete="name"
                    />

                    <div className="grid gap-5 sm:grid-cols-2">
                      <AuthField
                        label="Relationship"
                        value={form.emergencyContactRelationship}
                        onChange={(value) =>
                          updateField('emergencyContactRelationship', value)
                        }
                        placeholder="Spouse, parent, sibling..."
                      />
                      <AuthField
                        label="Contact phone"
                        type="tel"
                        value={form.emergencyContactPhone}
                        onChange={(value) => updateField('emergencyContactPhone', value)}
                        autoComplete="tel"
                        placeholder="+63 912 345 6789"
                      />
                    </div>
                  </div>
                </AppleCard>

                <Button
                  type="submit"
                  disabled={mutation.isPending}
                  className="h-11 rounded-full bg-[#0071e3] px-6 text-[14px] font-normal text-white hover:bg-[#0077ed]"
                >
                  {mutation.isPending ? 'Saving...' : 'Save changes'}
                </Button>
              </form>
            </div>

            {application && (
              <AppleCard className="p-6 sm:p-8">
                <h2 className="text-[20px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">
                  Driver application
                </h2>
                <p className="mt-1 text-[14px] text-[#86868b]">
                  Status of your application to drive with Crabr.
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <span
                    className={cn(
                      'inline-flex rounded-full px-3 py-1 text-[12px] font-medium',
                      application.status === 'pending' && 'bg-[#fff8eb] text-[#b45309]',
                      application.status === 'approved' && 'bg-[#f0fdf4] text-[#15803d]',
                      application.status === 'rejected' && 'bg-[#fff2f2] text-[#bf4800]',
                    )}
                  >
                    {applicationStatusLabels[application.status]}
                  </span>
                  {application.status === 'rejected' && application.adminNotes && (
                    <p className="text-[14px] text-[#86868b]">{application.adminNotes}</p>
                  )}
                </div>

                {application.status === 'rejected' && (
                  <Button
                    asChild
                    variant="outline"
                    className="mt-6 h-10 rounded-full px-5 text-[14px]"
                  >
                    <Link to="/driver/register">Reapply as a driver</Link>
                  </Button>
                )}
              </AppleCard>
            )}

            {isPassenger && !application && (
              <AppleCard className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
                <div>
                  <h2 className="text-[20px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">
                    Become a driver
                  </h2>
                  <p className="mt-1 text-[14px] text-[#86868b]">
                    Share your van routes between Aurora and Metro Manila.
                  </p>
                </div>
                <Button
                  asChild
                  className="h-10 shrink-0 rounded-full bg-[#0071e3] px-5 text-[14px] font-normal text-white hover:bg-[#0077ed]"
                >
                  <Link to="/driver/register">Apply now</Link>
                </Button>
              </AppleCard>
            )}

            {isDriver && (
              <AppleCard className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
                <div>
                  <h2 className="text-[20px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">
                    Driver portal
                  </h2>
                  <p className="mt-1 text-[14px] text-[#86868b]">
                    Manage trips, schedules, and your vehicle details.
                  </p>
                </div>
                <Button
                  asChild
                  variant="outline"
                  className="h-10 shrink-0 rounded-full px-5 text-[14px]"
                >
                  <Link to="/driver">Open portal</Link>
                </Button>
              </AppleCard>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
