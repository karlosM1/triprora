import { Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import {
  Car,
  CheckCircle2,
  Clock,
  MapPin,
  Shield,
  Wallet,
  XCircle,
} from 'lucide-react'
import { AuthAlert } from '@/components/auth/auth-layout'
import { DriverRegistrationStepper } from '@/components/driver/driver-registration-stepper'
import {
  AccountInfoStep,
  ContactInfoStep,
  EmergencyContactStep,
  LicenseInfoStep,
  PersonalInfoStep,
  ReviewConsentStep,
  STEP_TITLES,
  VehicleDocumentsStep,
  VehicleInfoStep,
} from '@/components/driver/driver-register-steps'
import { Footer } from '@/components/landing/footer'
import { Header } from '@/components/landing/header'
import { AppleCard, PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import type { DriverRegistrationFormData, DriverRegistrationStep } from '@/lib/types/driver-registration'
import type { DriverApplication } from '@/lib/types/profile'
import { fadeInUp, staggerContainer } from '@/lib/motion'
import { cn } from '@/lib/utils'

const benefits = [
  {
    icon: MapPin,
    title: 'Door-to-door routes',
    description: 'Serve passengers between Aurora and Metro Manila — both directions.',
  },
  {
    icon: Wallet,
    title: 'Earn on your schedule',
    description: 'Publish trips when it works for you and manage bookings in one place.',
  },
  {
    icon: Shield,
    title: 'Verified platform',
    description: 'Every driver is reviewed by our team before going live.',
  },
  {
    icon: Car,
    title: 'Simple trip tools',
    description: 'Create trips, track bookings, and coordinate pickups from the Driver Portal.',
  },
] as const

type DriverRegisterShellProps = {
  children: React.ReactNode
  showBenefits?: boolean
}

function DriverRegisterShell({ children, showBenefits = false }: DriverRegisterShellProps) {
  return (
    <div className="app-page min-h-svh bg-[#f5f5f7]">
      <Header activeLink="driver-register" />

      <main className="mx-auto max-w-[980px] px-6 py-10 lg:px-8 lg:py-14">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className={cn(
            'gap-10',
            showBenefits ? 'lg:grid lg:grid-cols-[1fr_320px] lg:items-start' : '',
          )}
        >
          <motion.div variants={fadeInUp}>{children}</motion.div>

          {showBenefits && (
            <motion.div variants={fadeInUp} className="mt-10 space-y-4 lg:mt-0">
              <p className="text-[13px] font-medium tracking-wide text-[#86868b] uppercase">
                Why drive with Crabr
              </p>
              {benefits.map(({ icon: Icon, title, description }) => (
                <AppleCard key={title} className="p-5">
                  <div className="flex gap-4">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#f0f7ff] text-[#0066cc]">
                      <Icon className="size-5" strokeWidth={1.75} />
                    </div>
                    <div>
                      <p className="text-[15px] font-semibold text-[#1d1d1f]">{title}</p>
                      <p className="mt-1 text-[13px] leading-relaxed text-[#86868b]">
                        {description}
                      </p>
                    </div>
                  </div>
                </AppleCard>
              ))}
            </motion.div>
          )}
        </motion.div>
      </main>

      <Footer />
    </div>
  )
}

function StatusCard({
  icon,
  iconClassName,
  title,
  subtitle,
  children,
  action,
}: {
  icon: React.ReactNode
  iconClassName: string
  title: string
  subtitle: string
  children?: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <DriverRegisterShell>
      <div className="mx-auto max-w-lg">
        <div className="text-center">
          <div
            className={cn(
              'mx-auto flex size-16 items-center justify-center rounded-full',
              iconClassName,
            )}
          >
            {icon}
          </div>
          <PageHeader
            className="mt-6 justify-center text-center sm:flex-col sm:items-center"
            title={title}
            subtitle={subtitle}
          />
        </div>

        {children && (
          <AppleCard className="mt-8 p-6 text-[14px] text-[#86868b]">{children}</AppleCard>
        )}

        {action && <div className="mt-8 flex justify-center">{action}</div>}
      </div>
    </DriverRegisterShell>
  )
}

export function DriverRegisterLoadingPage() {
  return (
    <DriverRegisterShell>
      <p className="text-center text-[15px] text-[#86868b]">Loading…</p>
    </DriverRegisterShell>
  )
}

export function DriverRegisterApprovedPage() {
  return (
    <StatusCard
      icon={<CheckCircle2 className="size-8 text-[#248a3d]" strokeWidth={1.75} />}
      iconClassName="bg-[#f0fdf4]"
      title="You're a driver"
      subtitle="Your account has driver access. Head to the Driver Portal to manage trips and bookings."
      action={
        <Button
          className="h-11 rounded-full bg-[#0071e3] px-6 text-[15px] hover:bg-[#0077ed]"
          asChild
        >
          <Link to="/driver">Open Driver Portal</Link>
        </Button>
      }
    />
  )
}

export function DriverRegisterAdminPage() {
  return (
    <StatusCard
      icon={<Shield className="size-8 text-[#0066cc]" strokeWidth={1.75} />}
      iconClassName="bg-[#f0f7ff]"
      title="Admin account"
      subtitle="Admins manage driver approvals and platform operations from the Admin Portal."
      action={
        <Button
          className="h-11 rounded-full bg-[#0071e3] px-6 text-[15px] hover:bg-[#0077ed]"
          asChild
        >
          <Link to="/admin">Open Admin Portal</Link>
        </Button>
      }
    />
  )
}

function formatApplicantName(application: DriverApplication) {
  return [application.firstName, application.middleName, application.lastName, application.suffix]
    .filter(Boolean)
    .join(' ')
}

export function DriverRegisterPendingPage({
  application,
}: {
  application: DriverApplication
}) {
  return (
    <StatusCard
      icon={<Clock className="size-8 text-[#bf4800]" strokeWidth={1.75} />}
      iconClassName="bg-[#fff8eb]"
      title="Pending verification"
      subtitle="Your driver registration is awaiting admin approval. You'll get access once our team reviews your documents."
    >
      <dl className="space-y-3">
        <DetailRow label="Name" value={formatApplicantName(application)} />
        <DetailRow label="License" value={`${application.licenseNo} (${application.licenseType})`} />
        <DetailRow
          label="Vehicle"
          value={`${application.vehicleMake} ${application.vehicleModel} · ${application.vehiclePlateNumber}`}
        />
        <DetailRow
          label="Submitted"
          value={new Date(application.createdAt).toLocaleDateString(undefined, {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        />
      </dl>
    </StatusCard>
  )
}

export function DriverRegisterRejectedPage({
  application,
  onStartNewRegistration,
}: {
  application: DriverApplication
  onStartNewRegistration: () => void
}) {
  return (
    <StatusCard
      icon={<XCircle className="size-8 text-[#b42318]" strokeWidth={1.75} />}
      iconClassName="bg-[#fef2f2]"
      title="Application not approved"
      subtitle={
        application.adminNotes
          ? application.adminNotes
          : 'Your driver application was not approved. You can submit a new registration with updated information.'
      }
      action={
        <Button
          className="h-11 rounded-full bg-[#0071e3] px-6 text-[15px] hover:bg-[#0077ed]"
          onClick={onStartNewRegistration}
        >
          Start new registration
        </Button>
      }
    />
  )
}

type DriverRegisterFormPageProps = {
  currentStep: DriverRegistrationStep
  form: DriverRegistrationFormData
  userId: string
  error: string | null
  submitting: boolean
  onChange: <K extends keyof DriverRegistrationFormData>(
    key: K,
    value: DriverRegistrationFormData[K],
  ) => void
  onBack: () => void
  onNext: () => void
  onSubmit: () => void
}

export function DriverRegisterFormPage({
  currentStep,
  form,
  userId,
  error,
  submitting,
  onChange,
  onBack,
  onNext,
  onSubmit,
}: DriverRegisterFormPageProps) {
  const stepMeta = STEP_TITLES[currentStep]
  const isFirstStep = currentStep === 1
  const isLastStep = currentStep === 8

  function renderStep() {
    switch (currentStep) {
      case 1:
        return <PersonalInfoStep form={form} userId={userId} onChange={onChange} />
      case 2:
        return <ContactInfoStep form={form} onChange={onChange} />
      case 3:
        return <LicenseInfoStep form={form} userId={userId} onChange={onChange} />
      case 4:
        return <VehicleInfoStep form={form} userId={userId} onChange={onChange} />
      case 5:
        return <VehicleDocumentsStep form={form} userId={userId} onChange={onChange} />
      case 6:
        return <EmergencyContactStep form={form} onChange={onChange} />
      case 7:
        return <AccountInfoStep form={form} />
      case 8:
        return <ReviewConsentStep form={form} onChange={onChange} />
      default:
        return null
    }
  }

  return (
    <DriverRegisterShell showBenefits>
      <PageHeader
        eyebrow="Drive with Crabr"
        title="Become a driver"
        subtitle="Complete each step to submit your application. An admin will review your documents before you can accept bookings."
      />

      <AppleCard className="mt-8 p-6 sm:p-8">
        <DriverRegistrationStepper currentStep={currentStep} />

        <div className="mt-8">
          <h2 className="text-[17px] font-semibold text-[#1d1d1f]">{stepMeta.title}</h2>
          <p className="mt-1 text-[14px] text-[#86868b]">{stepMeta.subtitle}</p>
        </div>

        <div className="mt-6">
          {error && (
            <div className="mb-5">
              <AuthAlert variant="error">{error}</AuthAlert>
            </div>
          )}
          {renderStep()}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={isFirstStep || submitting}
            className="rounded-full border-[#d2d2d7]"
            onClick={onBack}
          >
            Back
          </Button>

          <div className="flex flex-wrap gap-3">
            {isLastStep ? (
              <Button
                type="button"
                disabled={submitting}
                className="rounded-full bg-[#0071e3] px-6 hover:bg-[#0077ed]"
                onClick={onSubmit}
              >
                {submitting ? 'Submitting…' : 'Submit application'}
              </Button>
            ) : (
              <Button
                type="button"
                disabled={submitting}
                className="rounded-full bg-[#0071e3] px-6 hover:bg-[#0077ed]"
                onClick={onNext}
              >
                Continue
              </Button>
            )}
          </div>
        </div>
      </AppleCard>

      <p className="mt-6 text-center text-[13px] text-[#86868b]">
        Already a driver?{' '}
        <Link
          to="/driver"
          className="font-medium text-[#0066cc] transition-colors hover:text-[#0077ed] hover:underline"
        >
          Go to Driver Portal
        </Link>
      </p>
    </DriverRegisterShell>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-[#86868b]">{label}</dt>
      <dd className="text-right font-medium text-[#1d1d1f]">{value}</dd>
    </div>
  )
}
