import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

type TablePaginationProps = {
  currentPage: number
  totalPages: number
  rangeStart: number
  rangeEnd: number
  totalItems: number
  itemLabel?: string
  onPageChange: (page: number) => void
}

export function TablePagination({
  currentPage,
  totalPages,
  rangeStart,
  rangeEnd,
  totalItems,
  itemLabel = 'items',
  onPageChange,
}: TablePaginationProps) {
  if (totalItems === 0) return null

  return (
    <div className="flex flex-col items-center justify-between gap-4 border-t border-[#d2d2d7]/60 px-4 py-4 sm:flex-row sm:px-6">
      <p className="text-[13px] text-[#86868b]">
        Showing{' '}
        <span className="font-medium text-[#1d1d1f]">
          {rangeStart}–{rangeEnd}
        </span>{' '}
        of{' '}
        <span className="font-medium text-[#1d1d1f]">{totalItems}</span>{' '}
        {itemLabel}
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          className="h-9 rounded-full px-4 text-[13px] text-[#0066cc] hover:bg-[#0071e3]/5 disabled:opacity-40"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          <ChevronLeft className="size-4" />
          Previous
        </Button>
        <span className="min-w-24 text-center text-[13px] font-medium text-[#1d1d1f]">
          Page {currentPage} of {totalPages}
        </span>
        <Button
          type="button"
          variant="ghost"
          className="h-9 rounded-full px-4 text-[13px] text-[#0066cc] hover:bg-[#0071e3]/5 disabled:opacity-40"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  )
}
