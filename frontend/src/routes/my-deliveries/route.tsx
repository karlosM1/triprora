import { createFileRoute, Outlet } from '@tanstack/react-router'
import { requirePassenger } from '@/lib/route-guards'

export const Route = createFileRoute('/my-deliveries')({
  beforeLoad: async ({ location }) => {
    await requirePassenger(location.pathname)
  },
  component: () => <Outlet />,
})
