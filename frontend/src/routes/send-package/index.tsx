import { createFileRoute } from '@tanstack/react-router'
import { Footer } from '@/components/landing/footer'
import { Header } from '@/components/landing/header'
import { SendPackageSearch } from '@/components/send-package/send-package-search'
import { validateTripSearch } from '@/lib/trip-search'

export const Route = createFileRoute('/send-package/')({
  validateSearch: validateTripSearch,
  component: SendPackagePage,
})

function SendPackagePage() {
  return (
    <div className="app-page min-h-svh bg-[#f5f5f7]">
      <Header activeLink="send-package" />
      <main className="mx-auto max-w-[980px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-14">
        <SendPackageSearch />
      </main>
      <Footer />
    </div>
  )
}
