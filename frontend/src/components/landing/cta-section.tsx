import { Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { fadeInUp, staggerContainer, viewportOnce } from '@/lib/motion'

export function CtaSection() {
  return (
    <section className="mx-auto max-w-[980px] px-6 py-20 lg:px-8 lg:py-28">
      <motion.div
        className="overflow-hidden rounded-3xl bg-[#1d1d1f] px-8 py-16 text-center sm:px-12 sm:py-20"
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={staggerContainer}
      >
        <motion.h2
          variants={fadeInUp}
          className="text-[32px] leading-tight font-semibold tracking-[-0.02em] text-white sm:text-[40px]"
        >
          Ready for your trip?
        </motion.h2>
        <motion.p
          variants={fadeInUp}
          className="mx-auto mt-4 max-w-lg text-[17px] leading-relaxed text-[#a1a1a6]"
        >
          Book a door-to-door van between Aurora and Metro Manila today. Pick
          your van, choose your seat, and travel comfortably — either direction.
        </motion.p>
        <motion.div
          variants={fadeInUp}
          className="mt-8 flex flex-wrap justify-center gap-4"
        >
          <Button
            size="lg"
            className="h-11 rounded-full bg-[#0071e3] px-7 text-[17px] font-normal hover:bg-[#0077ed]"
            asChild
          >
            <Link to="/find-vans">Find a van</Link>
          </Button>
          <Button
            size="lg"
            variant="ghost"
            className="h-11 rounded-full px-7 text-[17px] font-normal text-[#2997ff] hover:bg-white/10 hover:text-[#2997ff]"
            asChild
          >
            <Link to="/sign-up">Create account ›</Link>
          </Button>
        </motion.div>
      </motion.div>
    </section>
  )
}
