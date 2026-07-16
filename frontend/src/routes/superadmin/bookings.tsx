import { createFileRoute } from '@tanstack/react-router'
import { SuperadminBookingsPage } from '@/components/superadmin/superadmin-pages'

export const Route = createFileRoute('/superadmin/bookings')({
  component: SuperadminBookingsPage,
})
