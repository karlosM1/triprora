import { Link } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  CalendarDays,
  Car,
  ClipboardCheck,
  Ticket,
  Users,
} from 'lucide-react'
import { useState } from 'react'
import { DocumentLink } from '@/components/driver/document-link'
import { AppleCard, PageHeader, SectionTitle } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import {
  adminBookingsQueryKey,
  adminStatsQueryKey,
  adminTripsQueryKey,
  adminUsersQueryKey,
  fetchAdminBookings,
  fetchAdminStats,
  fetchAdminTrips,
  fetchAdminUsers,
  type AdminBooking,
  type AdminTrip,
  type AdminUser,
} from '@/lib/api/admin'
import {
  fetchPendingDriverApplications,
  pendingApplicationsQueryKey,
  reviewDriverApplication,
} from '@/lib/api/profile'
import { useAuth } from '@/lib/auth-context'
import { fadeInUp, staggerContainer } from '@/lib/motion'
import { cn } from '@/lib/utils'

function StatCard({
  title,
  value,
  footer,
  icon: Icon,
}: {
  title: string
  value: string
  footer: string
  icon: typeof Users
}) {
  return (
    <AppleCard className="p-6">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[13px] font-medium text-[#86868b]">{title}</p>
        <Icon className="size-4 shrink-0 text-[#86868b]" strokeWidth={1.75} />
      </div>
      <p className="mt-2 text-[32px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">
        {value}
      </p>
      <p className="mt-1 text-[13px] text-[#86868b]">{footer}</p>
    </AppleCard>
  )
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <AppleCard className="border border-dashed border-[#d2d2d7] bg-transparent px-6 py-14 text-center">
      <p className="text-[17px] font-semibold text-[#1d1d1f]">{title}</p>
      <p className="mx-auto mt-2 max-w-sm text-[15px] text-[#86868b]">{description}</p>
    </AppleCard>
  )
}

function StatusPill({
  label,
  variant,
}: {
  label: string
  variant: 'success' | 'warning' | 'danger' | 'default' | 'muted'
}) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-3 py-1 text-[12px] font-medium',
        variant === 'success' && 'bg-[#f0fdf4] text-[#248a3d]',
        variant === 'warning' && 'bg-[#fff8eb] text-[#bf4800]',
        variant === 'danger' && 'bg-[#fef2f2] text-[#b42318]',
        variant === 'default' && 'bg-[#f0f7ff] text-[#0066cc]',
        variant === 'muted' && 'bg-[#f5f5f7] text-[#86868b]',
      )}
    >
      {label}
    </span>
  )
}

function tripStatusVariant(status: AdminTrip['status']) {
  if (status === 'published') return 'success' as const
  if (status === 'completed') return 'default' as const
  if (status === 'draft') return 'warning' as const
  return 'danger' as const
}

function bookingStatusVariant(status: AdminBooking['status']) {
  if (status === 'confirmed') return 'success' as const
  if (status === 'completed') return 'default' as const
  return 'danger' as const
}

function roleVariant(role: AdminUser['role']) {
  if (role === 'admin') return 'default' as const
  if (role === 'driver') return 'success' as const
  return 'muted' as const
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function ApplicationSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div>
      <p className="text-[12px] font-semibold tracking-wide text-[#86868b] uppercase">
        {title}
      </p>
      <dl className="mt-2 space-y-2">{children}</dl>
    </div>
  )
}

function ApplicationRow({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  if (!value) return null

  return (
    <div className="flex justify-between gap-4 text-[13px]">
      <dt className="text-[#86868b]">{label}</dt>
      <dd className="text-right font-medium text-[#1d1d1f]">{value}</dd>
    </div>
  )
}

export function AdminDashboardPage() {
  const { profile } = useAuth()
  const statsQuery = useQuery({
    queryKey: adminStatsQueryKey,
    queryFn: fetchAdminStats,
  })
  const stats = statsQuery.data
  const firstName = profile?.fullName?.split(' ')[0] ?? 'Admin'

  return (
    <motion.div
      className="space-y-12"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      <motion.div variants={fadeInUp}>
        <PageHeader
          eyebrow="Admin portal"
          title={`Welcome, ${firstName}.`}
          subtitle="Monitor platform activity, review driver applications, and manage trips and bookings across Aurora ↔ Metro Manila."
        />
      </motion.div>

      {statsQuery.isLoading ? (
        <p className="text-[15px] text-[#86868b]">Loading overview...</p>
      ) : stats ? (
        <>
          <motion.div
            variants={fadeInUp}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            <StatCard
              title="Total users"
              value={String(stats.totalUsers)}
              footer={`${stats.totalPassengers} passengers · ${stats.totalDrivers} drivers`}
              icon={Users}
            />
            <StatCard
              title="Pending approvals"
              value={String(stats.pendingApplications)}
              footer="Driver applications awaiting review"
              icon={ClipboardCheck}
            />
            <StatCard
              title="Active trips"
              value={String(stats.publishedTrips)}
              footer={`${stats.draftTrips} drafts in progress`}
              icon={Car}
            />
            <StatCard
              title="Bookings"
              value={String(stats.totalBookings)}
              footer={`${stats.confirmedBookings} confirmed`}
              icon={Ticket}
            />
          </motion.div>

          <motion.div variants={fadeInUp}>
            <SectionTitle
              title="Quick actions"
              subtitle="Jump to the most common admin tasks."
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Link to="/admin/drivers">
                <AppleCard className="group p-6 transition-shadow hover:shadow-md">
                  <div className="flex items-center gap-4">
                    <div className="flex size-11 items-center justify-center rounded-xl bg-[#f0f7ff] text-[#0066cc]">
                      <ClipboardCheck className="size-5" strokeWidth={1.75} />
                    </div>
                    <div>
                      <p className="text-[17px] font-semibold text-[#1d1d1f] group-hover:text-[#0066cc]">
                        Review driver applications
                      </p>
                      <p className="text-[13px] text-[#86868b]">
                        {stats.pendingApplications} pending
                      </p>
                    </div>
                  </div>
                </AppleCard>
              </Link>
              <Link to="/admin/trips">
                <AppleCard className="group p-6 transition-shadow hover:shadow-md">
                  <div className="flex items-center gap-4">
                    <div className="flex size-11 items-center justify-center rounded-xl bg-[#f0fdf4] text-[#248a3d]">
                      <Car className="size-5" strokeWidth={1.75} />
                    </div>
                    <div>
                      <p className="text-[17px] font-semibold text-[#1d1d1f] group-hover:text-[#0066cc]">
                        Manage fleet & trips
                      </p>
                      <p className="text-[13px] text-[#86868b]">
                        {stats.publishedTrips} published trips
                      </p>
                    </div>
                  </div>
                </AppleCard>
              </Link>
              <Link to="/admin/bookings">
                <AppleCard className="group p-6 transition-shadow hover:shadow-md">
                  <div className="flex items-center gap-4">
                    <div className="flex size-11 items-center justify-center rounded-xl bg-[#fff8eb] text-[#bf4800]">
                      <CalendarDays className="size-5" strokeWidth={1.75} />
                    </div>
                    <div>
                      <p className="text-[17px] font-semibold text-[#1d1d1f] group-hover:text-[#0066cc]">
                        View all bookings
                      </p>
                      <p className="text-[13px] text-[#86868b]">
                        {stats.totalBookings} total reservations
                      </p>
                    </div>
                  </div>
                </AppleCard>
              </Link>
              <Link to="/admin/users">
                <AppleCard className="group p-6 transition-shadow hover:shadow-md">
                  <div className="flex items-center gap-4">
                    <div className="flex size-11 items-center justify-center rounded-xl bg-[#f5f5f7] text-[#1d1d1f]">
                      <Users className="size-5" strokeWidth={1.75} />
                    </div>
                    <div>
                      <p className="text-[17px] font-semibold text-[#1d1d1f] group-hover:text-[#0066cc]">
                        Browse user accounts
                      </p>
                      <p className="text-[13px] text-[#86868b]">
                        {stats.totalUsers} registered users
                      </p>
                    </div>
                  </div>
                </AppleCard>
              </Link>
            </div>
          </motion.div>
        </>
      ) : (
        <EmptyState
          title="Unable to load stats"
          description="Please refresh the page or try again in a moment."
        />
      )}
    </motion.div>
  )
}

export function AdminDriversPage() {
  const queryClient = useQueryClient()
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [actionError, setActionError] = useState<string | null>(null)

  const applicationsQuery = useQuery({
    queryKey: pendingApplicationsQueryKey,
    queryFn: fetchPendingDriverApplications,
  })

  const reviewMutation = useMutation({
    mutationFn: ({
      id,
      status,
      adminNotes,
    }: {
      id: string
      status: 'approved' | 'rejected'
      adminNotes?: string
    }) => reviewDriverApplication(id, { status, adminNotes }),
    onSuccess: async () => {
      setActionError(null)
      await queryClient.invalidateQueries({ queryKey: pendingApplicationsQueryKey })
      await queryClient.invalidateQueries({ queryKey: adminStatsQueryKey })
      await queryClient.invalidateQueries({ queryKey: adminUsersQueryKey })
      await queryClient.invalidateQueries({ queryKey: ['profile', 'me'] })
    },
    onError: () => {
      setActionError('Failed to update application. Please try again.')
    },
  })

  const applications = applicationsQuery.data ?? []

  return (
    <motion.div
      className="space-y-10"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      <motion.div variants={fadeInUp}>
        <PageHeader
          eyebrow="Admin portal"
          title="Driver approvals"
          subtitle="Review and approve driver registration requests. Only admins can grant driver access."
        />
      </motion.div>

      {actionError && (
        <motion.p
          variants={fadeInUp}
          className="rounded-xl border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-[14px] text-[#b42318]"
        >
          {actionError}
        </motion.p>
      )}

      <motion.div variants={fadeInUp} className="space-y-4">
        {applicationsQuery.isLoading ? (
          <p className="text-[15px] text-[#86868b]">Loading applications...</p>
        ) : applications.length === 0 ? (
          <EmptyState
            title="No pending applications"
            description="New driver registrations will appear here for your review."
          />
        ) : (
          applications.map((application) => {
            const applicantName =
              [application.firstName, application.middleName, application.lastName, application.suffix]
                .filter(Boolean)
                .join(' ') ||
              application.applicant.fullName ||
              application.applicant.email

            return (
            <AppleCard key={application.id} className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-[17px] font-semibold text-[#1d1d1f]">
                    {applicantName}
                  </p>
                  <p className="mt-1 text-[14px] text-[#86868b]">
                    {application.applicant.email}
                    {application.applicant.phone
                      ? ` · ${application.applicant.phone}`
                      : ''}
                  </p>
                </div>
                <StatusPill label="Pending verification" variant="warning" />
              </div>

              <div className="mt-5 grid gap-6 lg:grid-cols-2">
                <ApplicationSection title="Personal">
                  <ApplicationRow label="Date of birth" value={application.dateOfBirth} />
                  <ApplicationRow label="Gender" value={application.gender} />
                  <ApplicationRow label="Nationality" value={application.nationality} />
                  {application.profilePhotoUrl && (
                    <ApplicationRow
                      label="Profile photo"
                      value={<DocumentLink href={application.profilePhotoUrl} label="View photo" />}
                    />
                  )}
                </ApplicationSection>

                <ApplicationSection title="Address">
                  <ApplicationRow
                    label="Home address"
                    value={`${application.houseStreet}, ${application.barangay}, ${application.city}, ${application.province} ${application.zipCode}`}
                  />
                </ApplicationSection>

                <ApplicationSection title="License">
                  <ApplicationRow label="License number" value={application.licenseNo} />
                  <ApplicationRow label="Type / restriction" value={application.licenseType} />
                  <ApplicationRow label="Expiration" value={application.licenseExpiration} />
                  <ApplicationRow
                    label="Documents"
                    value={
                      <span className="flex flex-wrap justify-end gap-3">
                        <DocumentLink href={application.licenseFrontUrl} label="Front" />
                        <DocumentLink href={application.licenseBackUrl} label="Back" />
                      </span>
                    }
                  />
                </ApplicationSection>

                <ApplicationSection title="Vehicle">
                  <ApplicationRow
                    label="Vehicle"
                    value={`${application.vehicleMake} ${application.vehicleModel} (${application.vehicleYear})`}
                  />
                  <ApplicationRow label="Plate" value={application.vehiclePlateNumber} />
                  <ApplicationRow label="Color" value={application.vehicleColor} />
                  <ApplicationRow label="Capacity" value={`${application.vehicleCapacity} passengers`} />
                  {application.vehiclePhotoUrl && (
                    <ApplicationRow
                      label="Vehicle photo"
                      value={<DocumentLink href={application.vehiclePhotoUrl} label="View photo" />}
                    />
                  )}
                </ApplicationSection>

                <ApplicationSection title="Vehicle documents">
                  <ApplicationRow
                    label="Documents"
                    value={
                      <span className="flex flex-wrap justify-end gap-3">
                        <DocumentLink href={application.crDocumentUrl} label="CR" />
                        <DocumentLink href={application.orDocumentUrl} label="OR" />
                        <DocumentLink href={application.insuranceDocumentUrl} label="Insurance" />
                        {application.inspectionDocumentUrl && (
                          <DocumentLink href={application.inspectionDocumentUrl} label="Inspection" />
                        )}
                      </span>
                    }
                  />
                </ApplicationSection>

                <ApplicationSection title="Emergency contact">
                  <ApplicationRow label="Name" value={application.emergencyContactName} />
                  <ApplicationRow label="Relationship" value={application.emergencyContactRelationship} />
                  <ApplicationRow label="Phone" value={application.emergencyContactPhone} />
                </ApplicationSection>

                {(application.gcashNumber ||
                  application.bankAccountName ||
                  application.bankName ||
                  application.bankAccountNumber) && (
                  <ApplicationSection title="Banking">
                    {application.gcashNumber && (
                      <ApplicationRow label="GCash" value={application.gcashNumber} />
                    )}
                    {application.bankAccountName && (
                      <ApplicationRow label="Account name" value={application.bankAccountName} />
                    )}
                    {application.bankName && (
                      <ApplicationRow label="Bank" value={application.bankName} />
                    )}
                    {application.bankAccountNumber && (
                      <ApplicationRow label="Account number" value={application.bankAccountNumber} />
                    )}
                  </ApplicationSection>
                )}
              </div>

              <p className="mt-4 text-[13px] text-[#86868b]">
                Applied: {formatDateTime(application.createdAt)}
              </p>

              <label className="mt-4 block">
                <span className="text-[12px] font-medium text-[#86868b]">
                  Admin notes (optional)
                </span>
                <textarea
                  value={notes[application.id] ?? ''}
                  onChange={(event) =>
                    setNotes((current) => ({
                      ...current,
                      [application.id]: event.target.value,
                    }))
                  }
                  placeholder="Notes for the applicant..."
                  rows={2}
                  className="mt-1.5 w-full rounded-xl border border-[#d2d2d7] bg-white px-3 py-2.5 text-[14px] text-[#1d1d1f] placeholder:text-[#86868b]/60 focus:border-[#0066cc] focus:outline-none focus:ring-2 focus:ring-[#0066cc]/20"
                />
              </label>

              <div className="mt-4 flex flex-wrap gap-3">
                <Button
                  disabled={reviewMutation.isPending}
                  className="rounded-full bg-[#0071e3] px-5 hover:bg-[#0077ed]"
                  onClick={() =>
                    reviewMutation.mutate({
                      id: application.id,
                      status: 'approved',
                      adminNotes: notes[application.id] || undefined,
                    })
                  }
                >
                  Approve
                </Button>
                <Button
                  variant="outline"
                  disabled={reviewMutation.isPending}
                  className="rounded-full border-[#d2d2d7]"
                  onClick={() =>
                    reviewMutation.mutate({
                      id: application.id,
                      status: 'rejected',
                      adminNotes: notes[application.id] || undefined,
                    })
                  }
                >
                  Reject
                </Button>
              </div>
            </AppleCard>
            )
          })
        )}
      </motion.div>
    </motion.div>
  )
}

export function AdminTripsPage() {
  const tripsQuery = useQuery({
    queryKey: adminTripsQueryKey,
    queryFn: fetchAdminTrips,
  })
  const trips = tripsQuery.data ?? []

  return (
    <motion.div
      className="space-y-10"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      <motion.div variants={fadeInUp}>
        <PageHeader
          eyebrow="Admin portal"
          title="Trips & fleet"
          subtitle="All van trips across the platform — published, draft, and cancelled."
        />
      </motion.div>

      <motion.div variants={fadeInUp}>
        {tripsQuery.isLoading ? (
          <p className="text-[15px] text-[#86868b]">Loading trips...</p>
        ) : trips.length === 0 ? (
          <EmptyState
            title="No trips yet"
            description="When drivers create trips, they will appear here."
          />
        ) : (
          <AppleCard className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-[14px]">
                <thead>
                  <tr className="border-b border-black/5 bg-[#fafafa] text-[12px] font-medium tracking-wide text-[#86868b] uppercase">
                    <th className="px-5 py-3">Route</th>
                    <th className="px-5 py-3">Departure</th>
                    <th className="px-5 py-3">Driver</th>
                    <th className="px-5 py-3">Seats</th>
                    <th className="px-5 py-3">Price</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Bookings</th>
                  </tr>
                </thead>
                <tbody>
                  {trips.map((trip) => (
                    <tr key={trip.id} className="border-b border-black/5 last:border-0">
                      <td className="px-5 py-4 font-medium text-[#1d1d1f]">{trip.route}</td>
                      <td className="px-5 py-4 text-[#86868b]">
                        {trip.departureDate}
                        {trip.departureTime ? ` · ${trip.departureTime}` : ''}
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-[#1d1d1f]">{trip.driverName}</p>
                        {trip.driverEmail && (
                          <p className="text-[12px] text-[#86868b]">{trip.driverEmail}</p>
                        )}
                      </td>
                      <td className="px-5 py-4 text-[#86868b]">
                        {trip.seatsLeft}
                        {trip.totalSeats != null ? ` / ${trip.totalSeats}` : ''}
                      </td>
                      <td className="px-5 py-4 text-[#1d1d1f]">
                        ₱{trip.price.toLocaleString()}
                      </td>
                      <td className="px-5 py-4">
                        <StatusPill
                          label={trip.status}
                          variant={tripStatusVariant(trip.status)}
                        />
                      </td>
                      <td className="px-5 py-4 text-[#86868b]">{trip.bookingCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AppleCard>
        )}
      </motion.div>
    </motion.div>
  )
}

export function AdminBookingsPage() {
  const bookingsQuery = useQuery({
    queryKey: adminBookingsQueryKey,
    queryFn: fetchAdminBookings,
  })
  const bookings = bookingsQuery.data ?? []

  return (
    <motion.div
      className="space-y-10"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      <motion.div variants={fadeInUp}>
        <PageHeader
          eyebrow="Admin portal"
          title="All bookings"
          subtitle="Recent passenger reservations across every route."
        />
      </motion.div>

      <motion.div variants={fadeInUp}>
        {bookingsQuery.isLoading ? (
          <p className="text-[15px] text-[#86868b]">Loading bookings...</p>
        ) : bookings.length === 0 ? (
          <EmptyState
            title="No bookings yet"
            description="Passenger reservations will show up here as they are made."
          />
        ) : (
          <AppleCard className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-[14px]">
                <thead>
                  <tr className="border-b border-black/5 bg-[#fafafa] text-[12px] font-medium tracking-wide text-[#86868b] uppercase">
                    <th className="px-5 py-3">Reference</th>
                    <th className="px-5 py-3">Passenger</th>
                    <th className="px-5 py-3">Route</th>
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3">Seat</th>
                    <th className="px-5 py-3">Price</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="border-b border-black/5 last:border-0">
                      <td className="px-5 py-4 font-medium text-[#1d1d1f]">
                        {booking.reference ?? booking.id.slice(0, 8)}
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-[#1d1d1f]">{booking.passengerName}</p>
                        {booking.passengerEmail && (
                          <p className="text-[12px] text-[#86868b]">
                            {booking.passengerEmail}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-4 text-[#86868b]">{booking.route}</td>
                      <td className="px-5 py-4 text-[#86868b]">
                        {booking.date}
                        {booking.time ? ` · ${booking.time}` : ''}
                      </td>
                      <td className="px-5 py-4 text-[#86868b]">{booking.seat ?? '—'}</td>
                      <td className="px-5 py-4 text-[#1d1d1f]">{booking.price ?? '—'}</td>
                      <td className="px-5 py-4">
                        <StatusPill
                          label={booking.status}
                          variant={bookingStatusVariant(booking.status)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AppleCard>
        )}
      </motion.div>
    </motion.div>
  )
}

export function AdminUsersPage() {
  const usersQuery = useQuery({
    queryKey: adminUsersQueryKey,
    queryFn: fetchAdminUsers,
  })
  const users = usersQuery.data ?? []

  return (
    <motion.div
      className="space-y-10"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      <motion.div variants={fadeInUp}>
        <PageHeader
          eyebrow="Admin portal"
          title="Users"
          subtitle="All registered accounts — passengers, drivers, and admins."
        />
      </motion.div>

      <motion.div variants={fadeInUp}>
        {usersQuery.isLoading ? (
          <p className="text-[15px] text-[#86868b]">Loading users...</p>
        ) : users.length === 0 ? (
          <EmptyState
            title="No users found"
            description="User accounts will appear here once people sign up."
          />
        ) : (
          <AppleCard className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-[14px]">
                <thead>
                  <tr className="border-b border-black/5 bg-[#fafafa] text-[12px] font-medium tracking-wide text-[#86868b] uppercase">
                    <th className="px-5 py-3">Name</th>
                    <th className="px-5 py-3">Email</th>
                    <th className="px-5 py-3">Role</th>
                    <th className="px-5 py-3">Trips</th>
                    <th className="px-5 py-3">Bookings</th>
                    <th className="px-5 py-3">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-black/5 last:border-0">
                      <td className="px-5 py-4 font-medium text-[#1d1d1f]">
                        {user.fullName ?? '—'}
                      </td>
                      <td className="px-5 py-4 text-[#86868b]">{user.email}</td>
                      <td className="px-5 py-4">
                        <StatusPill label={user.role} variant={roleVariant(user.role)} />
                      </td>
                      <td className="px-5 py-4 text-[#86868b]">{user.tripCount}</td>
                      <td className="px-5 py-4 text-[#86868b]">{user.bookingCount}</td>
                      <td className="px-5 py-4 text-[#86868b]">
                        {formatDateTime(user.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AppleCard>
        )}
      </motion.div>
    </motion.div>
  )
}
