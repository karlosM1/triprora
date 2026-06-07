import { useState } from 'react'
import { ArrowLeftRight, MapPin, Navigation, Search } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

export function ScheduleHero() {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  function swapLocations() {
    setFrom(to)
    setTo(from)
  }

  return (
    <section className="relative bg-linear-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] pb-16 pt-12 lg:pb-20 lg:pt-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Route Schedules
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">
          Institutional-grade fleet synchronization. View real-time departures,
          frequencies, and availability across our entire network.
        </p>
      </div>

      <div className="mx-auto mt-10 max-w-4xl px-6 lg:px-8">
        <form
          className="flex flex-col gap-3 rounded-xl bg-white p-3 shadow-xl shadow-black/10 sm:flex-row sm:items-center"
          onSubmit={(e) => e.preventDefault()}
        >
          <label className="flex flex-1 items-center gap-3 rounded-lg px-3 py-2.5">
            <MapPin className="size-4 shrink-0 text-muted-foreground" />
            <input
              type="text"
              placeholder="From where?"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </label>

          <button
            type="button"
            onClick={swapLocations}
            aria-label="Swap locations"
            className="flex size-9 shrink-0 items-center justify-center self-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ArrowLeftRight className="size-4" />
          </button>

          <label className="flex flex-1 items-center gap-3 rounded-lg px-3 py-2.5">
            <Navigation className="size-4 shrink-0 text-muted-foreground" />
            <input
              type="text"
              placeholder="To where?"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </label>

          <Button className="shrink-0 rounded-lg px-5 sm:ml-1" asChild>
            <Link to="/find-vans">
              <Search className="size-4" />
              Find Routes
            </Link>
          </Button>
        </form>
      </div>
    </section>
  )
}
