import { useState } from 'react'
import { Clock } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

type TimePickerProps = {
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

type ParsedTime = {
  hour12: number
  minute: number
  period: 'AM' | 'PM'
}

function parseTime(value?: string): ParsedTime | null {
  if (!value || !/^\d{2}:\d{2}$/.test(value)) return null
  const [hours, minutes] = value.split(':').map(Number)
  if (hours > 23 || minutes > 59) return null
  return {
    hour12: hours % 12 || 12,
    minute: minutes,
    period: hours >= 12 ? 'PM' : 'AM',
  }
}

function toTimeValue(hour12: number, minute: number, period: 'AM' | 'PM') {
  let hours = hour12 % 12
  if (period === 'PM') hours += 12
  return `${String(hours).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

function formatTimeDisplay(value?: string) {
  const parsed = parseTime(value)
  if (!parsed) return null
  const { hour12, minute, period } = parsed
  return `${hour12}:${String(minute).padStart(2, '0')} ${period}`
}

const hours = Array.from({ length: 12 }, (_, index) => index + 1)
const minutes = Array.from({ length: 12 }, (_, index) => index * 5)

const quickTimes = [
  { label: '5:00 AM', value: '05:00' },
  { label: '6:00 AM', value: '06:00' },
  { label: '7:00 AM', value: '07:00' },
  { label: '8:00 AM', value: '08:00' },
  { label: '12:00 PM', value: '12:00' },
  { label: '3:00 PM', value: '15:00' },
  { label: '6:00 PM', value: '18:00' },
]

export function TimePicker({
  value,
  onChange,
  placeholder = 'Select time',
  className,
}: TimePickerProps) {
  const [open, setOpen] = useState(false)
  const parsed = parseTime(value) ?? { hour12: 6, minute: 0, period: 'AM' as const }

  function updateTime(patch: Partial<ParsedTime>) {
    const next = { ...parsed, ...patch }
    onChange(toTimeValue(next.hour12, next.minute, next.period))
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'flex h-11 w-full min-w-0 items-center gap-2 rounded-xl border border-[#d2d2d7] bg-white px-3 text-left transition-colors hover:bg-[#fafafa]',
            className,
          )}
        >
          <Clock className="size-4 shrink-0 text-[#86868b]" />
          <span
            className={cn(
              'min-w-0 flex-1 truncate text-[15px] font-normal',
              value ? 'text-[#1d1d1f]' : 'text-[#86868b]',
            )}
          >
            {formatTimeDisplay(value) ?? placeholder}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 rounded-xl p-0" align="start">
        <div className="border-b border-[#d2d2d7]/60 p-4">
          <p className="text-[13px] font-medium text-[#1d1d1f]">Departure time</p>
          <div className="mt-3 flex items-center gap-2">
            <Select
              value={String(parsed.hour12)}
              onValueChange={(next) => updateTime({ hour12: Number(next) })}
            >
              <SelectTrigger className="h-10 flex-1 rounded-lg border-[#d2d2d7] text-[15px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {hours.map((hour) => (
                  <SelectItem key={hour} value={String(hour)}>
                    {hour}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-[17px] font-medium text-[#86868b]">:</span>
            <Select
              value={String(parsed.minute).padStart(2, '0')}
              onValueChange={(next) => updateTime({ minute: Number(next) })}
            >
              <SelectTrigger className="h-10 flex-1 rounded-lg border-[#d2d2d7] text-[15px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {minutes.map((minute) => (
                  <SelectItem key={minute} value={String(minute).padStart(2, '0')}>
                    {String(minute).padStart(2, '0')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex flex-col gap-1">
              {(['AM', 'PM'] as const).map((period) => (
                <button
                  key={period}
                  type="button"
                  onClick={() => updateTime({ period })}
                  className={cn(
                    'rounded-lg px-2.5 py-1.5 text-[13px] font-medium transition-colors',
                    parsed.period === period
                      ? 'bg-[#1d1d1f] text-white'
                      : 'bg-[#f5f5f7] text-[#86868b] hover:text-[#1d1d1f]',
                  )}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="p-4">
          <p className="text-[12px] font-medium tracking-wide text-[#86868b] uppercase">
            Quick select
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {quickTimes.map((time) => (
              <button
                key={time.value}
                type="button"
                onClick={() => {
                  onChange(time.value)
                  setOpen(false)
                }}
                className={cn(
                  'rounded-full px-3 py-1.5 text-[13px] transition-colors',
                  value === time.value
                    ? 'bg-[#0071e3] text-white'
                    : 'bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#e8e8ed]',
                )}
              >
                {time.label}
              </button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
