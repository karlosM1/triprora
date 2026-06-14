import { Link, useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'
import { cn } from '@/lib/utils'

const baseNavLinks = [
  { label: 'Find Vans', to: '/find-vans' as const, key: 'find-vans' },
  { label: 'My Bookings', to: '/my-bookings' as const, key: 'my-bookings' },
  { label: 'Schedules', to: '/schedules' as const, key: 'schedules' },
  { label: 'Become a Driver', to: '/driver/register' as const, key: 'driver-register' },
  { label: 'Support', to: '/' as const, key: 'support' },
] as const

type HeaderProps = {
  activeLink?:
    | 'find-vans'
    | 'my-bookings'
    | 'schedules'
    | 'home'
    | 'driver-register'
    | 'driver-portal'
    | 'admin-drivers'
}

function getInitials(email: string) {
  const name = email.split('@')[0] ?? 'U'
  return name.slice(0, 2).toUpperCase()
}

export function Header({ activeLink = 'home' }: HeaderProps) {
  const navigate = useNavigate()
  const { user, loading, signOut, isAdmin, isDriver } = useAuth()

  const navLinks = [
    ...baseNavLinks.filter(
      (link) => link.key !== 'driver-register' || !isDriver,
    ),
    ...(isDriver
      ? [{ label: 'Driver Portal', to: '/driver' as const, key: 'driver-portal' as const }]
      : []),
    ...(isAdmin
      ? [{ label: 'Admin', to: '/admin/drivers' as const, key: 'admin-drivers' as const }]
      : []),
  ]

  async function handleSignOut() {
    await signOut()
    await navigate({ to: '/' })
  }

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

        <div className="flex items-center gap-3">
          {loading ? (
            <span className="text-sm text-muted-foreground">...</span>
          ) : user ? (
            <>
              <div
                className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary ring-2 ring-border"
                title={user.email ?? 'Account'}
              >
                {getInitials(user.email ?? 'user')}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="hidden text-muted-foreground sm:inline-flex"
                onClick={handleSignOut}
              >
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Link
                to="/sign-in"
                className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline"
              >
                Sign In
              </Link>
              <Button size="sm" className="rounded-lg px-4" asChild>
                <Link to="/sign-up">Register</Link>
              </Button>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
