import { z } from 'zod'

export const submitDriverApplicationSchema = z.object({
  fullName: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(7).max(20),
  licenseNo: z.string().trim().min(3).max(50),
  vehicleInfo: z.string().trim().max(500).optional(),
})

export const reviewDriverApplicationSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  adminNotes: z.string().trim().max(500).optional(),
})

export const applicationIdParamSchema = z.object({
  id: z.string().min(1),
})
