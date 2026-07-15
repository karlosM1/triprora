import { useEffect, useState } from 'react'
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

function usePreferNativeDateInput() {
  const [preferNative, setPreferNative] = useState(false)

  useEffect(() => {
    const coarse = window.matchMedia('(hover: none) and (pointer: coarse)')
    const ios =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

    const update = () => setPreferNative(coarse.matches || ios)
    update()
    coarse.addEventListener('change', update)
    return () => coarse.removeEventListener('change', update)
  }, [])

  return preferNative
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
  const preferNative = usePreferNativeDateInput()
  const selected = parseTripSearchDate(value)
  const minDate = parseTripSearchDate(min)
  const maxDate = parseTripSearchDate(max)

  const disabled = [
    ...(minDate ? [{ before: minDate }] : []),
    ...(maxDate ? [{ after: maxDate }] : []),
  ]

  const defaultMonth = selected ?? maxDate ?? minDate ?? new Date()
  // On touch / iOS, avoid native <select> month/year dropdowns inside a
  // transformed popover — they trigger Safari's focus zoom.
  const effectiveCaptionLayout =
    preferNative && captionLayout === 'dropdown' ? 'label' : captionLayout
  const startMonth =
    minDate ??
    new Date(
      defaultMonth.getFullYear() -
        (effectiveCaptionLayout === 'dropdown' ? 100 : 20),
      0,
    )
  const endMonth =
    maxDate ??
    new Date(
      defaultMonth.getFullYear() +
        (effectiveCaptionLayout === 'dropdown' ? 20 : 5),
      11,
    )

  // Native date input avoids calendar month/year <select> zoom on iOS.
  if (preferNative) {
    return (
      <label
        className={cn(
          'flex h-12 w-full min-w-0 items-center gap-2 rounded-xl bg-white/95 px-3 text-left transition-colors focus-within:bg-white',
          className,
        )}
      >
        {icon ?? <CalendarIcon className="size-4 shrink-0 text-[#86868b]" />}
        <input
          type="date"
          value={value ?? ''}
          min={min}
          max={max}
          onChange={(event) => onChange(event.target.value)}
          aria-label={placeholder}
          style={{ fontSize: 16 }}
          className={cn(
            'min-w-0 flex-1 bg-transparent text-[16px] font-normal text-[#1d1d1f] outline-none',
            !value && 'text-[#1d1d1f]/50',
          )}
        />
      </label>
    )
  }

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
              'min-w-0 flex-1 truncate text-[16px] font-normal',
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
          startMonth={
            effectiveCaptionLayout === 'dropdown' ? startMonth : undefined
          }
          endMonth={
            effectiveCaptionLayout === 'dropdown' ? endMonth : undefined
          }
          captionLayout={effectiveCaptionLayout}
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
