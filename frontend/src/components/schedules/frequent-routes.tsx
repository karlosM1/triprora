import { useQuery } from '@tanstack/react-query'
import { Building2, Bus, Clock, Mountain, Timer } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { AppleCard, SectionTitle } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { fetchSchedules, schedulesQueryKey } from '@/lib/api/schedules'
import { fadeInUp, staggerContainer, viewportOnce } from '@/lib/motion'
import type { RouteCard } from '@/lib/types/api'

export function FrequentRoutes() {
  const { data, isLoading } = useQuery({
    queryKey: schedulesQueryKey,
    queryFn: fetchSchedules,
  })

  if (isLoading || !data) {
    return (
      <section>
        <p className="text-[15px] text-[#86868b]">Loading routes...</p>
      </section>
    )
  }

  const { featuredRoute, businessRoute, compactRoutes } = data

  return (
    <section>
      <SectionTitle
        title="Frequent routes"
        subtitle="Popular door-to-door connections across Aurora, plus Casiguran to Metro Manila."
        action={
          <span className="text-[13px] font-medium text-[#0066cc]">
            Live fleet data
          </span>
        }
      />

      <motion.div
        className="grid gap-4 lg:grid-cols-3"
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={staggerContainer}
      >
        <FeaturedRouteCard route={featuredRoute} />
        <BusinessRouteCard route={businessRoute} />

        {compactRoutes.map((route) => (
          <CompactRouteCard key={route.id} route={route} />
        ))}
      </motion.div>
    </section>
  )
}

function FeaturedRouteCard({
  route,
}: {
  route: {
    label: string
    title: string
    availability: string
    departures: string
    duration: string
  }
}) {
  return (
    <motion.div variants={fadeInUp} className="lg:col-span-2 lg:row-span-2">
      <AppleCard className="flex h-full flex-col justify-between p-8">
        <div>
          <p className="text-[13px] font-medium tracking-wide text-[#0066cc] uppercase">
            {route.label}
          </p>
          <div className="mt-3 flex items-start justify-between gap-4">
            <h3 className="text-[28px] leading-tight font-semibold tracking-[-0.02em] text-[#1d1d1f] sm:text-[32px]">
              {route.title}
            </h3>
            <p className="shrink-0 text-right text-[15px] font-medium text-[#86868b]">
              {route.availability}
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <p className="flex items-center gap-2 text-[15px] text-[#86868b]">
              <Clock className="size-4 text-[#86868b]" />
              {route.departures}
            </p>
            <p className="flex items-center gap-2 text-[15px] text-[#86868b]">
              <Timer className="size-4 text-[#86868b]" />
              {route.duration}
            </p>
          </div>
          <Button
            className="h-10 rounded-full bg-[#0071e3] px-6 text-[14px] font-normal hover:bg-[#0077ed]"
            asChild
          >
            <Link to="/find-vans">Book now</Link>
          </Button>
        </div>
      </AppleCard>
    </motion.div>
  )
}

function BusinessRouteCard({
  route,
}: {
  route: {
    label: string
    title: string
    description: string
    frequency: string
  }
}) {
  return (
    <motion.div variants={fadeInUp} className="lg:col-span-1 lg:row-span-2">
      <AppleCard className="flex h-full flex-col justify-between p-6">
        <div>
          <span className="text-[12px] font-medium text-[#0066cc] uppercase">
            {route.label}
          </span>
          <h3 className="mt-3 text-[19px] font-semibold text-[#1d1d1f]">
            {route.title}
          </h3>
          <p className="mt-2 text-[15px] leading-relaxed text-[#86868b]">
            {route.description}
          </p>
        </div>
        <div className="mt-6">
          <p className="text-[13px] text-[#86868b]">{route.frequency}</p>
          <Button
            variant="ghost"
            className="mt-4 h-10 w-full rounded-full text-[14px] text-[#0066cc] hover:bg-[#0071e3]/5 hover:text-[#0077ed]"
          >
            View details ›
          </Button>
        </div>
      </AppleCard>
    </motion.div>
  )
}

function CompactRouteCard({ route }: { route: RouteCard }) {
  const Icon =
    route.icon === 'bus'
      ? Bus
      : route.icon === 'mountains'
        ? Mountain
        : Building2

  return (
    <motion.div variants={fadeInUp}>
      <AppleCard className="flex h-full flex-col justify-between p-5">
        <div>
          <div className="flex size-10 items-center justify-center rounded-xl bg-[#f5f5f7]">
            <Icon className="size-4 text-[#86868b]" />
          </div>
          <h3 className="mt-4 text-[17px] font-semibold text-[#1d1d1f]">
            {route.name}
          </h3>
          <p className="text-[13px] text-[#86868b]">{route.location}</p>
          <div className="mt-3 flex gap-4 text-[13px] text-[#86868b]">
            <span>{route.frequency}</span>
            <span>{route.duration}</span>
          </div>
        </div>
        <Button
          variant="ghost"
          className="mt-5 h-9 w-full rounded-full text-[14px] text-[#0066cc] hover:bg-[#0071e3]/5"
          asChild
        >
          <Link to="/find-vans">Book ›</Link>
        </Button>
      </AppleCard>
    </motion.div>
  )
}
