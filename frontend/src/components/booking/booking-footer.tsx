export function BookingFooter() {
  const footerLinks = {
    Service: ['Find Vans', 'Schedules', 'Fleets'],
    Company: ['About Us', 'Terms of Service', 'Privacy Policy'],
    Support: ['Help Center', 'Contact', 'Cancellation'],
  }

  return (
    <footer className="mt-16 border-t border-border bg-[#F0F2F5]">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="sm:col-span-2 lg:col-span-2">
            <a href="/" className="text-xl font-bold tracking-tight text-foreground">
              Triprora
            </a>
            <p className="mt-3 max-w-sm text-sm text-muted-foreground">
              Institutional-grade mobility solutions for the modern executive.
              Reliability at every turn.
            </p>
            <p className="mt-4 text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} Triprora. All rights reserved.
            </p>
          </div>

          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <h3 className="text-sm font-bold text-foreground">{heading}</h3>
              <ul className="mt-4 space-y-2.5">
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
      </div>
    </footer>
  )
}

export function CheckoutFooter() {
  const footerLinks = {
    Product: ['Find Vans', 'Schedules'],
    Legal: ['Privacy Policy', 'Terms of Service'],
    Support: ['Help Center', 'Contact Us'],
  }

  return (
    <footer className="mt-16 border-t border-border bg-[#F0F2F5]">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
          <div>
            <a href="/" className="text-lg font-bold tracking-tight text-foreground">
              Triprora
            </a>
            <p className="mt-2 text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} Triprora
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Institutional-grade mobility solutions.
            </p>
          </div>

          <div className="flex gap-12">
            {Object.entries(footerLinks).map(([heading, links]) => (
              <div key={heading}>
                <h3 className="text-xs font-bold tracking-wide text-foreground uppercase">
                  {heading}
                </h3>
                <ul className="mt-3 space-y-2">
                  {links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
