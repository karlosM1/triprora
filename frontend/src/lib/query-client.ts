import { QueryClient } from '@tanstack/react-query'

/** Default: reuse cached data for 2 minutes before treating it as stale. */
export const DEFAULT_STALE_TIME = 1000 * 60 * 2

/** Keep unused cache entries for 10 minutes. */
export const DEFAULT_GC_TIME = 1000 * 60 * 10

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: DEFAULT_STALE_TIME,
      gcTime: DEFAULT_GC_TIME,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})
