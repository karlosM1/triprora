import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
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
    variant: 'outline' as const,
  },
  {
    tag: 'Surf Guide',
    date: '28 May 2024',
    title: 'Surfing in Baler: The Ultimate Beginner\'s Guide',
    description:
      'Sabang Beach is the birthplace of Philippine surfing. Learn when to visit, where to rent boards, and how to catch your first wave.',
    author: 'Juan Dela Cruz',
    image: surfingSabang,
    variant: 'solid' as const,
  },
  {
    tag: 'Nature',
    date: '15 May 2024',
    title: 'A Nature Lover\'s Guide to Aurora\'s Lush Mountains',
    description:
      'Trek through the Sierra Madre range, visit the Millennium Tree in Maria Aurora, and explore the province\'s rich biodiversity.',
    author: 'Ana Reyes',
    image: hillBeachView,
    variant: 'outline' as const,
  },
  {
    tag: 'Budget Tips',
    date: '3 May 2024',
    title: 'Budget-Friendly Travel Tips for Your Aurora Adventure',
    description:
      'Stretch your peso with local homestays, carinderia eats, and off-season travel hacks for an affordable Aurora getaway.',
    author: 'Carlo Mendoza',
    image: beachView,
    variant: 'solid' as const,
  },
]

export function TravelTipsSection() {
  return (
    <section className="px-6 py-20 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl rounded-3xl bg-[#F4F6FA] px-6 py-12 lg:px-12 lg:py-16">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between lg:gap-0">
          <h2 className="shrink-0 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:pr-10">
            Travel Tips, Insights
            <br />
            &amp; Inspiration
          </h2>

          <div className="hidden h-16 w-px shrink-0 bg-border sm:block" aria-hidden />

          <p className="max-w-md text-sm leading-relaxed text-muted-foreground sm:flex-1 lg:px-10">
            Explore Aurora Province through local stories, travel guides, and
            insider tips — from surfing in Baler to hidden waterfalls and
            mountain trails across the Sierra Madre.
          </p>

          <div className="hidden h-16 w-px shrink-0 bg-border sm:block" aria-hidden />

          <div className="shrink-0 sm:pl-6 lg:pl-10">
            <Button className="rounded-full px-8" size="lg" asChild>
              <Link to="/find-vans">Read All Articles</Link>
            </Button>
          </div>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {articles.map((article) => (
            <article
              key={article.title}
              className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 sm:flex-row"
            >
              <div className="aspect-[4/3] shrink-0 sm:aspect-auto sm:w-[42%]">
                <img
                  src={article.image}
                  alt={article.title}
                  className="size-full object-cover"
                />
              </div>

              <div className="flex flex-1 flex-col p-5 sm:p-6">
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    {article.tag}
                  </span>
                  <time className="text-xs text-muted-foreground">
                    {article.date}
                  </time>
                </div>

                <h3 className="mt-3 text-base font-bold leading-snug text-foreground">
                  {article.title}
                </h3>

                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {article.description}
                </p>

                <div className="mt-4 border-t border-border pt-4">
                  <p className="text-xs text-muted-foreground">
                    Author:{' '}
                    <span className="font-medium text-foreground">
                      {article.author}
                    </span>
                  </p>

                  <Button
                    variant={article.variant === 'solid' ? 'default' : 'outline'}
                    size="sm"
                    className="mt-3 rounded-full px-5"
                    asChild
                  >
                    <Link to="/find-vans">Learn More</Link>
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
