import { Link, useRouterState } from '@tanstack/react-router'
import { cn } from '@/lib/utils'

const driverNavItems = [
  { label: 'Dashboard', to: '/driver' as const, exact: true },
  { label: 'My Trips', to: '/driver/trips' as const, exact: false },
  { label: 'Wallet', to: '/driver/wallet' as const, exact: false },
  { label: 'Create Trip', to: '/driver/create' as const, exact: false },
] as const

export function DriverSubNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  return (
    <div className="border-b border-black/5 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[980px] items-center gap-1 overflow-x-auto px-6 py-3 lg:px-8">
        {driverNavItems.map((item) => {
          const isActive = item.exact
            ? pathname === '/driver' || pathname === '/driver/'
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
