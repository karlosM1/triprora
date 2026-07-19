import { z } from 'zod'

export const createBookingSchema = z.object({
  vanId: z.string().trim().min(1),
  seat: z.string().trim().min(1).max(10),
  pickupAddress: z.string().trim().min(5).max(500),
  dropoffAddress: z.string().trim().min(5).max(500),
  paymentMethod: z.literal('cash').default('cash'),
})
export const updateBookingSchema = z
  .object({
    seat: z.string().trim().min(1).max(10).optional(),
    pickupAddress: z.string().trim().min(5).max(500).optional(),
    dropoffAddress: z.string().trim().min(5).max(500).optional(),
  })
  .refine(
    (data) => data.seat || data.pickupAddress || data.dropoffAddress,
    { message: 'At least one field must be provided' },
  )

export type UpdateBookingBody = z.infer<typeof updateBookingSchema>
