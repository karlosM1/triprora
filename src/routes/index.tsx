import { createFileRoute } from '@tanstack/react-router'
import { CtaSection } from '@/components/landing/cta-section'
import { FeaturesSection } from '@/components/landing/features-section'
import { Footer } from '@/components/landing/footer'
import { Header } from '@/components/landing/header'
import { HeroSection } from '@/components/landing/hero-section'
import { RoutesSection } from '@/components/landing/routes-section'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <div className="min-h-svh bg-white">
      <Header />
      <HeroSection />
      <FeaturesSection />
      <RoutesSection />
      <CtaSection />
      <Footer />
    </div>
  )
}
