import { Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ArticlesGrid } from '@/components/articles/articles-grid'
import { getFeaturedArticles } from '@/lib/articles'
import {
  fadeInUp,
  staggerContainer,
  viewportOnce,
} from '@/lib/motion'

const featuredArticles = getFeaturedArticles()

export function TravelTipsSection() {
  return (
    <section className="bg-[#f5f5f7] px-6 py-20 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-[980px]">
        <motion.div
          className="text-center"
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={staggerContainer}
        >
          <motion.p
            variants={fadeInUp}
            className="text-sm font-medium tracking-wide text-[#0066cc] uppercase"
          >
            Travel Journal
          </motion.p>
          <motion.h2
            variants={fadeInUp}
            className="mt-3 text-[40px] leading-[1.08] font-semibold tracking-[-0.02em] text-[#1d1d1f] sm:text-[48px]"
          >
            Tips, insights &amp; inspiration.
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="mx-auto mt-5 max-w-2xl text-[17px] leading-relaxed text-[#86868b]"
          >
            Explore Aurora Province through local stories, travel guides, and
            insider tips — from surfing in Baler to hidden waterfalls across
            the Sierra Madre.
          </motion.p>
          <motion.div variants={fadeInUp} className="mt-8">
            <Button
              className="h-11 rounded-full bg-[#0071e3] px-7 text-[17px] font-normal hover:bg-[#0077ed]"
              size="lg"
              asChild
            >
              <Link to="/articles">Read all articles ›</Link>
            </Button>
          </motion.div>
        </motion.div>

        <ArticlesGrid
          articles={featuredArticles}
          className="mt-14"
          whileInView="visible"
          viewport={viewportOnce}
        />
      </div>
    </section>
  )
}
