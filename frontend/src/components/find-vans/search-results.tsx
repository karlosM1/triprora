import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Calendar } from 'lucide-react'
import { motion } from 'framer-motion'
import { PageHeader } from '@/components/layout/page-header'
import { fetchVans, vansQueryKey } from '@/lib/api/vans'
import { fadeInUp, staggerContainer } from '@/lib/motion'
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
  const [sortBy, setSortBy] = useState<SortOption>('price')
  const { data: vans = [], isLoading } = useQuery({
    queryKey: vansQueryKey,
    queryFn: fetchVans,
    select: mapApiVans,
  })

  const sortedResults = useMemo(
    () =>
      [...vans].sort((a, b) => {
        if (sortBy === 'price') return a.price - b.price
        const aKey = `${a.departureDate ?? ''}T${a.departureTime}`
        const bKey = `${b.departureDate ?? ''}T${b.departureTime}`
        return aKey.localeCompare(bKey)
      }),
    [sortBy, vans],
  )

  const heading = getRouteHeading(vans)
  const displayDate = formatDisplayDate(vans[0]?.departureDate)

  const sortControl = (
    <div className="flex rounded-full bg-[#e8e8ed] p-1">
      <button
        type="button"
        onClick={() => setSortBy('price')}
        className={cn(
          'rounded-full px-4 py-1.5 text-[13px] font-medium transition-all',
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
          'rounded-full px-4 py-1.5 text-[13px] font-medium transition-all',
          sortBy === 'departure'
            ? 'bg-white text-[#1d1d1f] shadow-sm'
            : 'text-[#86868b] hover:text-[#1d1d1f]',
        )}
      >
        Earliest departure
      </button>
    </div>
  )

  return (
    <div className="min-w-0 flex-1">
      <PageHeader
        eyebrow="Find vans"
        title={heading.title}
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
              No trips available yet
            </p>
            <p className="mx-auto mt-2 max-w-sm text-[15px] leading-relaxed text-[#86868b]">
              Door-to-door van trips between Aurora and Metro Manila will appear
              here when drivers publish them.
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
