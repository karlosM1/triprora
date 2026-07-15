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
      <div className="mx-auto grid max-w-[980px] grid-cols-4 gap-1 px-3 py-3 sm:flex sm:items-center sm:gap-1 sm:px-6 lg:px-8">
        {driverNavItems.map((item) => {
          const isActive = item.exact
            ? pathname === '/driver' || pathname === '/driver/'
            : pathname.startsWith(item.to)

          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                'inline-flex min-h-9 items-center justify-center rounded-full px-1 py-1.5 text-center text-[11px] font-medium leading-tight transition-colors sm:h-9 sm:shrink-0 sm:px-4 sm:py-0 sm:text-[13px] sm:leading-normal sm:whitespace-nowrap',
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
