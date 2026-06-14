import { createFileRoute } from '@tanstack/react-router'
import { FrequentRoutes } from '@/components/schedules/frequent-routes'
import { NetworkMonitoring } from '@/components/schedules/network-monitoring'
import { ScheduleHero } from '@/components/schedules/schedule-hero'
import { Footer } from '@/components/landing/footer'
import { Header } from '@/components/landing/header'

export const Route = createFileRoute('/schedules')({
  component: SchedulesPage,
})

function SchedulesPage() {
  return (
    <div className="app-page min-h-svh bg-[#f5f5f7]">
      <Header activeLink="schedules" />
      <ScheduleHero />

      <main className="mx-auto max-w-[980px] space-y-16 px-6 py-14 lg:px-8 lg:py-20">
        <FrequentRoutes />
        <NetworkMonitoring />
      </main>

      <Footer />
    </div>
  )
}
