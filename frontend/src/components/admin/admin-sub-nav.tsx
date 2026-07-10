import { Link, useRouterState } from '@tanstack/react-router'
import { cn } from '@/lib/utils'

const adminNavItems = [
  { label: 'Overview', to: '/admin' as const, exact: true },
  { label: 'Driver Approvals', to: '/admin/drivers' as const, exact: false },
  { label: 'Wallets', to: '/admin/wallets' as const, exact: false },
  { label: 'Trips', to: '/admin/trips' as const, exact: false },
  { label: 'Bookings', to: '/admin/bookings' as const, exact: false },
  { label: 'Users', to: '/admin/users' as const, exact: false },
] as const

export function AdminSubNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  return (
    <div className="border-b border-black/5 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[980px] items-center gap-1 overflow-x-auto px-6 py-3 lg:px-8">
        {adminNavItems.map((item) => {
          const isActive = item.exact
            ? pathname === '/admin' || pathname === '/admin/'
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
