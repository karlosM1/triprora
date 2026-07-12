import { z } from 'zod'

export const destinationAddressIdParamsSchema = z.object({
  id: z.string().trim().min(1),
})

export const upsertDestinationAddressSchema = z.object({
  label: z.string().trim().min(1, 'Label is required').max(80),
  houseStreet: z.string().trim().min(1, 'House/street is required').max(200),
  barangay: z
    .string()
    .trim()
    .max(100)
    .transform((value) => value || null),
  city: z.string().trim().min(1, 'City is required').max(100),
  province: z.string().trim().min(1, 'Province is required').max(100),
  zipCode: z
    .string()
    .trim()
    .max(12)
    .transform((value) => value || null),
})

export type UpsertDestinationAddressBody = z.infer<
  typeof upsertDestinationAddressSchema
>
