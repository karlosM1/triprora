import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Car, ClipboardCheck, Ticket, Users } from 'lucide-react'
import { useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { SuperadminColumnPicker, readStoredColumnVisibility, writeStoredColumnVisibility } from '@/components/superadmin/superadmin-column-picker'
import { SuperadminTableFilters } from '@/components/superadmin/superadmin-table-filters'
import { SuperadminUserActions } from '@/components/superadmin/superadmin-user-actions'
import { AppleCard, PageHeader, SectionTitle } from '@/components/layout/page-header'
import { TablePagination } from '@/components/ui/table-pagination'
import { getServerPageRange } from '@/lib/admin-pagination'
import {
  SUPERADMIN_PAGE_SIZE,
  fetchSuperadminBookings,
  fetchSuperadminDrivers,
  fetchSuperadminStats,
  fetchSuperadminTrips,
  fetchSuperadminUsers,
  superadminBookingsQueryKey,
  superadminDriversQueryKey,
  superadminStatsQueryKey,
  superadminTripsQueryKey,
  superadminUsersQueryKey,
  type ApplicationStatusFilter,
  type BannedFilter,
  type BookingStatusFilter,
  type RoleFilter,
  type SuperadminBooking,
  type SuperadminTrip,
  type SuperadminUser,
  type TripDisplayStatus,
  type TripStatusFilter,
} from '@/lib/api/superadmin'
import { useAuth } from '@/lib/auth-context'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { fadeInUp, staggerContainer } from '@/lib/motion'
import { cn } from '@/lib/utils'

const CHART_COLORS = ['#0066cc', '#248a3d', '#bf4800', '#b42318', '#86868b']

const TRIP_FILTERS: Array<{ value: TripStatusFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

const USER_TABLE_COLUMNS = [
  { id: 'name', label: 'Name' },
  { id: 'email', label: 'Email' },
  { id: 'role', label: 'Role' },
  { id: 'status', label: 'Status' },
  { id: 'trips', label: 'Trips' },
  { id: 'bookings', label: 'Bookings' },
  { id: 'joined', label: 'Joined' },
  { id: 'actions', label: 'Actions' },
] as const

const USER_COLUMNS_STORAGE_KEY = 'superadmin-users-visible-columns'

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
        'inline-flex rounded-full px-3 py-1 text-[12px] font-medium capitalize',
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

function tripDisplayVariant(status: TripDisplayStatus) {
  if (status === 'upcoming') return 'default' as const
  if (status === 'ongoing') return 'success' as const
  if (status === 'completed') return 'muted' as const
  if (status === 'draft') return 'warning' as const
  return 'danger' as const
}

function bookingStatusVariant(status: SuperadminBooking['status']) {
  if (status === 'confirmed') return 'success' as const
  if (status === 'completed') return 'default' as const
  return 'danger' as const
}

function roleVariant(role: SuperadminUser['role']) {
  if (role === 'superadmin') return 'danger' as const
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

function formatChartDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
}

export function SuperadminDashboardPage() {
  const { profile } = useAuth()
  const statsQuery = useQuery({
    queryKey: superadminStatsQueryKey,
    queryFn: fetchSuperadminStats,
  })
  const stats = statsQuery.data
  const firstName = profile?.fullName?.split(' ')[0] ?? 'Superadmin'

  return (
    <motion.div
      className="space-y-12"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      <motion.div variants={fadeInUp}>
        <PageHeader
          eyebrow="Superadmin"
          title={`Welcome, ${firstName}.`}
          subtitle="Platform-wide analytics, user management, bans, and driver directory."
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
              value={String(stats.upcomingTrips + stats.ongoingTrips)}
              footer={`${stats.upcomingTrips} upcoming · ${stats.ongoingTrips} ongoing`}
              icon={Car}
            />
            <StatCard
              title="Bookings"
              value={String(stats.totalBookings)}
              footer={`${stats.confirmedBookings} confirmed`}
              icon={Ticket}
            />
          </motion.div>

          <motion.div variants={fadeInUp} className="grid gap-4 lg:grid-cols-2">
            <AppleCard className="p-6">
              <SectionTitle
                title="Bookings (30 days)"
                subtitle="Daily reservation volume."
              />
              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.bookingsLast30Days}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e8e8ed" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={formatChartDate}
                      tick={{ fontSize: 11, fill: '#86868b' }}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 11, fill: '#86868b' }}
                      width={28}
                    />
                    <Tooltip
                      labelFormatter={(label) => formatChartDate(String(label))}
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      name="Bookings"
                      stroke="#0066cc"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </AppleCard>

            <AppleCard className="p-6">
              <SectionTitle
                title="Trips by status"
                subtitle="Upcoming, ongoing, completed, and cancelled."
              />
              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.tripsByStatus}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e8e8ed" />
                    <XAxis
                      dataKey="status"
                      tick={{ fontSize: 11, fill: '#86868b' }}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 11, fill: '#86868b' }}
                      width={28}
                    />
                    <Tooltip />
                    <Bar dataKey="count" name="Trips" radius={[6, 6, 0, 0]}>
                      {stats.tripsByStatus.map((entry, index) => (
                        <Cell
                          key={entry.status}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </AppleCard>

            <AppleCard className="p-6 lg:col-span-2">
              <SectionTitle
                title="Users by role"
                subtitle="Current account distribution."
              />
              <div className="mt-4 grid gap-6 md:grid-cols-2">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.usersByRole}
                        dataKey="count"
                        nameKey="role"
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={90}
                        paddingAngle={2}
                      >
                        {stats.usersByRole.map((entry, index) => (
                          <Cell
                            key={entry.role}
                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-col justify-center gap-3">
                  {stats.usersByRole.map((entry, index) => (
                    <div
                      key={entry.role}
                      className="flex items-center justify-between rounded-xl bg-[#fafafa] px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="size-2.5 rounded-full"
                          style={{
                            backgroundColor:
                              CHART_COLORS[index % CHART_COLORS.length],
                          }}
                        />
                        <span className="text-[14px] font-medium capitalize text-[#1d1d1f]">
                          {entry.role}
                        </span>
                      </div>
                      <span className="text-[14px] text-[#86868b]">
                        {entry.count}
                      </span>
                    </div>
                  ))}
                  {stats.bannedUsers > 0 && (
                    <p className="text-[13px] text-[#b42318]">
                      {stats.bannedUsers} banned account
                      {stats.bannedUsers === 1 ? '' : 's'}
                    </p>
                  )}
                </div>
              </div>
            </AppleCard>
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

export function SuperadminUsersPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [role, setRole] = useState<RoleFilter>('all')
  const [banned, setBanned] = useState<BannedFilter>('all')
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(
    () =>
      readStoredColumnVisibility(USER_COLUMNS_STORAGE_KEY, [
        ...USER_TABLE_COLUMNS,
      ]),
  )
  const debouncedSearch = useDebouncedValue(search)

  const queryParams = {
    page,
    pageSize: SUPERADMIN_PAGE_SIZE,
    search: debouncedSearch,
    role,
    banned,
  }

  const usersQuery = useQuery({
    queryKey: superadminUsersQueryKey(queryParams),
    queryFn: () => fetchSuperadminUsers(queryParams),
  })
  const data = usersQuery.data
  const users = data?.items ?? []
  const total = data?.total ?? 0
  const { currentPage, totalPages, rangeStart, rangeEnd, showPagination } =
    getServerPageRange(page, SUPERADMIN_PAGE_SIZE, total)
  const hasFilters =
    Boolean(debouncedSearch.trim()) || role !== 'all' || banned !== 'all'

  function isUserColumnVisible(columnId: string) {
    return visibleColumns[columnId] !== false
  }

  function toggleUserColumn(columnId: string, visible: boolean) {
    setVisibleColumns((current) => {
      const next = { ...current, [columnId]: visible }
      writeStoredColumnVisibility(USER_COLUMNS_STORAGE_KEY, next)
      return next
    })
  }

  function resetUserColumns() {
    const next = Object.fromEntries(
      USER_TABLE_COLUMNS.map((column) => [column.id, true]),
    ) as Record<string, boolean>
    setVisibleColumns(next)
    writeStoredColumnVisibility(USER_COLUMNS_STORAGE_KEY, next)
  }

  return (
    <motion.div
      className="space-y-10"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      <motion.div variants={fadeInUp}>
        <PageHeader
          eyebrow="Superadmin"
          title="Users"
          subtitle="Manage roles, bans, and passwords for all accounts."
        />
      </motion.div>

      <motion.div
        variants={fadeInUp}
        className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between"
      >
        <SuperadminTableFilters
          className="flex-1"
          search={search}
          onSearchChange={(value) => {
            setSearch(value)
            setPage(1)
          }}
          searchPlaceholder="Search name, email, or phone…"
          filters={[
            {
              id: 'role',
              label: 'Role',
              value: role,
              onChange: (value) => {
                setRole(value as RoleFilter)
                setPage(1)
              },
              options: [
                { value: 'all', label: 'All roles' },
                { value: 'passenger', label: 'Passenger' },
                { value: 'driver', label: 'Driver' },
                { value: 'admin', label: 'Admin' },
                { value: 'superadmin', label: 'Superadmin' },
              ],
            },
            {
              id: 'banned',
              label: 'Status',
              value: banned,
              onChange: (value) => {
                setBanned(value as BannedFilter)
                setPage(1)
              },
              options: [
                { value: 'all', label: 'All statuses' },
                { value: 'active', label: 'Active' },
                { value: 'banned', label: 'Banned' },
              ],
            },
          ]}
        />
        <SuperadminColumnPicker
          columns={[...USER_TABLE_COLUMNS]}
          visible={visibleColumns}
          onToggle={toggleUserColumn}
          onReset={resetUserColumns}
        />
      </motion.div>

      <motion.div variants={fadeInUp}>
        {usersQuery.isLoading ? (
          <p className="text-[15px] text-[#86868b]">Loading users...</p>
        ) : users.length === 0 ? (
          <EmptyState
            title={hasFilters ? 'No matching users' : 'No users found'}
            description={
              hasFilters
                ? 'Try a different search or filter.'
                : 'User accounts will appear here once people sign up.'
            }
          />
        ) : (
          <AppleCard className="overflow-hidden">
            <div className="no-scrollbar overflow-x-auto">
              <table className="w-full min-w-[800px] text-left text-[14px]">
                <thead>
                  <tr className="border-b border-black/5 bg-[#fafafa] text-[12px] font-medium tracking-wide text-[#86868b] uppercase">
                    {isUserColumnVisible('name') && (
                      <th className="px-5 py-3">Name</th>
                    )}
                    {isUserColumnVisible('email') && (
                      <th className="px-5 py-3">Email</th>
                    )}
                    {isUserColumnVisible('role') && (
                      <th className="px-5 py-3">Role</th>
                    )}
                    {isUserColumnVisible('status') && (
                      <th className="px-5 py-3">Status</th>
                    )}
                    {isUserColumnVisible('trips') && (
                      <th className="px-5 py-3">Trips</th>
                    )}
                    {isUserColumnVisible('bookings') && (
                      <th className="px-5 py-3">Bookings</th>
                    )}
                    {isUserColumnVisible('joined') && (
                      <th className="px-5 py-3">Joined</th>
                    )}
                    {isUserColumnVisible('actions') && (
                      <th className="px-5 py-3">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-black/5 last:border-0">
                      {isUserColumnVisible('name') && (
                        <td className="px-5 py-4 font-medium text-[#1d1d1f]">
                          {user.fullName ?? '-'}
                        </td>
                      )}
                      {isUserColumnVisible('email') && (
                        <td className="px-5 py-4 text-[#86868b]">{user.email}</td>
                      )}
                      {isUserColumnVisible('role') && (
                        <td className="px-5 py-4">
                          <StatusPill
                            label={user.role}
                            variant={roleVariant(user.role)}
                          />
                        </td>
                      )}
                      {isUserColumnVisible('status') && (
                        <td className="px-5 py-4">
                          {user.isBanned ? (
                            <StatusPill label="Banned" variant="danger" />
                          ) : (
                            <StatusPill label="Active" variant="success" />
                          )}
                        </td>
                      )}
                      {isUserColumnVisible('trips') && (
                        <td className="px-5 py-4 text-[#86868b]">{user.tripCount}</td>
                      )}
                      {isUserColumnVisible('bookings') && (
                        <td className="px-5 py-4 text-[#86868b]">
                          {user.bookingCount}
                        </td>
                      )}
                      {isUserColumnVisible('joined') && (
                        <td className="px-5 py-4 text-[#86868b]">
                          {formatDateTime(user.createdAt)}
                        </td>
                      )}
                      {isUserColumnVisible('actions') && (
                        <td className="px-5 py-4">
                          <SuperadminUserActions user={user} />
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {showPagination && (
              <TablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                rangeStart={rangeStart}
                rangeEnd={rangeEnd}
                totalItems={total}
                itemLabel="users"
                onPageChange={setPage}
              />
            )}
          </AppleCard>
        )}
      </motion.div>
    </motion.div>
  )
}

export function SuperadminDriversPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [banned, setBanned] = useState<BannedFilter>('all')
  const [applicationStatus, setApplicationStatus] =
    useState<ApplicationStatusFilter>('all')
  const debouncedSearch = useDebouncedValue(search)

  const queryParams = {
    page,
    pageSize: SUPERADMIN_PAGE_SIZE,
    search: debouncedSearch,
    banned,
    applicationStatus,
  }

  const driversQuery = useQuery({
    queryKey: superadminDriversQueryKey(queryParams),
    queryFn: () => fetchSuperadminDrivers(queryParams),
  })
  const data = driversQuery.data
  const items = data?.items ?? []
  const total = data?.total ?? 0
  const { currentPage, totalPages, rangeStart, rangeEnd, showPagination } =
    getServerPageRange(page, SUPERADMIN_PAGE_SIZE, total)
  const hasFilters =
    Boolean(debouncedSearch.trim()) ||
    banned !== 'all' ||
    applicationStatus !== 'all'

  return (
    <motion.div
      className="space-y-10"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      <motion.div variants={fadeInUp}>
        <PageHeader
          eyebrow="Superadmin"
          title="Driver directory"
          subtitle="All drivers with license and vehicle details."
        />
      </motion.div>

      <motion.div variants={fadeInUp}>
        <SuperadminTableFilters
          search={search}
          onSearchChange={(value) => {
            setSearch(value)
            setPage(1)
          }}
          searchPlaceholder="Search name, email, license, or plate…"
          filters={[
            {
              id: 'banned',
              label: 'Status',
              value: banned,
              onChange: (value) => {
                setBanned(value as BannedFilter)
                setPage(1)
              },
              options: [
                { value: 'all', label: 'All statuses' },
                { value: 'active', label: 'Active' },
                { value: 'banned', label: 'Banned' },
              ],
            },
            {
              id: 'applicationStatus',
              label: 'Application',
              value: applicationStatus,
              onChange: (value) => {
                setApplicationStatus(value as ApplicationStatusFilter)
                setPage(1)
              },
              options: [
                { value: 'all', label: 'All applications' },
                { value: 'pending', label: 'Pending' },
                { value: 'approved', label: 'Approved' },
                { value: 'rejected', label: 'Rejected' },
              ],
            },
          ]}
        />
      </motion.div>

      <motion.div variants={fadeInUp}>
        {driversQuery.isLoading ? (
          <p className="text-[15px] text-[#86868b]">Loading drivers...</p>
        ) : items.length === 0 ? (
          <EmptyState
            title={hasFilters ? 'No matching drivers' : 'No drivers yet'}
            description={
              hasFilters
                ? 'Try a different search or filter.'
                : 'Approved drivers will appear here with their vehicle information.'
            }
          />
        ) : (
          <AppleCard className="overflow-hidden">
            <div className="no-scrollbar overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-[14px]">
                <thead>
                  <tr className="border-b border-black/5 bg-[#fafafa] text-[12px] font-medium tracking-wide text-[#86868b] uppercase">
                    <th className="px-5 py-3">Driver</th>
                    <th className="px-5 py-3">Phone</th>
                    <th className="px-5 py-3">License</th>
                    <th className="px-5 py-3">Vehicle</th>
                    <th className="px-5 py-3">Location</th>
                    <th className="px-5 py-3">Trips</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((driver) => (
                    <tr key={driver.id} className="border-b border-black/5 last:border-0">
                      <td className="px-5 py-4">
                        <p className="font-medium text-[#1d1d1f]">
                          {driver.fullName ?? '-'}
                        </p>
                        <p className="text-[12px] text-[#86868b]">{driver.email}</p>
                      </td>
                      <td className="px-5 py-4 text-[#86868b]">
                        {driver.phone ?? '-'}
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-[#1d1d1f]">{driver.licenseNo ?? '-'}</p>
                        {driver.licenseType && (
                          <p className="text-[12px] text-[#86868b]">
                            {driver.licenseType}
                            {driver.licenseExpiration
                              ? ` · exp ${driver.licenseExpiration}`
                              : ''}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-[#1d1d1f]">
                          {driver.vehicleMake && driver.vehicleModel
                            ? `${driver.vehicleMake} ${driver.vehicleModel}`
                            : '-'}
                        </p>
                        <p className="text-[12px] text-[#86868b]">
                          {[driver.vehiclePlateNumber, driver.vehicleColor]
                            .filter(Boolean)
                            .join(' · ') || '-'}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-[#86868b]">
                        {[driver.city, driver.province].filter(Boolean).join(', ') ||
                          '-'}
                      </td>
                      <td className="px-5 py-4 text-[#86868b]">{driver.tripCount}</td>
                      <td className="px-5 py-4">
                        {driver.isBanned ? (
                          <StatusPill label="Banned" variant="danger" />
                        ) : (
                          <StatusPill
                            label={driver.applicationStatus ?? 'active'}
                            variant="success"
                          />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {showPagination && (
              <TablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                rangeStart={rangeStart}
                rangeEnd={rangeEnd}
                totalItems={total}
                itemLabel="drivers"
                onPageChange={setPage}
              />
            )}
          </AppleCard>
        )}
      </motion.div>
    </motion.div>
  )
}

export function SuperadminTripsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<TripStatusFilter>('all')
  const debouncedSearch = useDebouncedValue(search)

  const queryParams = {
    page,
    pageSize: SUPERADMIN_PAGE_SIZE,
    status,
    search: debouncedSearch,
  }

  const tripsQuery = useQuery({
    queryKey: superadminTripsQueryKey(queryParams),
    queryFn: () => fetchSuperadminTrips(queryParams),
  })
  const data = tripsQuery.data
  const trips = data?.items ?? []
  const total = data?.total ?? 0
  const { currentPage, totalPages, rangeStart, rangeEnd, showPagination } =
    getServerPageRange(page, SUPERADMIN_PAGE_SIZE, total)
  const hasFilters = Boolean(debouncedSearch.trim()) || status !== 'all'

  return (
    <motion.div
      className="space-y-10"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      <motion.div variants={fadeInUp}>
        <PageHeader
          eyebrow="Superadmin"
          title="Trips"
          subtitle="Filter by upcoming, ongoing, completed, or cancelled."
        />
      </motion.div>

      <motion.div variants={fadeInUp} className="space-y-4">
        <SuperadminTableFilters
          search={search}
          onSearchChange={(value) => {
            setSearch(value)
            setPage(1)
          }}
          searchPlaceholder="Search route, driver, or vehicle…"
        />
        <div className="flex flex-wrap gap-2">
          {TRIP_FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => {
                setStatus(filter.value)
                setPage(1)
              }}
              className={cn(
                'inline-flex h-9 items-center rounded-full px-4 text-[13px] font-medium transition-colors',
                status === filter.value
                  ? 'bg-[#1d1d1f] text-white'
                  : 'bg-[#f5f5f7] text-[#86868b] hover:bg-[#e8e8ed] hover:text-[#1d1d1f]',
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div variants={fadeInUp}>
        {tripsQuery.isLoading ? (
          <p className="text-[15px] text-[#86868b]">Loading trips...</p>
        ) : trips.length === 0 ? (
          <EmptyState
            title={hasFilters ? 'No matching trips' : 'No trips found'}
            description={
              hasFilters
                ? 'Try a different search or status filter.'
                : 'Wait for drivers to publish trips.'
            }
          />
        ) : (
          <AppleCard className="overflow-hidden">
            <div className="no-scrollbar overflow-x-auto">
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
                  {trips.map((trip: SuperadminTrip) => (
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
                          label={trip.displayStatus}
                          variant={tripDisplayVariant(trip.displayStatus)}
                        />
                      </td>
                      <td className="px-5 py-4 text-[#86868b]">{trip.bookingCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {showPagination && (
              <TablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                rangeStart={rangeStart}
                rangeEnd={rangeEnd}
                totalItems={total}
                itemLabel="trips"
                onPageChange={setPage}
              />
            )}
          </AppleCard>
        )}
      </motion.div>
    </motion.div>
  )
}

export function SuperadminBookingsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<BookingStatusFilter>('all')
  const debouncedSearch = useDebouncedValue(search)

  const queryParams = {
    page,
    pageSize: SUPERADMIN_PAGE_SIZE,
    search: debouncedSearch,
    status,
  }

  const bookingsQuery = useQuery({
    queryKey: superadminBookingsQueryKey(queryParams),
    queryFn: () => fetchSuperadminBookings(queryParams),
  })
  const data = bookingsQuery.data
  const bookings = data?.items ?? []
  const total = data?.total ?? 0
  const { currentPage, totalPages, rangeStart, rangeEnd, showPagination } =
    getServerPageRange(page, SUPERADMIN_PAGE_SIZE, total)
  const hasFilters = Boolean(debouncedSearch.trim()) || status !== 'all'

  return (
    <motion.div
      className="space-y-10"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      <motion.div variants={fadeInUp}>
        <PageHeader
          eyebrow="Superadmin"
          title="Bookings"
          subtitle="All passenger reservations across every route."
        />
      </motion.div>

      <motion.div variants={fadeInUp}>
        <SuperadminTableFilters
          search={search}
          onSearchChange={(value) => {
            setSearch(value)
            setPage(1)
          }}
          searchPlaceholder="Search reference, passenger, or route…"
          filters={[
            {
              id: 'status',
              label: 'Status',
              value: status,
              onChange: (value) => {
                setStatus(value as BookingStatusFilter)
                setPage(1)
              },
              options: [
                { value: 'all', label: 'All statuses' },
                { value: 'confirmed', label: 'Confirmed' },
                { value: 'completed', label: 'Completed' },
                { value: 'cancelled', label: 'Cancelled' },
              ],
            },
          ]}
        />
      </motion.div>

      <motion.div variants={fadeInUp}>
        {bookingsQuery.isLoading ? (
          <p className="text-[15px] text-[#86868b]">Loading bookings...</p>
        ) : bookings.length === 0 ? (
          <EmptyState
            title={hasFilters ? 'No matching bookings' : 'No bookings yet'}
            description={
              hasFilters
                ? 'Try a different search or status filter.'
                : 'Passenger reservations will show up here as they are made.'
            }
          />
        ) : (
          <AppleCard className="overflow-hidden">
            <div className="no-scrollbar overflow-x-auto">
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
                      <td className="px-5 py-4 text-[#86868b]">{booking.seat ?? '-'}</td>
                      <td className="px-5 py-4 text-[#1d1d1f]">{booking.price ?? '-'}</td>
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
            {showPagination && (
              <TablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                rangeStart={rangeStart}
                rangeEnd={rangeEnd}
                totalItems={total}
                itemLabel="bookings"
                onPageChange={setPage}
              />
            )}
          </AppleCard>
        )}
      </motion.div>
    </motion.div>
  )
}
