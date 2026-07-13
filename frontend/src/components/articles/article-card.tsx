import { Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { scaleIn } from '@/lib/motion'
import type { Article } from '@/lib/articles'

type ArticleCardProps = {
  article: Article
  layout?: 'horizontal' | 'vertical'
}

export function ArticleCard({ article, layout = 'horizontal' }: ArticleCardProps) {
  const isHorizontal = layout === 'horizontal'

  return (
    <motion.article
      variants={scaleIn}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="group h-full overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 transition-shadow hover:shadow-md"
    >
      <Link
        to="/articles/$slug"
        params={{ slug: article.slug }}
        className={isHorizontal ? 'relative block h-full' : 'flex h-full flex-col'}
      >
        <div
          className={
            isHorizontal
              ? 'relative aspect-4/3 overflow-hidden sm:absolute sm:inset-y-0 sm:left-0 sm:z-0 sm:w-[42%] sm:aspect-auto'
              : 'relative aspect-16/10 overflow-hidden'
          }
        >
          <img
            src={article.image}
            alt={article.title}
            loading="lazy"
            decoding="async"
            className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        </div>

        <div
          className={
            isHorizontal
              ? 'relative flex flex-col p-6 sm:ml-[42%]'
              : 'flex flex-1 flex-col p-6'
          }
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-[#0066cc]">{article.tag}</span>
            <time className="text-xs text-[#86868b]">{article.date}</time>
          </div>

          <h3 className="mt-3 text-[19px] leading-snug font-semibold tracking-[-0.01em] text-[#1d1d1f] transition-colors group-hover:text-[#0066cc]">
            {article.title}
          </h3>

          <p className="mt-2 flex-1 text-[15px] leading-relaxed text-[#86868b]">
            {article.description}
          </p>

          <div className="mt-5 border-t border-black/5 pt-4">
            <p className="text-xs text-[#86868b]">{article.author}</p>
            <span className="mt-2 inline-block text-[15px] text-[#0066cc] group-hover:underline">
              Read article ›
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  )
}
