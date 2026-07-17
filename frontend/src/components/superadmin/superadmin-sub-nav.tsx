import { Link, useRouterState } from '@tanstack/react-router'
import { cn } from '@/lib/utils'

const superadminNavItems = [
  { label: 'Overview', to: '/superadmin' as const, exact: true },
  { label: 'Users', to: '/superadmin/users' as const, exact: false },
  { label: 'Drivers', to: '/superadmin/drivers' as const, exact: false },
  { label: 'Trips', to: '/superadmin/trips' as const, exact: false },
  { label: 'Bookings', to: '/superadmin/bookings' as const, exact: false },
] as const

export function SuperadminSubNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  return (
    <div className="border-b border-black/5 bg-white/80 backdrop-blur-xl">
      <div className="no-scrollbar mx-auto flex max-w-[980px] items-center gap-1 overflow-x-auto px-6 py-3 lg:px-8">
        {superadminNavItems.map((item) => {
          const isActive = item.exact
            ? pathname === '/superadmin' || pathname === '/superadmin/'
            : pathname.startsWith(item.to)

          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                'inline-flex h-9 shrink-0 items-center rounded-full px-4 text-[13px] font-medium whitespace-nowrap transition-colors',
                isActive
                  ? 'bg-[#1d1d1f] text-white'
                  : 'text-[#86868b] hover:bg-[#e8e8ed] hover:text-[#1d1d1f]',
              )}
            >
              {item.label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
