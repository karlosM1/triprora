import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearch } from '@tanstack/react-router'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { PageHeader } from '@/components/layout/page-header'
import { vansQueryOptions } from '@/lib/api/vans'
import { fadeInUp, staggerContainer } from '@/lib/motion'
import {
  filterVansBySidebarFilters,
  filterVansByTripSearch,
  formatTripSearchDate,
  resolveTripSearch,
  type VanSidebarFilters,
} from '@/lib/trip-search'
import { mapApiVans } from '@/lib/vans'
import { cn } from '@/lib/utils'
import { VanResultCard } from '@/components/find-vans/van-result-card'
import { Button } from '@/components/ui/button'

const RESULTS_PAGE_SIZE = 6

type SortOption = 'price' | 'departure'

function getRouteHeading(vans: ReturnType<typeof mapApiVans>) {
  if (vans.length === 0) {
    return {
      title: 'Available trips',
      subtitle: 'No published trips yet',
    }
  }

  const first = vans[0]!
  const sameRoute = vans.every(
    (van) =>
      van.departureLocation === first.departureLocation &&
      van.arrivalLocation === first.arrivalLocation,
  )

  return {
    title: sameRoute
      ? `${first.departureLocation} to ${first.arrivalLocation}`
      : 'Available trips',
    subtitle: `${vans.length} trip${vans.length === 1 ? '' : 's'} available`,
  }
}

function formatDisplayDate(departureDate?: string) {
  if (!departureDate) return 'Various dates'
  const date = new Date(`${departureDate}T00:00:00`)
  return date.toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export function SearchResults({ sidebarFilters }: { sidebarFilters: VanSidebarFilters }) {
  const search = resolveTripSearch(useSearch({ from: '/find-vans' }))
  const [sortBy, setSortBy] = useState<SortOption>('price')
  const [page, setPage] = useState(1)
  const resultsTopRef = useRef<HTMLDivElement>(null)
  const { data: vans = [], isLoading } = useQuery({
    ...vansQueryOptions(),
    select: mapApiVans,
  })

  const filteredResults = useMemo(() => {
    const searchMatches = filterVansByTripSearch(vans, search)
    return filterVansBySidebarFilters(searchMatches, sidebarFilters)
  }, [search, sidebarFilters, vans])

  const sortedResults = useMemo(
    () =>
      [...filteredResults].sort((a, b) => {
        if (sortBy === 'price') return a.price - b.price
        const aKey = `${a.departureDate ?? ''}T${a.departureTime}`
        const bKey = `${b.departureDate ?? ''}T${b.departureTime}`
        return aKey.localeCompare(bKey)
      }),
    [filteredResults, sortBy],
  )

  const totalPages = Math.max(1, Math.ceil(sortedResults.length / RESULTS_PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)

  const paginatedResults = useMemo(() => {
    const start = (currentPage - 1) * RESULTS_PAGE_SIZE
    return sortedResults.slice(start, start + RESULTS_PAGE_SIZE)
  }, [currentPage, sortedResults])

  const resultRangeStart =
    sortedResults.length === 0 ? 0 : (currentPage - 1) * RESULTS_PAGE_SIZE + 1
  const resultRangeEnd = Math.min(currentPage * RESULTS_PAGE_SIZE, sortedResults.length)

  useEffect(() => {
    setPage(1)
  }, [
    search.from,
    search.to,
    search.departureDate,
    search.passengers,
    sidebarFilters.departureTimes.join(','),
    sidebarFilters.priceMax,
    sortBy,
    sortedResults.length,
  ])

  function goToPage(nextPage: number) {
    setPage(nextPage)
    resultsTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const heading = getRouteHeading(filteredResults)
  const displayDate =
    formatTripSearchDate(search.departureDate) ??
    formatDisplayDate(filteredResults[0]?.departureDate)

  const sortControl = (
    <div className="shrink-0 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex gap-1 rounded-full bg-[#e8e8ed] p-1">
        <button
          type="button"
          onClick={() => setSortBy('price')}
          className={cn(
            'shrink-0 rounded-full px-3 py-1.5 text-[12px] font-medium whitespace-nowrap transition-all sm:px-4 sm:text-[13px]',
            sortBy === 'price'
              ? 'bg-white text-[#1d1d1f] shadow-sm'
              : 'text-[#86868b] hover:text-[#1d1d1f]',
          )}
        >
          Lowest price
        </button>
        <button
          type="button"
          onClick={() => setSortBy('departure')}
          className={cn(
            'shrink-0 rounded-full px-3 py-1.5 text-[12px] font-medium whitespace-nowrap transition-all sm:px-4 sm:text-[13px]',
            sortBy === 'departure'
              ? 'bg-white text-[#1d1d1f] shadow-sm'
              : 'text-[#86868b] hover:text-[#1d1d1f]',
          )}
        >
          Earliest departure
        </button>
      </div>
    </div>
  )

  return (
    <div ref={resultsTopRef} className="min-w-0 flex-1 scroll-mt-24">
      <PageHeader
        eyebrow="Find vans"
        title={
          search.from && search.to
            ? `${search.from} to ${search.to}`
            : heading.title
        }
        subtitle={`${displayDate} · ${heading.subtitle}`}
        action={sortControl}
      />

      <motion.div
        className="mt-8 space-y-4"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        {isLoading ? (
          <p className="text-[15px] text-[#86868b]">Loading trips...</p>
        ) : sortedResults.length === 0 ? (
          <motion.div
            variants={fadeInUp}
            className="rounded-2xl bg-white px-8 py-16 text-center ring-1 ring-black/5"
          >
            <Calendar className="mx-auto size-10 text-[#86868b]/60" />
            <p className="mt-4 text-[19px] font-semibold text-[#1d1d1f]">
              No trips match your search
            </p>
            <p className="mx-auto mt-2 max-w-sm text-[15px] leading-relaxed text-[#86868b]">
              Try different dates or locations, or check back when drivers publish new trips.
            </p>
          </motion.div>
        ) : (
          <>
            {paginatedResults.map((result) => (
              <motion.div key={result.id} variants={fadeInUp}>
                <VanResultCard result={result} />
              </motion.div>
            ))}

            {sortedResults.length > RESULTS_PAGE_SIZE && (
              <motion.div
                variants={fadeInUp}
                className="flex flex-col items-center justify-between gap-4 rounded-2xl bg-white px-4 py-4 ring-1 ring-black/5 sm:flex-row sm:px-6"
              >
                <p className="text-[13px] text-[#86868b]">
                  Showing{' '}
                  <span className="font-medium text-[#1d1d1f]">
                    {resultRangeStart}–{resultRangeEnd}
                  </span>{' '}
                  of{' '}
                  <span className="font-medium text-[#1d1d1f]">
                    {sortedResults.length}
                  </span>{' '}
                  trips
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-9 rounded-full px-4 text-[13px] text-[#0066cc] hover:bg-[#0071e3]/5 disabled:opacity-40"
                    disabled={currentPage <= 1}
                    onClick={() => goToPage(currentPage - 1)}
                  >
                    <ChevronLeft className="size-4" />
                    Previous
                  </Button>
                  <span className="min-w-24 text-center text-[13px] font-medium text-[#1d1d1f]">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-9 rounded-full px-4 text-[13px] text-[#0066cc] hover:bg-[#0071e3]/5 disabled:opacity-40"
                    disabled={currentPage >= totalPages}
                    onClick={() => goToPage(currentPage + 1)}
                  >
                    Next
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </motion.div>
            )}
          </>
        )}
      </motion.div>
    </div>
  )
}
