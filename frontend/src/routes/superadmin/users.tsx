import { createFileRoute } from '@tanstack/react-router'
import { SuperadminUsersPage } from '@/components/superadmin/superadmin-pages'

export const Route = createFileRoute('/superadmin/users')({
  component: SuperadminUsersPage,
})
