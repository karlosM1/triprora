const partners = [
  { name: 'Cubao', abbr: 'CUB' },
  { name: 'Makati', abbr: 'MKT' },
  { name: 'Pasay', abbr: 'PSY' },
  { name: 'Quezon City', abbr: 'QC' },
  { name: 'Taguig', abbr: 'TAG' },
  { name: 'Manila', abbr: 'MNL' },
  { name: 'Caloocan', abbr: 'CAL' },
]

export function TrustSection() {
  return (
    <section className="border-b border-border/60 bg-white px-6 py-14 lg:px-8 lg:py-16">
      <div className="mx-auto max-w-7xl">
        <h2 className="text-center text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Trusted By 2,000+ Travelers And Counting.
        </h2>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
          {partners.map((partner) => (
            <div
              key={partner.name}
              className="flex items-center gap-2 opacity-70 grayscale transition-all hover:opacity-100 hover:grayscale-0"
            >
              <span className="flex size-10 items-center justify-center rounded-full bg-muted text-xs font-bold text-primary">
                {partner.abbr}
              </span>
              <span className="text-sm font-semibold tracking-wide text-foreground/80 uppercase">
                {partner.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
