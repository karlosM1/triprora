import { motion } from 'framer-motion'
import { fadeInUp, staggerContainer, viewportOnce } from '@/lib/motion'

const partners = [
  { name: 'Cubao', abbr: 'CUB' },
  { name: 'Makati', abbr: 'MKT' },
  { name: 'Pasay', abbr: 'PSY' },
  { name: 'Quezon City', abbr: 'QC' },
  { name: 'Taguig', abbr: 'TAG' },
  { name: 'Manila', abbr: 'MNL' },
  { name: 'Caloocan', abbr: 'CAL' },
]

export function TrustSection() {
  return (
    <section className="bg-[#f5f5f7] px-6 py-20 lg:px-8 lg:py-24">
      <motion.div
        className="mx-auto max-w-[980px] text-center"
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={staggerContainer}
      >
        <motion.h2
          variants={fadeInUp}
          className="text-[32px] leading-tight font-semibold tracking-[-0.02em] text-[#1d1d1f] sm:text-[40px]"
        >
          Trusted by 2,000+ travelers.
        </motion.h2>
        <motion.p
          variants={fadeInUp}
          className="mx-auto mt-3 max-w-lg text-[17px] leading-relaxed text-[#86868b]"
        >
          Serving routes between Aurora and Metro Manila, both ways, with
          verified local drivers.
        </motion.p>

        <motion.div
          variants={staggerContainer}
          className="mt-14 flex flex-wrap items-center justify-center gap-x-12 gap-y-8"
        >
          {partners.map((partner) => (
            <motion.div
              key={partner.name}
              variants={fadeInUp}
              className="flex flex-col items-center gap-2"
            >
              <span className="flex size-12 items-center justify-center rounded-full bg-white text-xs font-semibold text-[#1d1d1f] shadow-sm">
                {partner.abbr}
              </span>
              <span className="text-xs font-medium tracking-wide text-[#86868b] uppercase">
                {partner.name}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  )
}
