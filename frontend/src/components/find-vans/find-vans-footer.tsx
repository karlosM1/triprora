export function FindVansFooter() {
  const footerLinks = {
    Navigation: ['Find Vans', 'My Bookings', 'Schedules'],
    Support: ['Help Center', 'Safety Center', 'Contact Us'],
    Legal: ['Privacy Policy', 'Terms of Service'],
  }

  return (
    <footer className="mt-16 border-t border-border bg-[#F0F2F5]">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="sm:col-span-2 lg:col-span-2">
            <a href="/" className="text-xl font-bold tracking-tight text-foreground">
              Crabr
            </a>
            <p className="mt-3 max-w-sm text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Crabr — Door-to-door van
              service between Aurora and Metro Manila, both ways.
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
