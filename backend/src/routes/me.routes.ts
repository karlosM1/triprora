import { Router } from 'express'
import { getMe, updateMe } from '../controllers/me.controller.js'
import { asyncHandler } from '../middleware/async-handler.middleware.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { validateRequest } from '../middleware/validate-request.middleware.js'
import { updateProfileSchema } from '../validators/me.validator.js'

export const meRouter = Router()

meRouter.get('/', authenticate, asyncHandler(getMe))
meRouter.patch(
  '/',
  authenticate,
  validateRequest({ body: updateProfileSchema }),
  asyncHandler(updateMe),
)
