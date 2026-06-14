import type { Transition, Variants } from 'framer-motion'

export const appleEase: Transition['ease'] = [0.25, 0.1, 0.25, 1]

export const appleTransition: Transition = {
  duration: 0.8,
  ease: appleEase,
}

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 48 },
  visible: {
    opacity: 1,
    y: 0,
    transition: appleTransition,
  },
}

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.6, ease: appleEase },
  },
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: appleTransition,
  },
}

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.08,
    },
  },
}

export const viewportOnce = {
  once: true,
  margin: '-80px' as const,
}
