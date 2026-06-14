import { useState } from 'react'
import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import {
  ArrowLeftRight,
  Calendar,
  ChevronDown,
  MapPin,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import heroBackground from '@/assets/beach-view.jpg'

const TRIP_TYPES = ['One Way Trip', 'Round Trip', 'Multi City'] as const

export function HeroSection() {
  const [activeTrip, setActiveTrip] =
    useState<(typeof TRIP_TYPES)[number]>('One Way Trip')

  return (
    <section className="relative min-h-[92vh] overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBackground})` }}
      />
      <div className="absolute inset-0 bg-linear-to-b from-primary/40 via-primary/20 to-primary/60" />

      <div className="relative mx-auto flex min-h-[92vh] max-w-7xl flex-col justify-between px-6 pt-28 pb-8 lg:px-8 lg:pt-32">
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <h1 className="max-w-4xl text-4xl leading-tight font-bold tracking-tight text-white sm:text-5xl lg:text-[3.25rem] lg:leading-[1.15]">
            Book Van Rides Anytime, Anywhere — Fast, Easy
          </h1>
        </div>

        <div className="mt-10 rounded-2xl bg-white/20 p-4 shadow-2xl ring-1 ring-white/30 backdrop-blur-xl lg:p-5">
          <div className="mb-4 flex flex-wrap gap-2">
            {TRIP_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setActiveTrip(type)}
                className={cn(
                  'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                  activeTrip === type
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-white/90 text-foreground hover:bg-white',
                )}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-stretch">
            <div className="grid flex-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <SearchField
                icon={<MapPin className="size-4 text-primary" />}
                placeholder="Casiguran, Aurora"
              />
              <div className="relative sm:col-span-1">
                <SearchField
                  icon={<MapPin className="size-4 text-primary" />}
                  placeholder="Metro Manila"
                />
                <span className="absolute top-1/2 -left-3 z-10 hidden -translate-y-1/2 sm:flex">
                  <span className="flex size-7 items-center justify-center rounded-full bg-primary text-white shadow-md">
                    <ArrowLeftRight className="size-3.5" />
                  </span>
                </span>
              </div>
              <SearchField
                icon={<Calendar className="size-4 text-primary" />}
                placeholder="Select date"
              />
              <SearchField
                icon={<Calendar className="size-4 text-primary" />}
                placeholder="Return date"
              />
              <SearchField
                icon={<Users className="size-4 text-primary" />}
                placeholder="1–14 Passengers"
                trailing={<ChevronDown className="size-4 text-muted-foreground" />}
              />
            </div>

            <Button
              size="lg"
              className="h-auto shrink-0 rounded-xl px-8 py-4 text-base font-semibold lg:min-w-[160px]"
              asChild
            >
              <Link to="/find-vans">Search Vans</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

function SearchField({
  icon,
  placeholder,
  trailing,
}: {
  icon: ReactNode
  placeholder: string
  trailing?: ReactNode
}) {
  return (
    <button
      type="button"
      className="flex items-center gap-3 rounded-xl bg-white px-4 py-3.5 text-left shadow-sm transition-colors hover:bg-white/95"
    >
      {icon}
      <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground/80">
        {placeholder}
      </span>
      {trailing}
    </button>
  )
}
