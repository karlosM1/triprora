import { Globe, Share2 } from 'lucide-react'
import { Link } from '@tanstack/react-router'

const footerLinks = {
  PRODUCT: [
    { label: 'Find Vans', to: '/find-vans' as const },
    { label: 'My Bookings', to: '/my-bookings' as const },
    { label: 'Schedules', to: '/schedules' as const },
  ],
  RESOURCES: [
    { label: 'Support', to: '/' as const },
    { label: 'Become a Driver', to: '/sign-up' as const },
    { label: 'Driver Portal', to: '/driver' as const },
  ],
  LEGAL: [
    { label: 'Privacy Policy', to: '/' as const },
    { label: 'Terms of Service', to: '/' as const },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/50">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="sm:col-span-2 lg:col-span-2">
            <Link to="/" className="text-xl font-bold tracking-tight text-foreground">
              Triprora
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Door-to-door van service from Casiguran, Aurora to Metro Manila.
              Safe, comfortable, and convenient travel with no terminal
              transfers.
            </p>
          </div>

          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <h3 className="text-xs font-semibold tracking-wider text-foreground uppercase">
                {heading}
              </h3>
              <ul className="mt-4 space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Triprora — Casiguran, Aurora. All
            rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="#"
              aria-label="Language"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <Globe className="size-4" />
            </a>
            <a
              href="#"
              aria-label="Share"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <Share2 className="size-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
