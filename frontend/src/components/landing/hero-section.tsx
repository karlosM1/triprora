import { useState } from 'react'
import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import {
  ArrowLeftRight,
  Calendar,
  ChevronDown,
  MapPin,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  fadeInUp,
  scaleIn,
  staggerContainer,
} from '@/lib/motion'
import { cn } from '@/lib/utils'
import heroBackground from '@/assets/beach-view.jpg'

const TRIP_TYPES = ['One Way Trip', 'Round Trip', 'Multi City'] as const

export function HeroSection() {
  const [activeTrip, setActiveTrip] =
    useState<(typeof TRIP_TYPES)[number]>('One Way Trip')

  return (
    <section className="relative min-h-svh overflow-hidden bg-black">
      <motion.div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBackground})` }}
        initial={{ scale: 1.08 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.4, ease: [0.25, 0.1, 0.25, 1] }}
      />
      <div className="absolute inset-0 bg-linear-to-b from-black/55 via-black/25 to-black/70" />

      <div className="relative mx-auto flex min-h-svh w-full max-w-[1280px] flex-col justify-between px-6 pt-24 pb-10 lg:px-10 lg:pt-28">
        <motion.div
          className="flex flex-1 flex-col items-center justify-center text-center"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.p
            variants={fadeInUp}
            className="mb-4 text-sm font-medium tracking-wide text-white/70 uppercase"
          >
            Aurora ↔ Metro Manila
          </motion.p>
          <motion.h1
            variants={fadeInUp}
            className="max-w-3xl text-[40px] leading-[1.05] font-semibold tracking-[-0.02em] text-white sm:text-[56px] lg:text-[72px]"
          >
            Your Journey Starts at Home
          </motion.h1>
          <motion.p
            variants={fadeInUp}
            className="mt-5 max-w-xl text-[19px] leading-relaxed font-normal text-white/75 sm:text-[21px]"
          >
            Door-to-door van rides between Aurora and Metro Manila — both ways,
            fast, easy, and always on your schedule.
          </motion.p>
          <motion.div variants={fadeInUp} className="mt-8 flex flex-wrap justify-center gap-4">
            <Button
              size="lg"
              className="h-11 rounded-full bg-[#0071e3] px-7 text-[17px] font-normal hover:bg-[#0077ed]"
              asChild
            >
              <Link to="/find-vans">Find a van</Link>
            </Button>
            <Button
              size="lg"
              variant="ghost"
              className="h-11 rounded-full px-7 text-[17px] font-normal text-[#2997ff] hover:bg-white/10 hover:text-[#2997ff]"
              asChild
            >
              <Link to="/schedules">View schedules ›</Link>
            </Button>
          </motion.div>
        </motion.div>

        <motion.div
          variants={scaleIn}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.35, duration: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
          className="mt-12 w-full rounded-2xl bg-white/10 p-4 ring-1 ring-white/20 backdrop-blur-2xl lg:p-5"
        >
          <div className="mb-4 flex flex-wrap gap-2">
            {TRIP_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setActiveTrip(type)}
                className={cn(
                  'rounded-full px-4 py-2 text-[13px] font-medium transition-all duration-300',
                  activeTrip === type
                    ? 'bg-white text-[#1d1d1f] shadow-sm'
                    : 'bg-white/10 text-white/90 hover:bg-white/20',
                )}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-3 xl:flex-row xl:items-stretch">
            <div className="flex flex-1 flex-col gap-3 sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:flex xl:flex-row xl:gap-3">
              <div className="relative flex min-w-0 gap-3 sm:col-span-2 lg:col-span-2 xl:flex-[2] xl:basis-0">
                <SearchField
                  className="min-w-0 flex-1 basis-0"
                  icon={<MapPin className="size-4 shrink-0 text-[#86868b]" />}
                  placeholder="Aurora"
                />
                <SearchField
                  className="min-w-0 flex-1 basis-0"
                  icon={<MapPin className="size-4 shrink-0 text-[#86868b]" />}
                  placeholder="Metro Manila"
                />
                <span className="pointer-events-none absolute top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
                  <span className="pointer-events-auto flex size-7 items-center justify-center rounded-full bg-[#1d1d1f] text-white shadow-md ring-2 ring-white/20">
                    <ArrowLeftRight className="size-3.5" />
                  </span>
                </span>
              </div>
              <SearchField
                className="xl:flex-1 xl:basis-0"
                icon={<Calendar className="size-4 shrink-0 text-[#86868b]" />}
                placeholder="Select date"
              />
              <SearchField
                className="xl:flex-1 xl:basis-0"
                icon={<Calendar className="size-4 shrink-0 text-[#86868b]" />}
                placeholder="Return date"
              />
              <SearchField
                className="xl:flex-1 xl:basis-0"
                icon={<Users className="size-4 shrink-0 text-[#86868b]" />}
                placeholder="1–14 Passengers"
                trailing={<ChevronDown className="size-4 shrink-0 text-[#86868b]" />}
              />
            </div>

            <Button
              size="lg"
              className="h-12 shrink-0 rounded-xl bg-[#0071e3] px-8 text-[15px] font-normal hover:bg-[#0077ed] xl:w-36"
              asChild
            >
              <Link to="/find-vans">Search</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function SearchField({
  icon,
  placeholder,
  trailing,
  className,
}: {
  icon: ReactNode
  placeholder: string
  trailing?: ReactNode
  className?: string
}) {
  return (
    <button
      type="button"
      className={cn(
        'flex h-12 w-full min-w-0 items-center gap-2 rounded-xl bg-white/95 px-3 text-left transition-colors hover:bg-white',
        className,
      )}
    >
      {icon}
      <span className="min-w-0 flex-1 truncate text-[13px] font-normal text-[#1d1d1f]/80">
        {placeholder}
      </span>
      {trailing}
    </button>
  )
}
