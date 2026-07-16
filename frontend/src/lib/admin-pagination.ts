export const ADMIN_TABLE_PAGE_SIZE = 10

export function getServerPageRange(
  page: number,
  pageSize: number,
  total: number,
) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const currentPage = Math.min(Math.max(1, page), totalPages)
  const rangeStart = total === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const rangeEnd = Math.min(currentPage * pageSize, total)

  return {
    currentPage,
    totalPages,
    rangeStart,
    rangeEnd,
    showPagination: total > pageSize,
  }
}
