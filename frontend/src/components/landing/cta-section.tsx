import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

export function CtaSection() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-24">
      <div className="flex flex-col items-start justify-between gap-8 rounded-2xl bg-primary px-8 py-12 sm:flex-row sm:items-center lg:px-12 lg:py-14">
        <div className="max-w-lg">
          <h2 className="text-2xl font-bold tracking-tight text-primary-foreground sm:text-3xl">
            Ready for your trip to Metro Manila?
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-primary-foreground/80">
            Book a door-to-door van from Casiguran, Aurora today. Pick your van,
            enter your destination address, choose your seat, and travel
            comfortably to Metro Manila.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-3">
          <Button
            variant="secondary"
            size="lg"
            className="rounded-lg bg-white text-primary hover:bg-white/90"
            asChild
          >
            <Link to="/find-vans">Find a Van</Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="rounded-lg border-white/40 bg-transparent text-primary-foreground hover:bg-white/10 hover:text-primary-foreground"
            asChild
          >
            <Link to="/sign-up">Create Account</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
