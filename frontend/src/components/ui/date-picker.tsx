import { useState } from 'react'
import type { ReactNode } from 'react'
import { Calendar as CalendarIcon } from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  formatTripSearchDate,
  parseTripSearchDate,
  toDateInputValue,
} from '@/lib/trip-search'
import { cn } from '@/lib/utils'

type DatePickerProps = {
  value?: string
  onChange: (value: string) => void
  min?: string
  max?: string
  placeholder?: string
  className?: string
  icon?: ReactNode
  captionLayout?: 'label' | 'dropdown'
}

export function DatePicker({
  value,
  onChange,
  min,
  max,
  placeholder = 'Select date',
  className,
  icon,
  captionLayout = 'label',
}: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const selected = parseTripSearchDate(value)
  const minDate = parseTripSearchDate(min)
  const maxDate = parseTripSearchDate(max)

  const disabled = [
    ...(minDate ? [{ before: minDate }] : []),
    ...(maxDate ? [{ after: maxDate }] : []),
  ]

  const defaultMonth = selected ?? maxDate ?? minDate ?? new Date()
  const startMonth =
    minDate ??
    new Date(defaultMonth.getFullYear() - (captionLayout === 'dropdown' ? 100 : 20), 0)
  const endMonth =
    maxDate ??
    new Date(defaultMonth.getFullYear() + (captionLayout === 'dropdown' ? 20 : 5), 11)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'flex h-12 w-full min-w-0 items-center gap-2 rounded-xl bg-white/95 px-3 text-left transition-colors hover:bg-white',
            className,
          )}
        >
          {icon ?? (
            <CalendarIcon className="size-4 shrink-0 text-[#86868b]" />
          )}
          <span
            className={cn(
              'min-w-0 flex-1 truncate text-[13px] font-normal',
              value ? 'text-[#1d1d1f]/80' : 'text-[#1d1d1f]/50',
            )}
          >
            {formatTripSearchDate(value) ?? placeholder}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          defaultMonth={defaultMonth}
          startMonth={captionLayout === 'dropdown' ? startMonth : undefined}
          endMonth={captionLayout === 'dropdown' ? endMonth : undefined}
          captionLayout={captionLayout}
          disabled={disabled.length > 0 ? disabled : undefined}
          onSelect={(date) => {
            if (!date) return
            onChange(toDateInputValue(date))
            setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
