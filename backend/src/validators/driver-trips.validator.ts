import { z } from 'zod'

export const createDriverTripSchema = z.object({
  departureLocation: z.string().trim().min(2).max(200),
  arrivalLocation: z.string().trim().min(2).max(200),
  departureDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  departureTime: z.string().regex(/^\d{2}:\d{2}$/),
  tripCategory: z.enum(['express', 'business', 'standard']),
  vehicleName: z.string().trim().min(2).max(200),
  price: z.number().int().positive().max(1_000_000),
  totalSeats: z.number().int().min(1).max(18),
  status: z.enum(['draft', 'published']).default('published'),
})

export const driverTripIdParamSchema = z.object({
  tripId: z.string().trim().min(1),
})
