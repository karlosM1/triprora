import { useState } from 'react'
import { ArrowLeftRight, Navigation } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { PlaceInput } from '@/components/ui/place-input'
import { fadeIn, fadeInUp, staggerContainer } from '@/lib/motion'
import { DEFAULT_TRIP_SEARCH } from '@/lib/trip-search'

export function ScheduleHero() {
  const navigate = useNavigate()
  const [from, setFrom] = useState(DEFAULT_TRIP_SEARCH.from)
  const [to, setTo] = useState(DEFAULT_TRIP_SEARCH.to)

  function swapLocations() {
    setFrom(to)
    setTo(from)
  }

  function handleSearch() {
    navigate({
      to: '/find-vans',
      search: {
        from,
        to,
      },
    })
  }

  return (
    <section className="bg-[#1d1d1f] pt-6 pb-10 sm:pt-8 sm:pb-14 lg:pt-10 lg:pb-20">
      <motion.div
        className="mx-auto max-w-[980px] px-4 text-center sm:px-6 lg:px-8"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <motion.p
          variants={fadeInUp}
          className="text-[13px] font-medium tracking-wide text-white/60 uppercase"
        >
          Schedules
        </motion.p>
        <motion.h1
          variants={fadeInUp}
          className="mt-3 text-[32px] leading-[1.08] font-semibold tracking-[-0.02em] text-white sm:text-[40px] lg:text-[48px]"
        >
          Trip schedules.
        </motion.h1>
        <motion.p
          variants={fadeInUp}
          className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-[#a1a1a6] sm:mt-4 sm:text-[17px]"
        >
          View door-to-door van departures between Aurora and Metro Manila, both
          ways. No terminals. We pick you up at your door.
        </motion.p>
      </motion.div>

      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className="mx-auto mt-8 max-w-[980px] px-4 sm:mt-10 sm:px-6 lg:px-8"
      >
        <form
          className="flex flex-col gap-3 rounded-2xl bg-white/10 p-3 ring-1 ring-white/15 backdrop-blur-xl sm:p-4 lg:flex-row lg:items-center"
          onSubmit={(event) => {
            event.preventDefault()
            handleSearch()
          }}
        >
          <div className="relative flex min-w-0 flex-col gap-2 sm:flex-1 sm:flex-row sm:items-stretch sm:gap-3">
            <PlaceInput
              className="min-w-0 flex-1"
              value={from}
              onChange={setFrom}
              placeholder="From"
              region="aurora"
              fieldClassName="gap-3 bg-white px-4"
              inputClassName="placeholder:text-[#86868b]"
            />

            <button
              type="button"
              onClick={swapLocations}
              aria-label="Swap locations"
              className="mx-auto flex size-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25 sm:absolute sm:top-1/2 sm:left-1/2 sm:z-10 sm:-translate-x-1/2 sm:-translate-y-1/2"
            >
              <ArrowLeftRight className="size-4" />
            </button>

            <PlaceInput
              className="min-w-0 flex-1"
              value={to}
              onChange={setTo}
              placeholder="To"
              region="metro-manila"
              icon={<Navigation className="size-4 shrink-0 text-[#86868b]" />}
              fieldClassName="gap-3 bg-white px-4"
              inputClassName="placeholder:text-[#86868b]"
            />
          </div>

          <Button
            type="submit"
            className="h-11 w-full shrink-0 rounded-full bg-[#0071e3] px-6 text-[15px] font-normal hover:bg-[#0077ed] lg:ml-1 lg:w-auto"
          >
            Find vans
          </Button>
        </form>
      </motion.div>
    </section>
  )
}
