import { ArrowRight, Armchair, Shield, Zap } from 'lucide-react'

const features = [
  {
    icon: Armchair,
    title: 'Premium Comfort',
    description:
      'Executive-class interiors with climate control, Wi-Fi, and privacy partitions on every vehicle.',
  },
  {
    icon: Shield,
    title: 'Unyielding Reliability',
    description:
      '99.7% on-time performance backed by real-time fleet monitoring and redundant dispatch systems.',
  },
  {
    icon: Zap,
    title: 'Effortless Booking',
    description:
      'Book in seconds with corporate accounts, automated invoicing, and multi-city route management.',
  },
]

export function FeaturesSection() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-24">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-xl">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Engineered for Reliability
          </h2>
          <p className="mt-3 text-muted-foreground">
            Every route is backed by institutional-grade standards — from
            vehicle maintenance to driver certification and real-time dispatch.
          </p>
        </div>
        <a
          href="#"
          className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80"
        >
          View Fleet Standards
          <ArrowRight className="size-4" />
        </a>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5"
          >
            <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <feature.icon className="size-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              {feature.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
