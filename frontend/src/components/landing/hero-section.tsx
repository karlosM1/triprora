import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import {
  Calendar,
  ChevronDown,
  MapPin,
  Search,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1544623020-9c4e2f88e5d3?w=1920&q=80&auto=format&fit=crop'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${HERO_IMAGE})` }}
      />
      <div className="absolute inset-0 bg-white/75 backdrop-blur-[2px]" />

      <div className="relative mx-auto max-w-7xl px-6 py-24 text-center lg:px-8 lg:py-32">
        <p className="mb-4 text-xs font-semibold tracking-[0.2em] text-primary uppercase">
          Global Executive Mobility
        </p>
        <h1 className="mx-auto max-w-3xl text-4xl leading-tight font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
          Institutional-grade transport for the{' '}
          <span className="text-primary">modern enterprise.</span>
        </h1>

        <div className="mx-auto mt-12 max-w-4xl rounded-xl bg-white p-2 shadow-lg shadow-black/5 ring-1 ring-black/5">
          <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
            <SearchField
              icon={<MapPin className="size-4 text-muted-foreground" />}
              label="From"
              placeholder="Select pickup"
            />
            <Divider />
            <SearchField
              icon={<MapPin className="size-4 text-muted-foreground" />}
              label="To"
              placeholder="Destination"
            />
            <Divider />
            <SearchField
              icon={<Calendar className="size-4 text-muted-foreground" />}
              label="Date"
              placeholder="mm/dd/yyyy"
            />
            <Divider />
            <SearchField
              icon={<Users className="size-4 text-muted-foreground" />}
              label="Passengers"
              placeholder="1–4 Pax"
              trailing={<ChevronDown className="size-4 text-muted-foreground" />}
            />
            <Button
              size="icon-lg"
              className="size-12 shrink-0 rounded-lg sm:ml-1"
              aria-label="Search"
              asChild
            >
              <Link to="/find-vans">
                <Search className="size-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

function Divider() {
  return <div className="hidden h-10 w-px bg-border sm:block" />
}

function SearchField({
  icon,
  label,
  placeholder,
  trailing,
}: {
  icon: ReactNode
  label: string
  placeholder: string
  trailing?: ReactNode
}) {
  return (
    <button
      type="button"
      className="flex flex-1 items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors hover:bg-muted/60"
    >
      {icon}
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-medium text-foreground/70">
          {placeholder}
        </p>
      </div>
      {trailing}
    </button>
  )
}
