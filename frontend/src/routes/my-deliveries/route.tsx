import { createFileRoute, Outlet } from '@tanstack/react-router'
import { requireAuth } from '@/lib/route-guards'

export const Route = createFileRoute('/my-deliveries')({
  beforeLoad: async ({ location }) => {
    await requireAuth(location.pathname)
  },
  component: () => <Outlet />,
})
