export function SchedulesFooter() {
  const links = [
    'Terms of Service',
    'Privacy Policy',
    'Fleet Partners',
    'Contact Us',
    'FAQ',
  ]

  return (
    <footer className="border-t border-border bg-[#F0F2F5]">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-6 py-8 sm:flex-row sm:items-center lg:px-8">
        <div>
          <a href="/" className="text-lg font-bold tracking-tight text-foreground">
            Triprora
          </a>
          <p className="mt-1 text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Triprora — Aurora ↔ Metro Manila
            van service.
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
