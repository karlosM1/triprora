import { Router } from 'express'
import {
  getVanById,
  getVanSeats,
  getVans,
} from '../controllers/vans.controller.js'
import { asyncHandler } from '../middleware/async-handler.middleware.js'
import { validateRequest } from '../middleware/validate-request.middleware.js'
import {
  listVansQuerySchema,
  vanIdParamSchema,
} from '../validators/vans.validator.js'

export const vansRouter = Router()

vansRouter.get(
  '/',
  validateRequest({ query: listVansQuerySchema }),
  asyncHandler(getVans),
)
vansRouter.get(
  '/:vanId/seats',
  validateRequest({ params: vanIdParamSchema }),
  asyncHandler(getVanSeats),
)
vansRouter.get(
  '/:vanId',
  validateRequest({ params: vanIdParamSchema }),
  asyncHandler(getVanById),
)
