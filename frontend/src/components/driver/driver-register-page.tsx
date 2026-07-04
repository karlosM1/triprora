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
import { AuthField } from '@/components/auth/auth-field'
import { AuthAlert } from '@/components/auth/auth-layout'
import { Footer } from '@/components/landing/footer'
import { Header } from '@/components/landing/header'
import { AppleCard, PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
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
                Why drive with Crabi
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

export function DriverRegisterPendingPage({
  application,
}: {
  application: DriverApplication
}) {
  return (
    <StatusCard
      icon={<Clock className="size-8 text-[#bf4800]" strokeWidth={1.75} />}
      iconClassName="bg-[#fff8eb]"
      title="Application under review"
      subtitle="Your driver registration is awaiting admin approval. You'll get access once our team reviews your details."
    >
      <dl className="space-y-3">
        <DetailRow label="License" value={application.licenseNo} />
        {application.vehicleInfo && (
          <DetailRow label="Vehicle" value={application.vehicleInfo} />
        )}
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
}: {
  application: DriverApplication
}) {
  return (
    <StatusCard
      icon={<XCircle className="size-8 text-[#b42318]" strokeWidth={1.75} />}
      iconClassName="bg-[#fef2f2]"
      title="Application not approved"
      subtitle={
        application.adminNotes
          ? application.adminNotes
          : 'Your driver application was not approved. Contact support if you have questions.'
      }
    />
  )
}

type DriverRegisterFormPageProps = {
  fullName: string
  phone: string
  licenseNo: string
  vehicleInfo: string
  error: string | null
  submitting: boolean
  profileEmail?: string | null
  onFullNameChange: (value: string) => void
  onPhoneChange: (value: string) => void
  onLicenseNoChange: (value: string) => void
  onVehicleInfoChange: (value: string) => void
  onSubmit: (event: React.FormEvent) => void
}

export function DriverRegisterFormPage({
  fullName,
  phone,
  licenseNo,
  vehicleInfo,
  error,
  submitting,
  profileEmail,
  onFullNameChange,
  onPhoneChange,
  onLicenseNoChange,
  onVehicleInfoChange,
  onSubmit,
}: DriverRegisterFormPageProps) {
  return (
    <DriverRegisterShell showBenefits>
      <PageHeader
        eyebrow="Drive with Crabi"
        title="Become a driver"
        subtitle="Apply to join our verified driver network. An admin will review your application before you can publish trips."
      />

      {profileEmail && (
        <p className="mt-4 text-[14px] text-[#86868b]">
          Applying as{' '}
          <span className="font-medium text-[#1d1d1f]">{profileEmail}</span>
        </p>
      )}

      <AppleCard className="mt-8 p-6 sm:p-8">
        <h2 className="text-[17px] font-semibold text-[#1d1d1f]">Your details</h2>
        <p className="mt-1 text-[14px] text-[#86868b]">
          Provide accurate information so we can verify your application quickly.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-5">
          {error && <AuthAlert variant="error">{error}</AuthAlert>}

          <AuthField
            label="Full name"
            placeholder="Juan Dela Cruz"
            value={fullName}
            onChange={onFullNameChange}
            autoComplete="name"
            required
          />
          <AuthField
            label="Phone"
            type="tel"
            placeholder="+63 912 345 6789"
            value={phone}
            onChange={onPhoneChange}
            autoComplete="tel"
            required
          />
          <AuthField
            label="Driver's license number"
            placeholder="N01-12-345678"
            value={licenseNo}
            onChange={onLicenseNoChange}
            required
          />
          <AuthField
            label="Vehicle info (optional)"
            placeholder="Toyota Hiace 2020, plate ABC 1234"
            value={vehicleInfo}
            onChange={onVehicleInfoChange}
          />

          <Button
            type="submit"
            disabled={submitting}
            className="h-11 w-full rounded-full bg-[#0071e3] text-[15px] font-normal hover:bg-[#0077ed]"
          >
            {submitting ? 'Submitting…' : 'Submit application'}
          </Button>
        </form>
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