import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Calendar, ChevronDown } from 'lucide-react'
import { fetchVans, vansQueryKey } from '@/lib/api/vans'
import { mapApiVans } from '@/lib/vans'
import { cn } from '@/lib/utils'
import { VanResultCard } from '@/components/find-vans/van-result-card'
import { Button } from '@/components/ui/button'

type SortOption = 'price' | 'departure'

export function SearchResults() {
  const [sortBy, setSortBy] = useState<SortOption>('price')
  const { data: vans = [], isLoading } = useQuery({
    queryKey: vansQueryKey,
    queryFn: fetchVans,
    select: mapApiVans,
  })

  const sortedResults = [...vans].sort((a, b) => {
    if (sortBy === 'price') return a.price - b.price
    return a.departureTime.localeCompare(b.departureTime)
  })

  return (
    <div className="min-w-0 flex-1">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Manila to Baguio
          </h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            <Calendar className="size-3.5" />
            October 24, 2024 &bull; {vans.length} Vans available
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
          <p className="text-sm text-muted-foreground">Loading vans...</p>
        ) : (
          sortedResults.map((result) => (
            <VanResultCard key={result.id} result={result} />
          ))
        )}
      </div>

      <div className="mt-8 flex justify-center">
        <Button
          variant="outline"
          className="rounded-lg border-border bg-white px-6 text-muted-foreground hover:bg-muted/50"
        >
          Load More Results
          <ChevronDown className="size-4" />
        </Button>
      </div>
    </div>
  )
}
