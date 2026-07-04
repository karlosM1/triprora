import { createFileRoute } from '@tanstack/react-router'
import {
  PriorityPassCard,
  SearchFilters,
} from '@/components/find-vans/search-filters'
import { SearchResults } from '@/components/find-vans/search-results'
import { Footer } from '@/components/landing/footer'
import { Header } from '@/components/landing/header'
import { validateTripSearch } from '@/lib/trip-search'

export const Route = createFileRoute('/find-vans')({
  validateSearch: validateTripSearch,
  component: FindVansPage,
})

function FindVansPage() {
  return (
    <div className="app-page min-h-svh bg-[#f5f5f7]">
      <Header activeLink="find-vans" />
      <main className="mx-auto max-w-[980px] px-6 py-10 lg:px-8 lg:py-14">
        <div className="flex flex-col gap-10 lg:flex-row lg:gap-12">
          <aside className="w-full shrink-0 space-y-4 lg:w-64 xl:w-72">
            <SearchFilters />
            <PriorityPassCard />
          </aside>
          <SearchResults />
        </div>
      </main>
      <Footer />
    </div>
  )
}
