import { Router } from 'express'
import {
  createDestinationAddress,
  deleteDestinationAddress,
  listDestinationAddresses,
  updateDestinationAddress,
} from '../controllers/destination-addresses.controller.js'
import { getMe, updateMe } from '../controllers/me.controller.js'
import {
  listMyNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../controllers/notifications.controller.js'
import { asyncHandler } from '../middleware/async-handler.middleware.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { validateRequest } from '../middleware/validate-request.middleware.js'
import {
  destinationAddressIdParamsSchema,
  upsertDestinationAddressSchema,
} from '../validators/destination-addresses.validator.js'
import { updateProfileSchema } from '../validators/me.validator.js'
import { notificationIdParamSchema } from '../validators/notifications.validator.js'

export const meRouter = Router()

meRouter.get('/', authenticate, asyncHandler(getMe))
meRouter.patch(
  '/',
  authenticate,
  validateRequest({ body: updateProfileSchema }),
  asyncHandler(updateMe),
)

meRouter.get('/notifications', authenticate, asyncHandler(listMyNotifications))
meRouter.post(
  '/notifications/read-all',
  authenticate,
  asyncHandler(markAllNotificationsRead),
)
meRouter.post(
  '/notifications/:notificationId/read',
  authenticate,
  validateRequest({ params: notificationIdParamSchema }),
  asyncHandler(markNotificationRead),
)

meRouter.get(
  '/destinations',
  authenticate,
  asyncHandler(listDestinationAddresses),
)
meRouter.post(
  '/destinations',
  authenticate,
  validateRequest({ body: upsertDestinationAddressSchema }),
  asyncHandler(createDestinationAddress),
)
meRouter.patch(
  '/destinations/:id',
  authenticate,
  validateRequest({
    params: destinationAddressIdParamsSchema,
    body: upsertDestinationAddressSchema,
  }),
  asyncHandler(updateDestinationAddress),
)
meRouter.delete(
  '/destinations/:id',
  authenticate,
  validateRequest({ params: destinationAddressIdParamsSchema }),
  asyncHandler(deleteDestinationAddress),
)
