import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navLinks = [
  { label: 'Find Vans', to: '/find-vans' as const, key: 'find-vans' },
  { label: 'My Bookings', to: '/my-bookings' as const, key: 'my-bookings' },
  { label: 'Schedules', to: '/schedules' as const, key: 'schedules' },
  { label: 'Support', to: '/' as const, key: 'support' },
] as const

type HeaderProps = {
  activeLink?: 'find-vans' | 'my-bookings' | 'schedules' | 'home'
  showProfile?: boolean
}

export function Header({ activeLink = 'home', showProfile = false }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-white">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
        <Link to="/" className="text-xl font-bold tracking-tight text-foreground">
          Triprora
        </Link>

        <ul className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <li key={link.label}>
              <Link
                to={link.to}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary',
                  activeLink === link.key
                    ? 'text-primary underline decoration-primary decoration-2 underline-offset-8'
                    : 'text-muted-foreground',
                )}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-4">
          <a
            href="#"
            className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline"
          >
            Sign In
          </a>
          {showProfile ? (
            <img
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face"
              alt="Profile"
              className="size-9 rounded-full object-cover ring-2 ring-border"
            />
          ) : (
            <Button size="sm" className="rounded-lg px-4">
              Register
            </Button>
          )}
        </div>
      </nav>
    </header>
  )
}
