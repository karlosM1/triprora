import { z } from 'zod'

const driverTripBodySchema = z.object({
  departureLocation: z.string().trim().min(2).max(200),
  arrivalLocation: z.string().trim().min(2).max(200),
  departureDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  departureTime: z.string().regex(/^\d{2}:\d{2}$/),
  durationHours: z.coerce.number().min(1).max(24),
  tripCategory: z.enum(['express', 'business', 'standard']),
  vehicleName: z.string().trim().min(2).max(200),
  plateNumber: z
    .string()
    .trim()
    .min(2)
    .max(20)
    .optional()
    .or(z.literal('').transform(() => undefined)),
  price: z.coerce.number().int().positive().max(1_000_000),
  totalSeats: z.coerce.number().int().min(1).max(14),
  status: z.enum(['draft', 'published']).default('published'),
})

export const createDriverTripSchema = driverTripBodySchema

export const updateDriverTripSchema = driverTripBodySchema

export const driverTripIdParamSchema = z.object({
  tripId: z.string().trim().min(1),
})
