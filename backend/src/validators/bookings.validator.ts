import { z } from 'zod'

export const createBookingSchema = z.object({
  vanId: z.string().trim().min(1),
  seat: z.string().trim().min(1).max(10),
  pickupAddress: z.string().trim().min(5).max(500),
  dropoffAddress: z.string().trim().min(5).max(500),
})

export type CreateBookingBody = z.infer<typeof createBookingSchema>
