import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

export type TableFilterOption = {
  value: string
  label: string
}

type SuperadminTableFiltersProps = {
  search: string
  onSearchChange: (value: string) => void
  searchPlaceholder?: string
  filters?: Array<{
    id: string
    label: string
    value: string
    options: TableFilterOption[]
    onChange: (value: string) => void
  }>
  className?: string
}

export function SuperadminTableFilters({
  search,
  onSearchChange,
  searchPlaceholder = 'Search…',
  filters = [],
  className,
}: SuperadminTableFiltersProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center',
        className,
      )}
    >
      <div className="relative min-w-0 flex-1 sm:max-w-sm">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#86868b]"
          strokeWidth={1.75}
        />
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={searchPlaceholder}
          className="h-10 rounded-full border-[#d2d2d7] bg-white pl-9 text-[14px]"
        />
      </div>

      {filters.map((filter) => (
        <Select
          key={filter.id}
          value={filter.value}
          onValueChange={(value) => {
            if (value) filter.onChange(value)
          }}
        >
          <SelectTrigger
            aria-label={filter.label}
            className="h-10 w-full rounded-full border-[#d2d2d7] bg-white sm:w-[160px]"
          >
            <SelectValue placeholder={filter.label} />
          </SelectTrigger>
          <SelectContent>
            {filter.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}
    </div>
  )
}
