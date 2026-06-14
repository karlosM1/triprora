import { z } from 'zod'

export const vanIdParamSchema = z.object({
  vanId: z.string().trim().min(1, 'Van ID is required'),
})

export type VanIdParams = z.infer<typeof vanIdParamSchema>
