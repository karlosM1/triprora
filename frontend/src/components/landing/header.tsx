import { Link, useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'
import { cn } from '@/lib/utils'
import heroLogo from '@/assets/hero.png'

const baseNavLinks = [
  { label: 'Home', to: '/' as const, key: 'home' },
  { label: 'Find Vans', to: '/find-vans' as const, key: 'find-vans' },
  { label: 'Schedules', to: '/schedules' as const, key: 'schedules' },
  { label: 'My Bookings', to: '/my-bookings' as const, key: 'my-bookings' },
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
  variant?: 'default' | 'hero'
}

function getInitials(email: string) {
  const name = email.split('@')[0] ?? 'U'
  return name.slice(0, 2).toUpperCase()
}

export function Header({ activeLink = 'home', variant = 'default' }: HeaderProps) {
  const navigate = useNavigate()
  const { user, loading, signOut, isAdmin, isDriver } = useAuth()
  const isHero = variant === 'hero'

  const navLinks = [
    ...baseNavLinks,
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
    <header
      className={cn(
        'z-50',
        isHero
          ? 'absolute inset-x-0 top-0 bg-transparent'
          : 'sticky top-0 border-b border-border/60 bg-white',
      )}
    >
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
        <Link
          to="/"
          className={cn(
            'flex items-center gap-2 text-xl font-bold tracking-tight',
            isHero ? 'text-white' : 'text-foreground',
          )}
        >
          <span
            className={cn(
              'flex size-8 items-center justify-center overflow-hidden rounded-lg',
              isHero ? 'bg-white/15 ring-1 ring-white/25' : 'bg-primary/10',
            )}
          >
            <img src={heroLogo} alt="" className="size-6 object-contain" />
          </span>
          Triprora
        </Link>

        <ul className="hidden items-center md:flex">
          <li
            className={cn(
              'flex items-center gap-1 rounded-full px-2 py-1.5',
              isHero ? 'bg-primary/90 shadow-lg backdrop-blur-sm' : '',
            )}
          >
            {navLinks.slice(0, 5).map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className={cn(
                  'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                  isHero
                    ? cn(
                        'text-white/90 hover:bg-white/15 hover:text-white',
                        activeLink === link.key && 'bg-white/20 text-white',
                      )
                    : cn(
                        'hover:text-primary',
                        activeLink === link.key
                          ? 'text-primary underline decoration-primary decoration-2 underline-offset-8'
                          : 'text-muted-foreground',
                      ),
                )}
              >
                {link.label}
              </Link>
            ))}
          </li>
        </ul>

        <div className="flex items-center gap-3">
          {loading ? (
            <span
              className={cn(
                'text-sm',
                isHero ? 'text-white/70' : 'text-muted-foreground',
              )}
            >
              ...
            </span>
          ) : user ? (
            <>
              <div
                className={cn(
                  'flex size-9 items-center justify-center rounded-full text-xs font-semibold ring-2',
                  isHero
                    ? 'bg-white/20 text-white ring-white/30'
                    : 'bg-primary/10 text-primary ring-border',
                )}
                title={user.email ?? 'Account'}
              >
                {getInitials(user.email ?? 'user')}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'hidden sm:inline-flex',
                  isHero
                    ? 'text-white/90 hover:bg-white/10 hover:text-white'
                    : 'text-muted-foreground',
                )}
                onClick={handleSignOut}
              >
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Link
                to="/sign-in"
                className={cn(
                  'hidden text-sm font-medium transition-colors sm:inline',
                  isHero
                    ? 'text-white/90 hover:text-white'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                Sign In
              </Link>
              <Button
                size="sm"
                className={cn(
                  'rounded-full px-5',
                  isHero && 'bg-white text-primary hover:bg-white/90',
                )}
                asChild
              >
                <Link to="/sign-up">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
