import { Router } from 'express'
import { getSchedules } from '../controllers/schedules.controller.js'
import { asyncHandler } from '../middleware/async-handler.middleware.js'

export const schedulesRouter = Router()

schedulesRouter.get('/', asyncHandler(getSchedules))
