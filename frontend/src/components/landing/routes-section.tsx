import { ArrowRight, Clock } from 'lucide-react'
import { Link } from '@tanstack/react-router'

const routes = [
  {
    name: 'Casiguran — Cubao',
    transit: '6h 30m Transit',
    price: '₱850',
    badge: 'Daily',
    image:
      'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&q=80&auto=format&fit=crop',
  },
  {
    name: 'Casiguran — Makati',
    transit: '7h Transit',
    price: '₱900',
    badge: 'Daily',
    image:
      'https://images.unsplash.com/photo-1496442226666-8d0d0e62e6e9?w=600&q=80&auto=format&fit=crop',
  },
  {
    name: 'Casiguran — Pasay',
    transit: '7h 15m Transit',
    price: '₱880',
    badge: 'Daily',
    image:
      'https://images.unsplash.com/photo-1530122037265-a5f1f32fcb39?w=600&q=80&auto=format&fit=crop',
  },
  {
    name: 'Casiguran — Quezon City',
    transit: '6h 45m Transit',
    price: '₱850',
    badge: 'Limited',
    image:
      'https://images.unsplash.com/photo-1515896773771-04f8a6c0e4c8?w=600&q=80&auto=format&fit=crop',
  },
]

export function RoutesSection() {
  return (
    <section className="bg-muted/50 px-6 py-20 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Popular Routes
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
            Door-to-door van trips from Casiguran, Aurora to key areas in Metro
            Manila. Transparent pricing, no terminal transfers.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {routes.map((route) => (
            <article
              key={route.name}
              className="group overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/5 transition-shadow hover:shadow-md"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={route.image}
                  alt={route.name}
                  className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <span className="absolute top-3 right-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-primary backdrop-blur-sm">
                  {route.badge}
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-foreground">{route.name}</h3>
                <div className="mt-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Clock className="size-3.5" />
                  {route.transit}
                </div>
                <Link
                  to="/find-vans"
                  className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
                >
                  From {route.price}
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
