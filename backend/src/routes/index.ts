import { Router } from 'express'
import { getHealth } from '../controllers/health.controller.js'
import { asyncHandler } from '../middleware/async-handler.middleware.js'
import { bookingsRouter } from './bookings.routes.js'
import { schedulesRouter } from './schedules.routes.js'
import { vansRouter } from './vans.routes.js'

export const apiRouter = Router()

apiRouter.get('/health', asyncHandler(getHealth))
apiRouter.use('/bookings', bookingsRouter)
apiRouter.use('/schedules', schedulesRouter)
apiRouter.use('/vans', vansRouter)
