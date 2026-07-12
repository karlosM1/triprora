import { createFileRoute } from '@tanstack/react-router'
import { SlidersHorizontal } from 'lucide-react'
import { useState } from 'react'
import {
  countActiveSidebarFilters,
  PriorityPassCard,
  SearchFilters,
} from '@/components/find-vans/search-filters'
import { SearchResults } from '@/components/find-vans/search-results'
import { Footer } from '@/components/landing/footer'
import { Header } from '@/components/landing/header'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { DEFAULT_VAN_SIDEBAR_FILTERS, validateTripSearch } from '@/lib/trip-search'

export const Route = createFileRoute('/find-vans')({
  validateSearch: validateTripSearch,
  component: FindVansPage,
})

function FindVansPage() {
  const [sidebarFilters, setSidebarFilters] = useState(DEFAULT_VAN_SIDEBAR_FILTERS)
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)
  const activeFilterCount = countActiveSidebarFilters(sidebarFilters)

  return (
    <div className="app-page min-h-svh bg-[#f5f5f7]">
      <Header activeLink="find-vans" />
      <main className="mx-auto max-w-[980px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-14">
        <div className="flex flex-col gap-10 lg:flex-row lg:gap-12">
          <aside className="hidden w-full shrink-0 space-y-4 lg:block lg:w-64 xl:w-72">
            <SearchFilters filters={sidebarFilters} onChange={setSidebarFilters} />
            <PriorityPassCard />
          </aside>
          <SearchResults
            sidebarFilters={sidebarFilters}
            filterAction={
              <Button
                type="button"
                variant="outline"
                className="h-9 shrink-0 rounded-full border-[#d2d2d7] bg-white px-4 text-[13px] font-medium text-[#1d1d1f] hover:bg-[#f5f5f7] lg:hidden"
                onClick={() => setFilterDrawerOpen(true)}
              >
                <SlidersHorizontal className="size-4" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="ml-0.5 inline-flex size-5 items-center justify-center rounded-full bg-[#0071e3] text-[11px] font-semibold text-white">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            }
          />
        </div>
      </main>
      <Footer />

      <Drawer open={filterDrawerOpen} onOpenChange={setFilterDrawerOpen}>
        <DrawerContent className="bg-[#f5f5f7]">
          <DrawerHeader className="text-left">
            <DrawerTitle className="text-[20px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">
              Filters
            </DrawerTitle>
            <DrawerDescription className="text-[14px] text-[#86868b]">
              Narrow trips by departure time and price.
            </DrawerDescription>
          </DrawerHeader>

          <div className="overflow-y-auto px-4 pb-2">
            <SearchFilters
              embedded
              filters={sidebarFilters}
              onChange={setSidebarFilters}
              className="rounded-2xl bg-white p-5 ring-1 ring-black/5"
            />
          </div>

          <DrawerFooter className="gap-2 border-t border-black/5 bg-white">
            <DrawerClose asChild>
              <Button className="h-11 w-full rounded-full bg-[#0071e3] text-[15px] font-medium hover:bg-[#0077ed]">
                Show results
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  )
}
