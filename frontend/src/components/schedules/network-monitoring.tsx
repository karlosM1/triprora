import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { AppleCard } from '@/components/layout/page-header'
import { fetchSchedules, schedulesQueryKey } from '@/lib/api/schedules'
import { fadeInUp, viewportOnce } from '@/lib/motion'

export function NetworkMonitoring() {
  const { data, isLoading } = useQuery({
    queryKey: schedulesQueryKey,
    queryFn: fetchSchedules,
    select: (schedules) => schedules.networkStats,
  })

  if (isLoading || !data) {
    return (
      <AppleCard className="p-10">
        <p className="text-[15px] text-[#86868b]">Loading network stats...</p>
      </AppleCard>
    )
  }

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      variants={fadeInUp}
    >
      <AppleCard className="overflow-hidden">
        <div className="grid lg:grid-cols-2">
          <div className="p-8 lg:p-10">
            <p className="text-[13px] font-medium tracking-wide text-[#0066cc] uppercase">
              Fleet status
            </p>
            <h2 className="mt-2 text-[28px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">
              Network monitoring
            </h2>
            <p className="mt-3 max-w-md text-[15px] leading-relaxed text-[#86868b]">
              Real-time trip monitoring for our Aurora ↔ Metro Manila fleet.
              Track active departures and estimated travel times.
            </p>

            <div className="mt-10 grid grid-cols-2 gap-8">
              <div>
                <p className="text-[40px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">
                  {data.activeTrips}
                </p>
                <p className="mt-1 text-[14px] text-[#86868b]">
                  Active trips today
                </p>
              </div>
              <div>
                <p className="text-[40px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">
                  {data.avgWait}
                </p>
                <p className="mt-1 text-[14px] text-[#86868b]">
                  Avg. wait time
                </p>
              </div>
            </div>
          </div>

          <div className="relative min-h-64 bg-[#1d1d1f] lg:min-h-0">
            <div className="absolute inset-0 overflow-hidden">
              <svg
                className="size-full opacity-80"
                viewBox="0 0 400 300"
                preserveAspectRatio="xMidYMid slice"
              >
                <defs>
                  <radialGradient id="fleet-glow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#0071e3" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#0071e3" stopOpacity="0" />
                  </radialGradient>
                </defs>
                {[
                  [80, 150, 200, 80],
                  [200, 80, 320, 150],
                  [200, 150, 320, 220],
                  [80, 150, 200, 220],
                  [200, 80, 200, 220],
                ].map(([x1, y1, x2, y2], i) => (
                  <line
                    key={i}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="#0071e3"
                    strokeWidth="1"
                    strokeOpacity="0.35"
                  />
                ))}
                {[
                  [80, 150],
                  [200, 80],
                  [200, 150],
                  [200, 220],
                  [320, 150],
                  [320, 220],
                ].map(([cx, cy], i) => (
                  <g key={i}>
                    <circle cx={cx} cy={cy} r="20" fill="url(#fleet-glow)" />
                    <circle cx={cx} cy={cy} r="4" fill="#2997ff" />
                  </g>
                ))}
              </svg>
            </div>
            <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur-sm">
              <span className="size-2 rounded-full bg-[#34c759]" />
              <span className="text-[11px] font-medium tracking-wide text-white/90 uppercase">
                Live · Optimal
              </span>
            </div>
          </div>
        </div>
      </AppleCard>
    </motion.section>
  )
}
