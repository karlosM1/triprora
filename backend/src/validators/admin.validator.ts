import { z } from 'zod'

export const adminListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(200).optional().default(100),
})

export type AdminListQuery = z.infer<typeof adminListQuerySchema>
