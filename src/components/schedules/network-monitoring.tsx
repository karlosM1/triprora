import { networkStats } from '@/lib/schedules-data'

export function NetworkMonitoring() {
  return (
    <section className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/5">
      <div className="grid lg:grid-cols-2">
        <div className="p-8 lg:p-10">
          <h2 className="text-xl font-bold text-foreground">
            Network Monitoring
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
            Our predictive scheduling engine monitors fleet movement across all
            corridors in real time, ensuring 99.8% on-time performance for
            institutional clients.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-6">
            <div>
              <p className="text-3xl font-bold text-foreground">
                {networkStats.activeTrips}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Active Trips Today
              </p>
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground">
                {networkStats.avgWait}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Avg. Wait Time
              </p>
            </div>
          </div>
        </div>

        <div className="relative min-h-64 bg-[#0f172a] lg:min-h-0">
          <div className="absolute inset-0 overflow-hidden">
            <svg
              className="size-full opacity-80"
              viewBox="0 0 400 300"
              preserveAspectRatio="xMidYMid slice"
            >
              <defs>
                <radialGradient id="glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
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
                  stroke="#6366f1"
                  strokeWidth="1"
                  strokeOpacity="0.4"
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
                  <circle cx={cx} cy={cy} r="20" fill="url(#glow)" />
                  <circle cx={cx} cy={cy} r="4" fill="#818cf8" />
                </g>
              ))}
            </svg>
          </div>
          <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-md bg-black/40 px-3 py-1.5 backdrop-blur-sm">
            <span className="size-2 rounded-full bg-emerald-400" />
            <span className="text-[10px] font-semibold tracking-wide text-white uppercase">
              Live Fleet Status: Optimal
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
