import { createFileRoute } from '@tanstack/react-router'
import { AdminTripsPage } from '@/components/admin/admin-pages'

export const Route = createFileRoute('/admin/trips')({
  component: AdminTripsPage,
})
