import { Router } from 'express'
import { getMe } from '../controllers/me.controller.js'
import { asyncHandler } from '../middleware/async-handler.middleware.js'
import { authenticate } from '../middleware/auth.middleware.js'

export const meRouter = Router()

meRouter.get('/', authenticate, asyncHandler(getMe))
