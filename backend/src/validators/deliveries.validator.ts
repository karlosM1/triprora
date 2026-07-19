import { z } from 'zod'

export const packageTypeSchema = z.enum([
  'documents',
  'food',
  'clothes',
  'electronics',
  'others',
])

export const packageWeightBandSchema = z.enum([
  'up_to_1kg',
  'one_to_5kg',
  'five_to_10kg',
])

export const packageSizeSchema = z.enum(['small', 'medium', 'large'])

export const createDeliverySchema = z.object({
  vanId: z.string().trim().min(1),
  pickupAddress: z.string().trim().min(5).max(500),
  dropoffAddress: z.string().trim().min(5).max(500),
  packageType: packageTypeSchema,
  weightBand: packageWeightBandSchema,
  size: packageSizeSchema,
  description: z.string().trim().min(2).max(200),
  receiverName: z.string().trim().min(2).max(100),
  receiverPhone: z.string().trim().min(7).max(30),
  specialInstructions: z.string().trim().max(500).optional(),
})

export const payDeliverySchema = z.object({
  paymentMethod: z.literal('cash').default('cash'),
})

export const acceptDeliverySchema = z.object({
  deliveryFee: z.coerce.number().int().min(1).max(100_000),
})

export const listDeliveriesQuerySchema = z.object({
  filter: z.enum(['upcoming', 'history', 'all']).default('all'),
})

export const deliveryIdParamSchema = z.object({
  deliveryId: z.string().trim().min(1),
})

export type CreateDeliveryBody = z.infer<typeof createDeliverySchema>
