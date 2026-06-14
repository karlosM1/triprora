import { z } from 'zod'

export const createBookingSchema = z.object({
  vanId: z.string().trim().min(1),
  seat: z.string().trim().min(1).max(10),
})

export type CreateBookingBody = z.infer<typeof createBookingSchema>
