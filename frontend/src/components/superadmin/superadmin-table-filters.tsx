import { Search } from 'lucide-react'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export type TableFilterOption = {
  value: string
  label: string
}

type FilterComboboxProps = {
  label: string
  value: string
  options: TableFilterOption[]
  onChange: (value: string) => void
}

function FilterCombobox({
  label,
  value,
  options,
  onChange,
}: FilterComboboxProps) {
  const selected = options.find((option) => option.value === value) ?? null

  return (
    <Combobox
      items={options}
      value={selected}
      onValueChange={(item) => {
        if (item) onChange(item.value)
      }}
      isItemEqualToValue={(a, b) => a.value === b.value}
    >
      <ComboboxInput
        placeholder={label}
        showClear={false}
        className="h-10 w-full rounded-full border border-[#d2d2d7] bg-white text-[14px] sm:w-[180px]"
      />
      <ComboboxContent>
        <ComboboxEmpty>No options found.</ComboboxEmpty>
        <ComboboxList>
          {(option) => (
            <ComboboxItem key={option.value} value={option}>
              {option.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
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
        <FilterCombobox
          key={filter.id}
          label={filter.label}
          value={filter.value}
          options={filter.options}
          onChange={filter.onChange}
        />
      ))}
    </div>
  )
}
