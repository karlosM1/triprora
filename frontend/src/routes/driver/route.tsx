import { createFileRoute, Outlet, useRouterState } from '@tanstack/react-router'
import { DriverLayout } from '@/components/driver/driver-layout'
import { requireRole } from '@/lib/route-guards'

export const Route = createFileRoute('/driver')({
  beforeLoad: async ({ location }) => {
    if (location.pathname !== '/driver/register') {
      await requireRole('/driver', 'driver')
    }
  },
  component: DriverRouteLayout,
})

function DriverRouteLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  if (pathname === '/driver/register') {
    return <Outlet />
  }

  return <DriverLayout />
}
