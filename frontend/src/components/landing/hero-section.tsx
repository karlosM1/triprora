import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { ArrowLeftRight, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import { PlaceInput } from '@/components/ui/place-input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  fadeInUp,
  scaleIn,
  staggerContainer,
} from '@/lib/motion'
import {
  DEFAULT_TRIP_SEARCH,
  todayDateInputValue,
  TRIP_TYPES,
  type TripType,
} from '@/lib/trip-search'
import { cn } from '@/lib/utils'
import heroBackground from '@/assets/beach-view.jpg'

export function HeroSection() {
  const navigate = useNavigate()
  const [activeTrip, setActiveTrip] = useState<TripType>(DEFAULT_TRIP_SEARCH.tripType)
  const [from, setFrom] = useState(DEFAULT_TRIP_SEARCH.from)
  const [to, setTo] = useState(DEFAULT_TRIP_SEARCH.to)
  const [departureDate, setDepartureDate] = useState('')
  const [returnDate, setReturnDate] = useState('')
  const [passengers, setPassengers] = useState(String(DEFAULT_TRIP_SEARCH.passengers))

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
        departureDate: departureDate || undefined,
        returnDate:
          activeTrip === 'Round Trip' && returnDate ? returnDate : undefined,
        passengers: Number(passengers),
        tripType: activeTrip,
      },
    })
  }

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

      <div className="relative mx-auto flex min-h-svh w-full max-w-[1280px] flex-col justify-end gap-8 px-4 pt-20 pb-6 sm:justify-between sm:gap-0 sm:px-6 sm:pt-24 sm:pb-10 lg:px-10 lg:pt-28">
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
            className="max-w-3xl text-[32px] leading-[1.08] font-semibold tracking-[-0.02em] text-white min-[375px]:text-[36px] sm:text-[56px] lg:text-[72px]"
          >
            Your Journey Starts at Home
          </motion.h1>
          <motion.p
            variants={fadeInUp}
            className="mt-4 max-w-xl text-[16px] leading-relaxed font-normal text-white/75 sm:mt-5 sm:text-[19px] lg:text-[21px]"
          >
            Door-to-door van rides between Aurora and Metro Manila — both ways,
            fast, easy, and always on your schedule.
          </motion.p>
          <motion.div variants={fadeInUp} className="mt-6 flex w-full flex-col gap-3 sm:mt-8 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-center sm:gap-4">
            <Button
              size="lg"
              className="h-11 w-full rounded-full bg-[#0071e3] px-7 text-[15px] font-normal hover:bg-[#0077ed] sm:w-auto sm:text-[17px]"
              onClick={handleSearch}
            >
              Find a van
            </Button>
            <Button
              size="lg"
              variant="ghost"
              className="h-11 w-full rounded-full px-7 text-[15px] font-normal text-[#2997ff] hover:bg-white/10 hover:text-[#2997ff] sm:w-auto sm:text-[17px]"
              asChild
            >
              <Link to="/schedules">View schedules ›</Link>
            </Button>
          </motion.div>
        </motion.div>

        <motion.form
          variants={scaleIn}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.35, duration: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
          className="mt-0 w-full rounded-2xl bg-white/10 p-3 ring-1 ring-white/20 backdrop-blur-2xl sm:mt-12 sm:p-4 lg:p-5"
          onSubmit={(event) => {
            event.preventDefault()
            handleSearch()
          }}
        >
          <div className="-mx-1 mb-3 overflow-x-auto px-1 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:mx-0 sm:mb-4 sm:overflow-visible sm:px-0 sm:pb-0 [&::-webkit-scrollbar]:hidden">
            <div className="flex w-max min-w-full gap-2 sm:w-auto sm:flex-wrap">
            {TRIP_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setActiveTrip(type)}
                className={cn(
                  'shrink-0 rounded-full px-3.5 py-2 text-[12px] font-medium whitespace-nowrap transition-all duration-300 sm:px-4 sm:text-[13px]',
                  activeTrip === type
                    ? 'bg-white text-[#1d1d1f] shadow-sm'
                    : 'bg-white/10 text-white/90 hover:bg-white/20',
                )}
              >
                {type}
              </button>
            ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 xl:flex-row xl:items-stretch">
            <div className="flex flex-1 flex-col gap-3 sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:flex xl:flex-row xl:gap-3">
              <div className="relative flex min-w-0 flex-col gap-2 sm:col-span-2 sm:flex-row sm:gap-3 lg:col-span-2 xl:flex-[2] xl:basis-0">
                <PlaceInput
                  className="min-w-0 flex-1 basis-0"
                  value={from}
                  onChange={setFrom}
                  placeholder="Aurora"
                  region="aurora"
                />
                <button
                  type="button"
                  onClick={swapLocations}
                  aria-label="Swap locations"
                  className="mx-auto flex size-8 shrink-0 items-center justify-center rounded-full bg-[#1d1d1f] text-white shadow-md ring-2 ring-white/20 transition-colors hover:bg-[#2d2d2f] sm:absolute sm:top-1/2 sm:left-1/2 sm:z-10 sm:mx-0 sm:size-7 sm:-translate-x-1/2 sm:-translate-y-1/2"
                >
                  <ArrowLeftRight className="size-3.5" />
                </button>
                <PlaceInput
                  className="min-w-0 flex-1 basis-0"
                  value={to}
                  onChange={setTo}
                  placeholder="Metro Manila"
                  region="metro-manila"
                />
              </div>
              <DatePicker
                className="xl:flex-1 xl:basis-0"
                value={departureDate}
                onChange={setDepartureDate}
                min={todayDateInputValue()}
                placeholder="Select date"
              />
              {activeTrip !== 'One Way Trip' ? (
                <DatePicker
                  className="xl:flex-1 xl:basis-0"
                  value={returnDate}
                  onChange={setReturnDate}
                  min={departureDate || todayDateInputValue()}
                  placeholder="Return date"
                />
              ) : null}
              <PassengerField
                className="xl:flex-1 xl:basis-0"
                value={passengers}
                onChange={setPassengers}
              />
            </div>

            <Button
              type="submit"
              size="lg"
              className="h-12 w-full shrink-0 rounded-xl bg-[#0071e3] px-8 text-[15px] font-normal hover:bg-[#0077ed] xl:w-36"
            >
              Search
            </Button>
          </div>
        </motion.form>
      </div>
    </section>
  )
}

function PassengerField({
  value,
  onChange,
  className,
}: {
  value: string
  onChange: (value: string) => void
  className?: string
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        className={cn(
          'flex h-12 w-full min-w-0 items-center gap-2 rounded-xl border-0 bg-white/95 px-3 text-left shadow-none transition-colors hover:bg-white focus-visible:border-0 focus-visible:ring-0 data-[size=default]:h-12 [&_svg:last-child]:text-[#86868b]',
          className,
        )}
      >
        <Users className="size-4 shrink-0 text-[#86868b]" />
        <SelectValue placeholder="1–14 Passengers" />
      </SelectTrigger>
      <SelectContent>
        {Array.from({ length: 14 }, (_, index) => {
          const count = index + 1
          return (
            <SelectItem key={count} value={String(count)}>
              {count} passenger{count === 1 ? '' : 's'}
            </SelectItem>
          )
        })}
      </SelectContent>
    </Select>
  )
}
