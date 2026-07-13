import { Router } from 'express'
import {
  cancelDelivery,
  createDelivery,
  getDelivery,
  listDeliveries,
  payDelivery,
} from '../controllers/deliveries.controller.js'
import { asyncHandler } from '../middleware/async-handler.middleware.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { validateRequest } from '../middleware/validate-request.middleware.js'
import {
  createDeliverySchema,
  deliveryIdParamSchema,
  listDeliveriesQuerySchema,
  payDeliverySchema,
} from '../validators/deliveries.validator.js'

export const deliveriesRouter = Router()

deliveriesRouter.use(authenticate)

deliveriesRouter.post(
  '/',
  validateRequest({ body: createDeliverySchema }),
  asyncHandler(createDelivery),
)
deliveriesRouter.get(
  '/',
  validateRequest({ query: listDeliveriesQuerySchema }),
  asyncHandler(listDeliveries),
)
deliveriesRouter.get(
  '/:deliveryId',
  validateRequest({ params: deliveryIdParamSchema }),
  asyncHandler(getDelivery),
)
deliveriesRouter.post(
  '/:deliveryId/pay',
  validateRequest({
    params: deliveryIdParamSchema,
    body: payDeliverySchema,
  }),
  asyncHandler(payDelivery),
)
deliveriesRouter.post(
  '/:deliveryId/cancel',
  validateRequest({ params: deliveryIdParamSchema }),
  asyncHandler(cancelDelivery),
)
