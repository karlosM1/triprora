import { createFileRoute } from '@tanstack/react-router'
import { SuperadminDriversPage } from '@/components/superadmin/superadmin-pages'

export const Route = createFileRoute('/superadmin/drivers')({
  component: SuperadminDriversPage,
})
