import { Globe, Share2 } from 'lucide-react'

const footerLinks = {
  PRODUCT: ['Find Vans', 'My Bookings', 'Schedules'],
  RESOURCES: ['Support', 'Developer API', 'Fleet Guide'],
  LEGAL: ['Privacy Policy', 'Terms of Service'],
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/50">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="sm:col-span-2 lg:col-span-2">
            <a href="/" className="text-xl font-bold tracking-tight text-foreground">
              Triprora
            </a>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Institutional-grade executive transport for modern enterprises.
              Reliable, comfortable, and effortless to book across global
              corridors.
            </p>
          </div>

          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <h3 className="text-xs font-semibold tracking-wider text-foreground uppercase">
                {heading}
              </h3>
              <ul className="mt-4 space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Triprora. All rights reserved.
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
