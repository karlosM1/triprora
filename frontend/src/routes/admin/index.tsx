import { createFileRoute } from '@tanstack/react-router'
import { AdminDashboardPage } from '@/components/admin/admin-pages'

export const Route = createFileRoute('/admin/')({
  component: AdminDashboardPage,
})
