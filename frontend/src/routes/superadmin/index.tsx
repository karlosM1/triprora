import { createFileRoute } from '@tanstack/react-router'
import { SuperadminDashboardPage } from '@/components/superadmin/superadmin-pages'

export const Route = createFileRoute('/superadmin/')({
  component: SuperadminDashboardPage,
})
