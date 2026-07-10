import { Router } from 'express'
import {
  createQrPhPayment,
  getQrPhPaymentStatus,
} from '../controllers/payments.controller.js'
import { asyncHandler } from '../middleware/async-handler.middleware.js'
import { authenticate } from '../middleware/auth.middleware.js'

export const paymentsRouter = Router()

paymentsRouter.use(authenticate)

paymentsRouter.post('/qrph', asyncHandler(createQrPhPayment))
paymentsRouter.get('/qrph/:paymentIntentId', asyncHandler(getQrPhPaymentStatus))

