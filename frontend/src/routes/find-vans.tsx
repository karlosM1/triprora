import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import {
  PriorityPassCard,
  SearchFilters,
} from '@/components/find-vans/search-filters'
import { SearchResults } from '@/components/find-vans/search-results'
import { Footer } from '@/components/landing/footer'
import { Header } from '@/components/landing/header'
import { DEFAULT_VAN_SIDEBAR_FILTERS, validateTripSearch } from '@/lib/trip-search'

export const Route = createFileRoute('/find-vans')({
  validateSearch: validateTripSearch,
  component: FindVansPage,
})

function FindVansPage() {
  const [sidebarFilters, setSidebarFilters] = useState(DEFAULT_VAN_SIDEBAR_FILTERS)

  return (
    <div className="app-page min-h-svh bg-[#f5f5f7]">
      <Header activeLink="find-vans" />
      <main className="mx-auto max-w-[980px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-14">
        <div className="flex flex-col gap-10 lg:flex-row lg:gap-12">
          <aside className="w-full shrink-0 space-y-4 lg:w-64 xl:w-72">
            <SearchFilters filters={sidebarFilters} onChange={setSidebarFilters} />
            <PriorityPassCard />
          </aside>
          <SearchResults sidebarFilters={sidebarFilters} />
        </div>
      </main>
      <Footer />
    </div>
  )
}
