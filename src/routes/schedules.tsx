import { createFileRoute } from '@tanstack/react-router'
import { FrequentRoutes } from '@/components/schedules/frequent-routes'
import { NetworkMonitoring } from '@/components/schedules/network-monitoring'
import { ScheduleHero } from '@/components/schedules/schedule-hero'
import { SchedulesFooter } from '@/components/schedules/schedules-footer'
import { Header } from '@/components/landing/header'

export const Route = createFileRoute('/schedules')({
  component: SchedulesPage,
})

function SchedulesPage() {
  return (
    <div className="min-h-svh bg-[#F8F9FB]">
      <Header activeLink="schedules" />
      <ScheduleHero />

      <main className="mx-auto max-w-7xl space-y-12 px-6 py-12 lg:px-8 lg:py-16">
        <FrequentRoutes />
        <NetworkMonitoring />
      </main>

      <SchedulesFooter />
    </div>
  )
}
