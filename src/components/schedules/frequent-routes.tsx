import { Building2, Bus, Clock, Mountain, Timer } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import type { RouteCard } from '@/lib/schedules-data'
import {
  businessRoute,
  compactRoutes,
  featuredRoute,
} from '@/lib/schedules-data'

export function FrequentRoutes() {
  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-foreground">Frequent Routes</h2>
        <div className="flex gap-2">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            Active Fleet
          </span>
          <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold text-teal-700">
            Real-time Data
          </span>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <FeaturedRouteCard />
        <BusinessRouteCard />

        {compactRoutes.map((route) => (
          <CompactRouteCard key={route.id} route={route} />
        ))}
      </div>
    </section>
  )
}

function FeaturedRouteCard() {
  return (
    <div className="flex flex-col justify-between rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5 lg:col-span-2 lg:row-span-2">
      <div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold tracking-widest text-primary uppercase">
              {featuredRoute.label}
            </p>
            <h3 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
              {featuredRoute.title}
            </h3>
          </div>
          <p className="shrink-0 text-right text-lg font-bold text-muted-foreground/60 sm:text-xl">
            {featuredRoute.availability}
          </p>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="size-4 text-primary" />
            {featuredRoute.departures}
          </p>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Timer className="size-4 text-primary" />
            {featuredRoute.duration}
          </p>
        </div>
        <Button
          className="rounded-lg bg-[#0f172a] px-6 hover:bg-[#0f172a]/90"
          asChild
        >
          <Link to="/find-vans">Book Now</Link>
        </Button>
      </div>
    </div>
  )
}

function BusinessRouteCard() {
  return (
    <div className="flex flex-col justify-between rounded-xl bg-white p-5 shadow-sm ring-1 ring-black/5 lg:col-span-1 lg:row-span-2">
      <div>
        <span className="rounded bg-sky-100 px-2 py-0.5 text-[10px] font-bold tracking-wide text-sky-700 uppercase">
          {businessRoute.label}
        </span>
        <h3 className="mt-3 text-lg font-bold text-foreground">
          {businessRoute.title}
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          {businessRoute.description}
        </p>
      </div>
      <div className="mt-6">
        <p className="text-xs text-muted-foreground">{businessRoute.frequency}</p>
        <Button
          variant="outline"
          className="mt-4 w-full rounded-lg border-primary text-primary hover:bg-primary/5 hover:text-primary"
        >
          View Details
        </Button>
      </div>
    </div>
  )
}

function CompactRouteCard({ route }: { route: RouteCard }) {
  const Icon =
    route.icon === 'bus'
      ? Bus
      : route.icon === 'mountains'
        ? Mountain
        : Building2

  return (
    <div className="flex flex-col justify-between rounded-xl bg-white p-5 shadow-sm ring-1 ring-black/5">
      <div>
        <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
          <Icon className="size-4 text-muted-foreground" />
        </div>
        <h3 className="mt-3 font-bold text-foreground">{route.name}</h3>
        <p className="text-xs text-muted-foreground">{route.location}</p>
        <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
          <span>{route.frequency}</span>
          <span>{route.duration}</span>
        </div>
      </div>
      <Button
        variant="secondary"
        className="mt-4 w-full rounded-lg"
        asChild
      >
        <Link to="/find-vans">Book</Link>
      </Button>
    </div>
  )
}
