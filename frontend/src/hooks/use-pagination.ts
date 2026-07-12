import { useMemo, useState } from 'react'

export const TABLE_PAGE_SIZE = 10

export function usePagination<T>(items: T[], pageSize = TABLE_PAGE_SIZE) {
  const [page, setPage] = useState(1)

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))
  const currentPage = Math.min(page, totalPages)

  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return items.slice(start, start + pageSize)
  }, [items, currentPage, pageSize])

  const rangeStart = items.length === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const rangeEnd = Math.min(currentPage * pageSize, items.length)

  function goToPage(nextPage: number) {
    setPage(Math.min(Math.max(1, nextPage), totalPages))
  }

  function resetPage() {
    setPage(1)
  }

  return {
    pageItems,
    currentPage,
    totalPages,
    rangeStart,
    rangeEnd,
    totalItems: items.length,
    pageSize,
    goToPage,
    resetPage,
    showPagination: items.length > pageSize,
  }
}
