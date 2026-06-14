import { useState } from 'react'
import { ArrowLeftRight, MapPin, Navigation } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { fadeInUp, staggerContainer } from '@/lib/motion'

export function ScheduleHero() {
  const [from, setFrom] = useState('Aurora')
  const [to, setTo] = useState('Metro Manila')

  function swapLocations() {
    setFrom(to)
    setTo(from)
  }

  return (
    <section className="bg-[#1d1d1f] pt-8 pb-14 lg:pt-10 lg:pb-20">
      <motion.div
        className="mx-auto max-w-[980px] px-6 text-center lg:px-8"
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
          className="mt-3 text-[40px] leading-[1.08] font-semibold tracking-[-0.02em] text-white sm:text-[48px]"
        >
          Trip schedules.
        </motion.h1>
        <motion.p
          variants={fadeInUp}
          className="mx-auto mt-4 max-w-xl text-[17px] leading-relaxed text-[#a1a1a6]"
        >
          View door-to-door van departures between Aurora and Metro Manila, both
          ways. No terminals — we pick you up at your door.
        </motion.p>
      </motion.div>

      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="mx-auto mt-10 max-w-[980px] px-6 lg:px-8"
      >
        <form
          className="flex flex-col gap-3 rounded-2xl bg-white/10 p-4 ring-1 ring-white/15 backdrop-blur-xl sm:flex-row sm:items-center"
          onSubmit={(e) => e.preventDefault()}
        >
          <label className="flex flex-1 items-center gap-3 rounded-xl bg-white px-4 py-3">
            <MapPin className="size-4 shrink-0 text-[#86868b]" />
            <input
              type="text"
              placeholder="From"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full text-[15px] text-[#1d1d1f] placeholder:text-[#86868b] focus:outline-none"
            />
          </label>

          <button
            type="button"
            onClick={swapLocations}
            aria-label="Swap locations"
            className="flex size-9 shrink-0 items-center justify-center self-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25"
          >
            <ArrowLeftRight className="size-4" />
          </button>

          <label className="flex flex-1 items-center gap-3 rounded-xl bg-white px-4 py-3">
            <Navigation className="size-4 shrink-0 text-[#86868b]" />
            <input
              type="text"
              placeholder="To"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full text-[15px] text-[#1d1d1f] placeholder:text-[#86868b] focus:outline-none"
            />
          </label>

          <Button
            className="h-11 shrink-0 rounded-full bg-[#0071e3] px-6 text-[15px] font-normal hover:bg-[#0077ed] sm:ml-1"
            asChild
          >
            <Link to="/find-vans">Find vans</Link>
          </Button>
        </form>
      </motion.div>
    </section>
  )
}
