import { createFileRoute } from '@tanstack/react-router'
import { Header } from '@/components/landing/header'
import { Footer } from '@/components/landing/footer'
import { PageHeader, AppleCard, SectionTitle } from '@/components/layout/page-header'

export const Route = createFileRoute('/support')({
  component: SupportPage,
})

function SupportPage() {
  return (
    <div className="app-page min-h-svh bg-[#f5f5f7]">
      <Header activeLink="home" />
      <main className="mx-auto max-w-[980px] px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-20">
        <PageHeader
          eyebrow="Support"
          title="How can we help?"
          subtitle="Find quick answers about bookings, payments, and trips — or reach out to our team if you need a hand."
        />

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,2fr),minmax(0,1.4fr)]">
          <AppleCard className="p-6 sm:p-7">
            <SectionTitle
              title="Top questions"
              subtitle="Short answers to the most common questions from riders and drivers."
            />
            <div className="mt-4 space-y-6 text-[15px] leading-relaxed text-[#1d1d1f]">
              <div>
                <h3 className="text-[15px] font-semibold text-[#1d1d1f]">
                  How do I change or cancel a booking?
                </h3>
                <p className="mt-1 text-[14px] text-[#86868b]">
                  Go to <strong>My Bookings</strong>, open your trip, and use the available options to
                  change or cancel, subject to the trip&apos;s cancellation policy.
                </p>
              </div>

              <div>
                <h3 className="text-[15px] font-semibold text-[#1d1d1f]">
                  What should I do if my van is late?
                </h3>
                <p className="mt-1 text-[14px] text-[#86868b]">
                  Check your booking details for the driver&apos;s contact information. If you can&apos;t
                  reach them or the delay is significant, contact our support team so we can assist.
                </p>
              </div>

              <div>
                <h3 className="text-[15px] font-semibold text-[#1d1d1f]">
                  How are payments and refunds handled?
                </h3>
                <p className="mt-1 text-[14px] text-[#86868b]">
                  Payments are processed securely through our payment partners. If a refund is due
                  under the applicable policy, it will be issued back to your original payment method.
                </p>
              </div>
            </div>
          </AppleCard>

          <div className="space-y-6">
            <AppleCard className="p-6 sm:p-7">
              <h2 className="text-[17px] font-semibold tracking-[-0.01em] text-[#1d1d1f]">
                Contact support
              </h2>
              <p className="mt-2 text-[14px] leading-relaxed text-[#86868b]">
                Can&apos;t find what you&apos;re looking for? Reach out and we&apos;ll get back
                to you as soon as we can.
              </p>
              <ul className="mt-4 space-y-2 text-[14px] text-[#1d1d1f]">
                <li>
                  Email:{' '}
                  <a
                    href="mailto:hello@crabr.ph"
                    className="text-[#0066cc] hover:underline"
                  >
                    hello@crabr.ph
                  </a>
                </li>
              </ul>
              <p className="mt-3 text-[12px] text-[#86868b]">
                When you contact us, please include your booking reference (if you have one) and
                any relevant details so we can help faster.
              </p>
            </AppleCard>

            <AppleCard className="p-6 sm:p-7">
              <h2 className="text-[17px] font-semibold tracking-[-0.01em] text-[#1d1d1f]">
                Safety & policies
              </h2>
              <p className="mt-2 text-[14px] leading-relaxed text-[#86868b]">
                For details about how we handle your data, your rights, and our platform rules,
                please review our policies:
              </p>
              <ul className="mt-3 list-disc pl-5 text-[14px] text-[#1d1d1f]">
                <li>
                  <a
                    href="/privacy"
                    className="text-[#0066cc] hover:underline"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="/terms-of-service"
                    className="text-[#0066cc] hover:underline"
                  >
                    Terms of Service
                  </a>
                </li>
              </ul>
            </AppleCard>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

