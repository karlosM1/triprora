import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navLinks = [
  { label: 'Find Vans', to: '/find-vans' as const, key: 'find-vans' },
  { label: 'My Bookings', to: '/find-vans' as const, key: 'my-bookings' },
  { label: 'Schedules', to: '/' as const, key: 'schedules' },
  { label: 'Support', to: '/' as const, key: 'support' },
] as const

type HeaderProps = {
  activeLink?: 'find-vans' | 'my-bookings' | 'home'
}

export function Header({ activeLink = 'home' }: HeaderProps) {
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
          <Button size="sm" className="rounded-lg px-4">
            Register
          </Button>
        </div>
      </nav>
    </header>
  )
}
