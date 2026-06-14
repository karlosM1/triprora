import { createFileRoute } from '@tanstack/react-router'
import { DriverDashboardPage } from '@/components/driver/driver-pages'

export const Route = createFileRoute('/driver/')({
  component: DriverDashboardPage,
})
