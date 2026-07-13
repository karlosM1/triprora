import { z } from 'zod'

export const vanIdParamSchema = z.object({
  vanId: z.string().trim().min(1, 'Van ID is required'),
})

export type VanIdParams = z.infer<typeof vanIdParamSchema>

const departureTimeSlotSchema = z.enum(['morning', 'afternoon', 'evening'])

function parseDepartureTimes(value: unknown): string[] {
  if (value == null || value === '') return []
  const parts = Array.isArray(value)
    ? value.flatMap((entry) => String(entry).split(','))
    : String(value).split(',')
  return parts.map((part) => part.trim()).filter(Boolean)
}

export const listVansQuerySchema = z.object({
  from: z.string().trim().optional(),
  to: z.string().trim().optional(),
  departureDate: z.string().trim().optional(),
  passengers: z.coerce.number().int().min(1).max(14).optional(),
  priceMax: z.coerce.number().int().min(0).optional(),
  departureTimes: z.preprocess(
    parseDepartureTimes,
    z.array(departureTimeSlotSchema).default([]),
  ),
  sort: z.enum(['price', 'departure']).optional().default('price'),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(50).optional().default(6),
})

export type ListVansQuery = z.infer<typeof listVansQuerySchema>
