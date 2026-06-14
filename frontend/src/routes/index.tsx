import { createFileRoute } from '@tanstack/react-router'
import { FeaturesSection } from '@/components/landing/features-section'
import { Footer } from '@/components/landing/footer'
import { Header } from '@/components/landing/header'
import { HeroSection } from '@/components/landing/hero-section'
import { TravelTipsSection } from '@/components/landing/travel-tips-section'
import { TrustSection } from '@/components/landing/trust-section'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <div className="min-h-svh bg-white">
      <Header variant="hero" />
      <HeroSection />
      <TrustSection />
      <FeaturesSection />
      <TravelTipsSection />
      <Footer />
    </div>
  )
}
