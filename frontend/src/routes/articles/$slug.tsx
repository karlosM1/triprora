import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { Footer } from '@/components/landing/footer'
import { Header } from '@/components/landing/header'
import { Button } from '@/components/ui/button'
import { getArticleBySlug } from '@/lib/articles'

export const Route = createFileRoute('/articles/$slug')({
  loader: ({ params }) => {
    const article = getArticleBySlug(params.slug)
    if (!article) {
      throw notFound()
    }
    return article
  },
  notFoundComponent: ArticleNotFound,
  component: ArticleDetailPage,
})

function ArticleNotFound() {
  return (
    <div className="app-page min-h-svh bg-[#f5f5f7]">
      <Header />
      <main className="mx-auto flex max-w-[980px] flex-col items-center px-4 py-20 text-center sm:px-6 lg:px-8">
        <h1 className="text-[28px] font-semibold tracking-[-0.02em] text-[#1d1d1f] sm:text-[32px]">
          Article not found
        </h1>
        <p className="mt-3 max-w-md text-[17px] leading-relaxed text-[#86868b]">
          This story may have been moved or is no longer available.
        </p>
        <Button className="mt-8 rounded-full bg-[#0071e3] hover:bg-[#0077ed]" asChild>
          <Link to="/articles">Back to articles</Link>
        </Button>
      </main>
      <Footer />
    </div>
  )
}

function ArticleDetailPage() {
  const article = Route.useLoaderData()

  return (
    <div className="app-page min-h-svh bg-white">
      <Header activeLink="articles" />
      <article>
        <div className="relative mx-auto max-w-[980px] px-4 pt-8 sm:px-6 lg:px-8 lg:pt-12">
          <Link
            to="/articles"
            className="inline-flex items-center gap-1.5 text-[15px] text-[#0066cc] transition-colors hover:underline"
          >
            <ArrowLeft className="size-4" />
            All articles
          </Link>
        </div>

        <header className="mx-auto max-w-[720px] px-4 pt-8 pb-6 sm:px-6 lg:px-8 lg:pt-10">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-medium text-[#0066cc]">{article.tag}</span>
            <time className="text-xs text-[#86868b]">{article.date}</time>
          </div>
          <h1 className="mt-4 text-[32px] leading-[1.1] font-semibold tracking-[-0.02em] text-[#1d1d1f] sm:text-[40px]">
            {article.title}
          </h1>
          <p className="mt-4 text-[17px] leading-relaxed text-[#86868b]">
            {article.description}
          </p>
          <p className="mt-6 text-[13px] text-[#86868b]">By {article.author}</p>
        </header>

        <div className="mx-auto max-w-[980px] px-4 sm:px-6 lg:px-8">
          <div className="aspect-16/9 overflow-hidden rounded-2xl ring-1 ring-black/5">
            <img
              src={article.image}
              alt={article.title}
              decoding="async"
              className="size-full object-cover"
            />
          </div>
        </div>

        <div className="mx-auto max-w-[720px] px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
          <div className="space-y-5">
            {article.content.map((paragraph) => (
              <p
                key={paragraph.slice(0, 40)}
                className="text-[17px] leading-[1.65] text-[#1d1d1f]"
              >
                {paragraph}
              </p>
            ))}
          </div>

          <div className="mt-12 rounded-2xl bg-[#f5f5f7] p-6 ring-1 ring-black/5 sm:p-8">
            <h2 className="text-[19px] font-semibold tracking-[-0.01em] text-[#1d1d1f]">
              Ready to explore Aurora?
            </h2>
            <p className="mt-2 text-[15px] leading-relaxed text-[#86868b]">
              Book a door-to-door van between Aurora and Metro Manila and start
              your adventure.
            </p>
            <Button
              className="mt-5 h-11 rounded-full bg-[#0071e3] px-6 text-[15px] font-normal hover:bg-[#0077ed]"
              asChild
            >
              <Link to="/find-vans">Find vans</Link>
            </Button>
          </div>
        </div>
      </article>
      <Footer />
    </div>
  )
}
