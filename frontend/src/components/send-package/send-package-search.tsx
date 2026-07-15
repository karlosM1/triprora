import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { ArrowLeftRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { DeliveryTripCard } from '@/components/send-package/delivery-trip-card'
import { DeliveryStepper } from '@/components/send-package/delivery-stepper'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import { PlaceInput } from '@/components/ui/place-input'
import { vansQueryOptions } from '@/lib/api/vans'
import { fadeInUp, staggerContainer } from '@/lib/motion'
import { TRIP_DESTINATION_PLACES } from '@/lib/places'
import {
  formatTripSearchDate,
  resolveTripSearch,
  todayDateInputValue,
  validateTripSearch,
} from '@/lib/trip-search'
import { mapApiVans } from '@/lib/vans'

const RESULTS_PAGE_SIZE = 6

export function SendPackageSearch() {
  const navigate = useNavigate({ from: '/send-package/' })
  const rawSearch = useSearch({ from: '/send-package/' })
  const search = resolveTripSearch(rawSearch)

  const [from, setFrom] = useState(search.from)
  const [to, setTo] = useState(search.to)
  const [departureDate, setDepartureDate] = useState(search.departureDate ?? '')
  const [page, setPage] = useState(1)
  const resultsTopRef = useRef<HTMLDivElement>(null)

  const hasSearched = Boolean(rawSearch.from || rawSearch.to || rawSearch.departureDate)

  const listParams = {
    from: search.from,
    to: search.to,
    departureDate: search.departureDate,
    passengers: 1,
    sort: 'departure' as const,
    page,
    pageSize: RESULTS_PAGE_SIZE,
  }

  const { data, isLoading, isFetching } = useQuery({
    ...vansQueryOptions(listParams),
    enabled: hasSearched,
  })

  const results = mapApiVans(data?.items ?? [])
  const total = data?.total ?? 0
  const pageSize = data?.pageSize ?? RESULTS_PAGE_SIZE
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const currentPage = Math.min(page, totalPages)

  useEffect(() => {
    setFrom(search.from)
    setTo(search.to)
    setDepartureDate(search.departureDate ?? '')
  }, [search.from, search.to, search.departureDate])

  useEffect(() => {
    setPage(1)
  }, [search.from, search.to, search.departureDate])

  function swapLocations() {
    setFrom(to)
    setTo(from)
  }

  function handleSearch() {
    void navigate({
      to: '/send-package',
      search: validateTripSearch({
        from,
        to,
        departureDate: departureDate || undefined,
        passengers: 1,
      }),
    })
  }

  function goToPage(nextPage: number) {
    setPage(nextPage)
    resultsTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const displayDate =
    formatTripSearchDate(search.departureDate) ?? 'Any date'

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="space-y-10"
    >
      <motion.div variants={fadeInUp}>
        <DeliveryStepper currentStep={1} />
      </motion.div>

      <motion.div variants={fadeInUp}>
        <PageHeader
          eyebrow="Send a package"
          title="Book a driver for delivery"
          subtitle="Choose pickup and drop-off, then pick a published van trip to carry your package."
        />
      </motion.div>

      <motion.form
        variants={fadeInUp}
        className="rounded-2xl bg-[#e8e8ed] p-4 ring-1 ring-black/5 sm:p-6"
        onSubmit={(event) => {
          event.preventDefault()
          handleSearch()
        }}
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          <div className="relative flex min-w-0 flex-1 flex-col gap-3 sm:flex-row">
            <PlaceInput
              className="min-w-0 flex-1"
              fieldClassName="bg-white hover:bg-white focus-within:bg-white"
              value={from}
              onChange={setFrom}
              placeholder="Pickup area"
              places={TRIP_DESTINATION_PLACES}
            />
            <button
              type="button"
              onClick={swapLocations}
              className="absolute top-1/2 right-3 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[#1d1d1f] shadow-sm ring-1 ring-black/5 sm:static sm:translate-y-0"
              aria-label="Swap locations"
            >
              <ArrowLeftRight className="size-4" />
            </button>
            <PlaceInput
              className="min-w-0 flex-1"
              fieldClassName="bg-white hover:bg-white focus-within:bg-white"
              value={to}
              onChange={setTo}
              placeholder="Drop-off area"
              places={TRIP_DESTINATION_PLACES}
            />
          </div>
          <DatePicker
            className="w-full bg-white hover:bg-white lg:w-48"
            value={departureDate || todayDateInputValue()}
            onChange={setDepartureDate}
          />
          <Button
            type="submit"
            className="h-11 rounded-full bg-[#0071e3] px-7 text-[15px] hover:bg-[#0077ed]"
          >
            Find trips
          </Button>
        </div>
      </motion.form>

      {hasSearched && (
        <motion.div variants={fadeInUp} ref={resultsTopRef} className="space-y-6">
          <div>
            <h2 className="text-[21px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">
              {search.from} to {search.to}
            </h2>
            <p className="mt-1 text-[14px] text-[#86868b]">
              {isLoading || isFetching
                ? 'Searching trips…'
                : `${total} trip${total === 1 ? '' : 's'} · ${displayDate}`}
            </p>
          </div>

          {isLoading ? (
            <p className="text-[15px] text-[#86868b]">Loading trips…</p>
          ) : results.length === 0 ? (
            <p className="rounded-2xl bg-white p-8 text-center text-[15px] text-[#86868b] ring-1 ring-black/5">
              No published trips match this route yet. Try another date or
              direction.
            </p>
          ) : (
            <div className="space-y-4">
              {results.map((result) => (
                <DeliveryTripCard
                  key={result.id}
                  result={result}
                  pickupAddress={search.from}
                  dropoffAddress={search.to}
                />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-9 rounded-full"
                disabled={currentPage <= 1}
                onClick={() => goToPage(currentPage - 1)}
              >
                <ChevronLeft className="size-4" />
                Previous
              </Button>
              <span className="text-[13px] text-[#86868b]">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                className="h-9 rounded-full"
                disabled={currentPage >= totalPages}
                onClick={() => goToPage(currentPage + 1)}
              >
                Next
                <ChevronRight className="size-4" />
              </Button>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}
