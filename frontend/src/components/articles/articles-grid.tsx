import { motion, type HTMLMotionProps } from 'framer-motion'
import { ArticleCard } from '@/components/articles/article-card'
import type { Article } from '@/lib/articles'
import { staggerContainer } from '@/lib/motion'
import { cn } from '@/lib/utils'

type ArticlesGridProps = {
  articles: Article[]
  className?: string
} & Pick<HTMLMotionProps<'div'>, 'animate' | 'whileInView' | 'viewport'>

export function ArticlesGrid({
  articles,
  className,
  initial = 'hidden',
  ...motionProps
}: ArticlesGridProps & { initial?: HTMLMotionProps<'div'>['initial'] }) {
  return (
    <motion.div
      className={cn('grid gap-5 lg:grid-cols-2', className)}
      initial={initial}
      variants={staggerContainer}
      {...motionProps}
    >
      {articles.map((article) => (
        <ArticleCard key={article.slug} article={article} />
      ))}
    </motion.div>
  )
}
