import { createFileRoute } from '@tanstack/react-router'
import { DriverMyTripsPage } from '@/components/driver/driver-pages'

export const Route = createFileRoute('/driver/trips/')({
  component: DriverMyTripsPage,
})
