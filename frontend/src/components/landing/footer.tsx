import { Globe, Share2 } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/auth-context'
import { fadeInUp, staggerContainer, viewportOnce } from '@/lib/motion'

const productLinks = [
  { label: 'Find Vans', to: '/find-vans' as const },
  { label: 'Send Package', to: '/send-package' as const },
  { label: 'My Bookings', to: '/my-bookings' as const },
  { label: 'My Deliveries', to: '/my-deliveries' as const },
  { label: 'Schedules', to: '/schedules' as const },
] as const

const legalLinks = [
  { label: 'Privacy Policy', to: '/privacy' as const },
  { label: 'Terms of Service', to: '/terms-of-service' as const },
] as const

export function Footer() {
  const { user, profileReady, isDriver } = useAuth()

  const resourceLinks = [
    { label: 'Articles', to: '/articles' as const },
    { label: 'Support', to: '/support' as const },
    ...(profileReady && isDriver
      ? [{ label: 'Driver Portal', to: '/driver' as const }]
      : [{ label: 'Become a Driver', to: user ? '/driver/register' : '/sign-up' }]),
  ] as const

  const footerLinks = {
    Product: productLinks,
    Resources: resourceLinks,
    Legal: legalLinks,
  }

  return (
    <footer className="border-t border-black/5 bg-[#f5f5f7]">
      <motion.div
        className="mx-auto max-w-[980px] px-6 py-16 lg:px-8"
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={staggerContainer}
      >
        <div className="grid grid-cols-2 gap-8 sm:gap-10 lg:grid-cols-5">
          <motion.div variants={fadeInUp} className="col-span-2 lg:col-span-2">
            <Link
              to="/"
              className="text-[17px] font-semibold tracking-tight text-[#1d1d1f]"
            >
              Crabr
            </Link>
            <p className="mt-3 max-w-xs text-[12px] leading-relaxed text-[#86868b]">
              Door-to-door van seats and package delivery between Aurora and
              Metro Manila. Safe, comfortable travel with no terminal
              transfers.
            </p>
          </motion.div>

          {Object.entries(footerLinks).map(([heading, links]) => (
            <motion.div key={heading} variants={fadeInUp}>
              <h3 className="text-[12px] font-semibold text-[#1d1d1f]">
                {heading}
              </h3>
              <ul className="mt-3 space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-[12px] text-[#424245] transition-colors hover:text-[#0066cc] hover:underline"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <motion.div
          variants={fadeInUp}
          className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-black/5 pt-6 sm:flex-row"
        >
          <p className="text-[12px] text-[#86868b]">
            Copyright &copy; {new Date().getFullYear()} Crabr Inc. All rights
            reserved.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="#"
              aria-label="Language"
              className="text-[#86868b] transition-colors hover:text-[#1d1d1f]"
            >
              <Globe className="size-4" />
            </a>
            <a
              href="#"
              aria-label="Share"
              className="text-[#86868b] transition-colors hover:text-[#1d1d1f]"
            >
              <Share2 className="size-4" />
            </a>
          </div>
        </motion.div>
      </motion.div>
    </footer>
  )
}
