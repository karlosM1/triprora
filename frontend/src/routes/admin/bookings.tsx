import { createFileRoute } from '@tanstack/react-router'
import { AdminBookingsPage } from '@/components/admin/admin-pages'

export const Route = createFileRoute('/admin/bookings')({
  component: AdminBookingsPage,
})
