import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Calendar, ChevronDown } from 'lucide-react'
import { fetchVans, vansQueryKey } from '@/lib/api/vans'
import { mapApiVans } from '@/lib/vans'
import { cn } from '@/lib/utils'
import { VanResultCard } from '@/components/find-vans/van-result-card'
import { Button } from '@/components/ui/button'

type SortOption = 'price' | 'departure'

function getRouteHeading(vans: ReturnType<typeof mapApiVans>) {
  if (vans.length === 0) {
    return {
      title: 'Available Trips',
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
      : 'Available Trips',
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

  return (
    <div className="min-w-0 flex-1">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {heading.title}
          </h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            <Calendar className="size-3.5" />
            {displayDate} &bull; {heading.subtitle}
          </p>
        </div>

        <div className="flex shrink-0 rounded-lg bg-muted p-1">
          <button
            type="button"
            onClick={() => setSortBy('price')}
            className={cn(
              'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
              sortBy === 'price'
                ? 'bg-white text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            Price: Low to High
          </button>
          <button
            type="button"
            onClick={() => setSortBy('departure')}
            className={cn(
              'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
              sortBy === 'departure'
                ? 'bg-white text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            Earliest Departure
          </button>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading trips...</p>
        ) : sortedResults.length === 0 ? (
          <div className="rounded-xl bg-white p-8 text-center shadow-sm ring-1 ring-black/5">
            <p className="font-medium text-foreground">No trips available yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Published driver routes will appear here for passengers to book.
            </p>
          </div>
        ) : (
          sortedResults.map((result) => (
            <VanResultCard key={result.id} result={result} />
          ))
        )}
      </div>

      {sortedResults.length > 0 && (
        <div className="mt-8 flex justify-center">
          <Button
            variant="outline"
            className="rounded-lg border-border bg-white px-6 text-muted-foreground hover:bg-muted/50"
          >
            Load More Results
            <ChevronDown className="size-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
