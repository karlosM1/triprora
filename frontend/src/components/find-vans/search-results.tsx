import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearch } from '@tanstack/react-router'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { PageHeader } from '@/components/layout/page-header'
import { vansQueryOptions } from '@/lib/api/vans'
import { fadeInUp, staggerContainer } from '@/lib/motion'
import {
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

function getRouteHeading(total: number, from: string, to: string) {
  if (total === 0) {
    return {
      title: 'Available trips',
      subtitle: 'No published trips yet',
    }
  }

  return {
    title: from && to ? `${from} to ${to}` : 'Available trips',
    subtitle: `${total} trip${total === 1 ? '' : 's'} available`,
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

export function SearchResults({
  sidebarFilters,
  filterAction,
}: {
  sidebarFilters: VanSidebarFilters
  filterAction?: ReactNode
}) {
  const search = resolveTripSearch(useSearch({ from: '/find-vans' }))
  const [sortBy, setSortBy] = useState<SortOption>('price')
  const [page, setPage] = useState(1)
  const resultsTopRef = useRef<HTMLDivElement>(null)

  const listParams = {
    from: search.from,
    to: search.to,
    departureDate: search.departureDate,
    passengers: search.passengers,
    priceMax: sidebarFilters.priceMax,
    departureTimes: sidebarFilters.departureTimes,
    sort: sortBy,
    page,
    pageSize: RESULTS_PAGE_SIZE,
  }

  const { data, isLoading } = useQuery(vansQueryOptions(listParams))
  const results = mapApiVans(data?.items ?? [])
  const total = data?.total ?? 0
  const pageSize = data?.pageSize ?? RESULTS_PAGE_SIZE
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const currentPage = Math.min(page, totalPages)

  const resultRangeStart = total === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const resultRangeEnd = Math.min(currentPage * pageSize, total)

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
  ])

  function goToPage(nextPage: number) {
    setPage(nextPage)
    resultsTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const heading = getRouteHeading(total, search.from, search.to)
  const displayDate =
    formatTripSearchDate(search.departureDate) ??
    formatDisplayDate(results[0]?.departureDate)

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
        action={
          <div className="flex flex-wrap items-center gap-2">
            {filterAction}
            {sortControl}
          </div>
        }
      />

      <motion.div
        className="mt-8 space-y-4"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        {isLoading ? (
          <p className="text-[15px] text-[#86868b]">Loading trips...</p>
        ) : total === 0 ? (
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
            {results.map((result) => (
              <motion.div key={result.id} variants={fadeInUp}>
                <VanResultCard result={result} />
              </motion.div>
            ))}

            {total > pageSize && (
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
                  <span className="font-medium text-[#1d1d1f]">{total}</span>{' '}
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
