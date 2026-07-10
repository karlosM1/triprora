import { z } from 'zod'

export const walletHistoryQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional(),
  cursor: z.string().trim().min(1).optional(),
})

export const requestPayoutSchema = z.object({
  amountPesos: z.number().int().positive(),
})

export const finalizeSettlementSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be YYYY-MM-DD'),
  driverId: z.string().uuid().optional(),
})

export const settlementsQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be YYYY-MM-DD'),
})

export const driverIdParamSchema = z.object({
  driverId: z.string().uuid(),
})

export const payoutIdParamSchema = z.object({
  id: z.string().trim().min(1),
})

export const adminUpdatePayoutSchema = z.object({
  status: z.enum(['approved', 'paid', 'rejected']),
  adminNotes: z.string().trim().max(2000).optional(),
})

export const adminPayoutsQuerySchema = z.object({
  status: z.enum(['requested', 'approved', 'paid', 'rejected']).optional(),
})
