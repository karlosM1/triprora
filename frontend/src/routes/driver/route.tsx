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

  const searchPlaceholder =
    pathname.startsWith('/driver/trips/')
      ? 'Search passengers or seat numbers...'
      : pathname === '/driver/trips'
        ? 'Search trips, locations, or IDs...'
        : pathname === '/driver/create'
          ? 'Search pickup areas or Metro Manila destinations...'
          : 'Search trips or documents...'

  return <DriverLayout searchPlaceholder={searchPlaceholder} />
}
