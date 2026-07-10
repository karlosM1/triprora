import { Router } from 'express'
import { getHealth } from '../controllers/health.controller.js'
import { asyncHandler } from '../middleware/async-handler.middleware.js'
import { adminRouter } from './admin.routes.js'
import { bookingsRouter } from './bookings.routes.js'
import { driverRouter } from './driver.routes.js'
import { meRouter } from './me.routes.js'
import { schedulesRouter } from './schedules.routes.js'
import { vansRouter } from './vans.routes.js'
import { paymentsRouter } from './payments.routes.js'

export const apiRouter = Router()

apiRouter.get('/health', asyncHandler(getHealth))
apiRouter.use('/me', meRouter)
apiRouter.use('/driver', driverRouter)
apiRouter.use('/admin', adminRouter)
apiRouter.use('/bookings', bookingsRouter)
apiRouter.use('/schedules', schedulesRouter)
apiRouter.use('/vans', vansRouter)
apiRouter.use('/payments', paymentsRouter)
