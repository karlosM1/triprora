import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

export function PlanTripCta() {
  return (
    <section className="rounded-xl border border-dashed border-sky-200 bg-sky-50/60 px-6 py-10 text-center">
      <h2 className="text-lg font-bold text-foreground">Plan Your Next Trip</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        Explore available vans and book your door-to-door trip from Casiguran
        to Metro Manila.
      </p>
      <Button className="mt-5 rounded-lg px-6" asChild>
        <Link to="/find-vans">Search Vans</Link>
      </Button>
    </section>
  )
}

export function MyBookingsFooter() {
  const links = ['Privacy Policy', 'Terms of Service', 'Fleet Info', 'Careers']

  return (
    <footer className="mt-16 border-t border-border bg-[#F0F2F5]">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-6 py-8 sm:flex-row sm:items-center lg:px-8">
        <div>
          <a href="/" className="text-lg font-bold tracking-tight text-foreground">
            Triprora
          </a>
          <p className="mt-1 text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Triprora — Casiguran to Metro
            Manila. All rights reserved.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          {links.map((link) => (
            <a
              key={link}
              href="#"
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              {link}
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}
