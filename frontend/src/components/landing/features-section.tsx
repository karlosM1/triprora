import { ArrowUpRight } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
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
    <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-24">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between lg:gap-0">
        <h2 className="shrink-0 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:pr-10">
          Your Journey,
          <br />
          Our Priority
        </h2>

        <div className="hidden h-16 w-px shrink-0 bg-border sm:block" aria-hidden />

        <p className="max-w-md text-sm leading-relaxed text-muted-foreground sm:flex-1 lg:px-10">
          At Triprora, we believe booking a van ride should be as easy as
          planning your dream trip. Our platform connects travelers from
          Casiguran, Aurora with trusted local drivers for safe, comfortable
          door-to-door travel to Metro Manila — helping you save time and
          money.
        </p>

        <div className="hidden h-16 w-px shrink-0 bg-border sm:block" aria-hidden />

        <div className="shrink-0 sm:pl-6 lg:pl-10">
          <Button className="rounded-full px-8" size="lg" asChild>
            <Link to="/find-vans">Explore More</Link>
          </Button>
        </div>
      </div>

      <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-[1.2fr_0.55fr_1fr] lg:grid-rows-2 lg:gap-5 lg:h-[480px]">
        {galleryImages.map((image, index) => (
          <div
            key={image.alt}
            className={`group relative overflow-hidden rounded-2xl ${image.className}`}
          >
            <img
              src={image.src}
              alt={image.alt}
              className="size-full min-h-[160px] object-cover transition-transform duration-500 group-hover:scale-105 lg:min-h-0 lg:h-full"
            />
            {index === 0 && (
              <Link
                to="/find-vans"
                className="absolute right-4 bottom-4 flex size-10 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-transform hover:scale-110"
                aria-label="Explore van routes"
              >
                <ArrowUpRight className="size-5" />
              </Link>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
