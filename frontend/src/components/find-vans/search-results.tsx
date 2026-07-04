import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearch } from '@tanstack/react-router'
import { Calendar } from 'lucide-react'
import { motion } from 'framer-motion'
import { PageHeader } from '@/components/layout/page-header'
import { vansQueryOptions } from '@/lib/api/vans'
import { fadeInUp, staggerContainer } from '@/lib/motion'
import {
  filterVansByTripSearch,
  formatTripSearchDate,
  resolveTripSearch,
} from '@/lib/trip-search'
import { mapApiVans } from '@/lib/vans'
import { cn } from '@/lib/utils'
import { VanResultCard } from '@/components/find-vans/van-result-card'

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

export function SearchResults() {
  const search = resolveTripSearch(useSearch({ from: '/find-vans' }))
  const [sortBy, setSortBy] = useState<SortOption>('price')
  const { data: vans = [], isLoading } = useQuery({
    ...vansQueryOptions(),
    select: mapApiVans,
  })

  const filteredResults = useMemo(
    () => filterVansByTripSearch(vans, search),
    [search, vans],
  )

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

  const heading = getRouteHeading(filteredResults)
  const displayDate =
    formatTripSearchDate(search.departureDate) ??
    formatDisplayDate(filteredResults[0]?.departureDate)
  const passengerLabel = `${search.passengers} passenger${search.passengers === 1 ? '' : 's'}`

  const sortControl = (
    <div className="w-full overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] sm:w-auto [&::-webkit-scrollbar]:hidden">
      <div className="flex w-max min-w-full rounded-full bg-[#e8e8ed] p-1 sm:min-w-0">
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
    <div className="min-w-0 flex-1">
      <PageHeader
        eyebrow="Find vans"
        title={
          search.from && search.to
            ? `${search.from} to ${search.to}`
            : heading.title
        }
        subtitle={`${displayDate} · ${passengerLabel} · ${heading.subtitle}`}
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
              {search.tripType === 'Multi City'
                ? 'Multi-city trips are coming soon'
                : 'No trips match your search'}
            </p>
            <p className="mx-auto mt-2 max-w-sm text-[15px] leading-relaxed text-[#86868b]">
              {search.tripType === 'Multi City'
                ? 'For now, try a one-way or round-trip search between Aurora and Metro Manila.'
                : 'Try different dates or locations, or check back when drivers publish new trips.'}
            </p>
          </motion.div>
        ) : (
          sortedResults.map((result) => (
            <motion.div key={result.id} variants={fadeInUp}>
              <VanResultCard result={result} />
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  )
}
