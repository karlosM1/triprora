import { Columns3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

export type ColumnPickerOption = {
  id: string
  label: string
}

type SuperadminColumnPickerProps = {
  columns: ColumnPickerOption[]
  visible: Record<string, boolean>
  onToggle: (columnId: string, visible: boolean) => void
  onReset?: () => void
  className?: string
}

export function SuperadminColumnPicker({
  columns,
  visible,
  onToggle,
  onReset,
  className,
}: SuperadminColumnPickerProps) {
  const visibleCount = columns.filter((column) => visible[column.id]).length

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            'h-10 rounded-full border-[#d2d2d7] bg-white px-4 text-[14px] text-[#1d1d1f] hover:bg-[#f5f5f7]',
            className,
          )}
        >
          <Columns3 className="size-4 text-[#86868b]" strokeWidth={1.75} />
          Columns
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 p-0">
        <PopoverHeader className="border-b border-black/5 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <PopoverTitle className="text-[14px] text-[#1d1d1f]">
              Visible columns
            </PopoverTitle>
            {onReset && (
              <button
                type="button"
                onClick={onReset}
                className="text-[12px] font-medium text-[#0066cc] hover:underline"
              >
                Reset
              </button>
            )}
          </div>
          <p className="text-[12px] text-[#86868b]">
            Choose which columns appear in the table.
          </p>
        </PopoverHeader>
        <div className="no-scrollbar max-h-72 overflow-y-auto p-2">
          {columns.map((column) => {
            const isVisible = visible[column.id]
            const isLastVisible = isVisible && visibleCount <= 1

            return (
              <label
                key={column.id}
                className={cn(
                  'flex items-center justify-between gap-3 rounded-lg px-3 py-2.5',
                  isLastVisible
                    ? 'cursor-not-allowed opacity-60'
                    : 'cursor-pointer hover:bg-[#f5f5f7]',
                )}
              >
                <span className="text-[14px] text-[#1d1d1f]">{column.label}</span>
                <Switch
                  checked={isVisible}
                  disabled={isLastVisible}
                  onCheckedChange={(checked) => onToggle(column.id, checked)}
                  aria-label={`Toggle ${column.label} column`}
                />
              </label>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export function buildDefaultColumnVisibility(
  columns: ColumnPickerOption[],
  defaultVisible = true,
) {
  return Object.fromEntries(
    columns.map((column) => [column.id, defaultVisible]),
  ) as Record<string, boolean>
}

export function readStoredColumnVisibility(
  storageKey: string,
  columns: ColumnPickerOption[],
) {
  if (typeof window === 'undefined') {
    return buildDefaultColumnVisibility(columns)
  }

  try {
    const raw = window.localStorage.getItem(storageKey)
    if (!raw) return buildDefaultColumnVisibility(columns)

    const parsed = JSON.parse(raw) as Record<string, boolean>
    const next = buildDefaultColumnVisibility(columns, false)

    for (const column of columns) {
      if (typeof parsed[column.id] === 'boolean') {
        next[column.id] = parsed[column.id]
      } else {
        next[column.id] = true
      }
    }

    if (!columns.some((column) => next[column.id])) {
      return buildDefaultColumnVisibility(columns)
    }

    return next
  } catch {
    return buildDefaultColumnVisibility(columns)
  }
}

export function writeStoredColumnVisibility(
  storageKey: string,
  visible: Record<string, boolean>,
) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(storageKey, JSON.stringify(visible))
}
