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

const articles = [
  {
    tag: 'Hidden Gems',
    date: '12 June 2024',
    title: 'Top 10 Must-Visit Hidden Gems in Aurora Province',
    description:
      'From the misty trails of Ditumabo Falls to the secluded coves of Baler, discover Aurora\'s best-kept secrets away from the crowds.',
    author: 'Maria Santos',
    image: ditumaboFalls,
  },
  {
    tag: 'Surf Guide',
    date: '28 May 2024',
    title: 'Surfing in Baler: The Ultimate Beginner\'s Guide',
    description:
      'Sabang Beach is the birthplace of Philippine surfing. Learn when to visit, where to rent boards, and how to catch your first wave.',
    author: 'Juan Dela Cruz',
    image: surfingSabang,
  },
  {
    tag: 'Nature',
    date: '15 May 2024',
    title: 'A Nature Lover\'s Guide to Aurora\'s Lush Mountains',
    description:
      'Trek through the Sierra Madre range, visit the Millennium Tree in Maria Aurora, and explore the province\'s rich biodiversity.',
    author: 'Ana Reyes',
    image: hillBeachView,
  },
  {
    tag: 'Budget Tips',
    date: '3 May 2024',
    title: 'Budget-Friendly Travel Tips for Your Aurora Adventure',
    description:
      'Stretch your peso with local homestays, carinderia eats, and off-season travel hacks for an affordable Aurora getaway.',
    author: 'Carlo Mendoza',
    image: beachView,
  },
]

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
              <Link to="/find-vans">Read all articles ›</Link>
            </Button>
          </motion.div>
        </motion.div>

        <motion.div
          className="mt-14 grid gap-5 lg:grid-cols-2"
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={staggerContainer}
        >
          {articles.map((article) => (
            <motion.article
              key={article.title}
              variants={scaleIn}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 sm:flex-row"
            >
              <div className="aspect-4/3 shrink-0 sm:aspect-auto sm:w-[42%]">
                <img
                  src={article.image}
                  alt={article.title}
                  className="size-full object-cover"
                />
              </div>

              <div className="flex flex-1 flex-col p-6">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-[#0066cc]">
                    {article.tag}
                  </span>
                  <time className="text-xs text-[#86868b]">{article.date}</time>
                </div>

                <h3 className="mt-3 text-[19px] leading-snug font-semibold tracking-[-0.01em] text-[#1d1d1f]">
                  {article.title}
                </h3>

                <p className="mt-2 flex-1 text-[15px] leading-relaxed text-[#86868b]">
                  {article.description}
                </p>

                <div className="mt-5 border-t border-black/5 pt-4">
                  <p className="text-xs text-[#86868b]">
                    {article.author}
                  </p>
                  <Link
                    to="/find-vans"
                    className="mt-2 inline-block text-[15px] text-[#0066cc] hover:underline"
                  >
                    Learn more ›
                  </Link>
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
