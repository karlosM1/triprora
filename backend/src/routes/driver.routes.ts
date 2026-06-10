import { Router } from 'express'
import {
  getMyDriverApplication,
  submitDriverApplication,
} from '../controllers/driver-applications.controller.js'
import { asyncHandler } from '../middleware/async-handler.middleware.js'
import { authenticate, requireRole } from '../middleware/auth.middleware.js'
import { validateRequest } from '../middleware/validate-request.middleware.js'
import { submitDriverApplicationSchema } from '../validators/driver-applications.validator.js'

export const driverRouter = Router()

driverRouter.post(
  '/applications',
  authenticate,
  requireRole('passenger'),
  validateRequest({ body: submitDriverApplicationSchema }),
  asyncHandler(submitDriverApplication),
)

driverRouter.get(
  '/applications/me',
  authenticate,
  asyncHandler(getMyDriverApplication),
)
