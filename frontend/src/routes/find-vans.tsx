import { createFileRoute } from '@tanstack/react-router'
import { FindVansFooter } from '@/components/find-vans/find-vans-footer'
import {
  PriorityPassCard,
  SearchFilters,
} from '@/components/find-vans/search-filters'
import { SearchResults } from '@/components/find-vans/search-results'
import { Header } from '@/components/landing/header'

export const Route = createFileRoute('/find-vans')({
  component: FindVansPage,
})

function FindVansPage() {
  return (
    <div className="min-h-svh bg-[#F8F9FB]">
      <Header activeLink="find-vans" />
      <main className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          <aside className="w-full shrink-0 space-y-5 lg:w-64 xl:w-72">
            <SearchFilters />
            <PriorityPassCard />
          </aside>
          <SearchResults />
        </div>
      </main>
      <FindVansFooter />
    </div>
  )
}
