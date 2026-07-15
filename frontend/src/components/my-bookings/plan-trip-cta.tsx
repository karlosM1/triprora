import { Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { fadeInUp, staggerContainer, viewportOnce } from '@/lib/motion'

export function PlanTripCta() {
  return (
    <motion.section
      className="rounded-3xl bg-[#1d1d1f] px-8 py-14 text-center sm:px-12"
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      variants={staggerContainer}
    >
      <motion.h2
        variants={fadeInUp}
        className="text-[28px] font-semibold tracking-[-0.02em] text-white sm:text-[32px]"
      >
        Plan your next trip.
      </motion.h2>
      <motion.p
        variants={fadeInUp}
        className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-[#a1a1a6]"
      >
        Explore available vans and book your door-to-door trip between Aurora
        and Metro Manila, both ways.
      </motion.p>
      <motion.div variants={fadeInUp}>
        <Button
          className="mt-6 h-11 rounded-full bg-[#0071e3] px-7 text-[15px] font-normal hover:bg-[#0077ed]"
          asChild
        >
          <Link to="/find-vans">Find vans</Link>
        </Button>
      </motion.div>
    </motion.section>
  )
}
