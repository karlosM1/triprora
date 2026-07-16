import { createFileRoute } from '@tanstack/react-router'
import { SuperadminTripsPage } from '@/components/superadmin/superadmin-pages'

export const Route = createFileRoute('/superadmin/trips')({
  component: SuperadminTripsPage,
})
