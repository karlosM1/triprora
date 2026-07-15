import { createFileRoute } from '@tanstack/react-router'
import { DriverDashboardPage } from '@/components/driver/driver-pages'
import { driverTripsQueryOptions } from '@/lib/api/driver-trips'
import { queryClient } from '@/lib/query-client'

export const Route = createFileRoute('/driver/')({
  loader: async () => {
    await queryClient.ensureQueryData(driverTripsQueryOptions())
  },
  component: DriverDashboardPage,
})
