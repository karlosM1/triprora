import { createFileRoute } from '@tanstack/react-router'
import { AdminDriversPage } from '@/components/admin/admin-pages'

export const Route = createFileRoute('/admin/drivers')({
  component: AdminDriversPage,
})
