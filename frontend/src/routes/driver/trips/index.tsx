import { createFileRoute } from '@tanstack/react-router'
import { DriverMyTripsPage } from '@/components/driver/driver-pages'
import { driverTripsQueryOptions } from '@/lib/api/driver-trips'
import { queryClient } from '@/lib/query-client'

export const Route = createFileRoute('/driver/trips/')({
  loader: async () => {
    await queryClient.ensureQueryData(driverTripsQueryOptions())
  },
  component: DriverMyTripsPage,
})
