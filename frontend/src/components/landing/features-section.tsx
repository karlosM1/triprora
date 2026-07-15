import { ArrowUpRight } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
  fadeInUp,
  scaleIn,
  staggerContainer,
  viewportOnce,
} from '@/lib/motion'
import beachView from '@/assets/beach-view.jpg'
import ditumaboFalls from '@/assets/ditumabo-falls.jpg'
import hillBeachView from '@/assets/hill-beach-view.jpg'
import surfingSabang from '@/assets/surfing-sabang.jfif'

const galleryImages = [
  {
    src: surfingSabang,
    alt: 'Surfing at Sabang Beach, Baler',
    className: 'row-span-2',
  },
  {
    src: ditumaboFalls,
    alt: 'Ditumabo Falls in Aurora Province',
    className: 'row-span-2',
  },
  {
    src: hillBeachView,
    alt: 'Coastal hills in Aurora Province',
    className: '',
  },
  {
    src: beachView,
    alt: 'Beach view in Aurora Province',
    className: '',
  },
]

export function FeaturesSection() {
  return (
    <section className="mx-auto max-w-[980px] px-6 py-20 lg:px-8 lg:py-28">
      <motion.div
        className="text-center"
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={staggerContainer}
      >
        <motion.p
          variants={fadeInUp}
          className="text-sm font-medium tracking-wide text-[#bf4800] uppercase"
        >
          Why Crabr
        </motion.p>
        <motion.h2
          variants={fadeInUp}
          className="mt-3 text-[40px] leading-[1.08] font-semibold tracking-[-0.02em] text-[#1d1d1f] sm:text-[48px] lg:text-[56px]"
        >
          Your journey.
          <br />
          Our priority.
        </motion.h2>
        <motion.p
          variants={fadeInUp}
          className="mx-auto mt-5 max-w-2xl text-[17px] leading-relaxed text-[#86868b] sm:text-[19px]"
        >
          Booking a van ride should be as effortless as planning your dream trip.
          We connect travelers with trusted local drivers for safe, comfortable
          door-to-door travel between Aurora and Metro Manila, both ways.
        </motion.p>
        <motion.div variants={fadeInUp} className="mt-8">
          <Button
            className="h-11 rounded-full bg-[#0071e3] px-7 text-[17px] font-normal hover:bg-[#0077ed]"
            size="lg"
            asChild
          >
            <Link to="/find-vans">
              Explore routes
              <ArrowUpRight className="ml-1 size-4" />
            </Link>
          </Button>
        </motion.div>
      </motion.div>

      <motion.div
        className="mt-16 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-[1.2fr_0.55fr_1fr] lg:grid-rows-2 lg:gap-5 lg:h-[520px]"
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={staggerContainer}
      >
        {galleryImages.map((image, index) => (
          <motion.div
            key={image.alt}
            variants={scaleIn}
            className={`group relative overflow-hidden rounded-2xl bg-[#f5f5f7] ${image.className}`}
          >
            <motion.img
              src={image.src}
              alt={image.alt}
              loading="lazy"
              decoding="async"
              className="size-full min-h-[160px] object-cover lg:min-h-0 lg:h-full"
              whileHover={{ scale: 1.04 }}
              transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            />
            {index === 0 && (
              <Link
                to="/find-vans"
                className="absolute right-4 bottom-4 flex size-10 items-center justify-center rounded-full bg-[#0071e3] text-white shadow-lg transition-transform hover:scale-110"
                aria-label="Explore van routes"
              >
                <ArrowUpRight className="size-5" />
              </Link>
            )}
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
