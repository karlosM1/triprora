import { z } from 'zod'

export const vanIdParamSchema = z.object({
  vanId: z
    .string()
    .trim()
    .min(1, 'Van ID is required')
    .regex(/^\d+$/, 'Van ID must be numeric'),
})

export type VanIdParams = z.infer<typeof vanIdParamSchema>
