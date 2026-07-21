import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import { allowedOrigins, isOriginAllowed, isProduction, port } from './config.js'
import { logger } from './lib/logger.js'
import { prisma } from './lib/prisma.js'
import { errorHandler } from './middleware/error-handler.middleware.js'
import { notFoundHandler } from './middleware/not-found.middleware.js'
import { apiRateLimiter } from './middleware/rate-limit.middleware.js'
import { requestLogger } from './middleware/request-logger.middleware.js'
import { apiRouter } from './routes/index.js'

const app = express()

// Behind a reverse proxy / load balancer in production: trust the first hop so
// req.ip (used by rate limiting) reflects the real client address.
app.set('trust proxy', isProduction ? 1 : false)
app.disable('x-powered-by')

app.use(helmet())
app.use(
  cors({
    origin(origin, callback) {
      if (isOriginAllowed(origin)) {
        callback(null, true)
        return
      }
      callback(new Error('Not allowed by CORS'))
    },
  }),
)
app.use(express.json({ limit: '100kb' }))
app.use(requestLogger)
app.use('/api', apiRateLimiter, apiRouter)
app.use(notFoundHandler)
app.use(errorHandler)

const server = app.listen(port, () => {
  logger.info('API server started', {
    port,
    env: process.env.NODE_ENV ?? 'development',
    allowedOrigins,
  })
})

// Fail fast on connection storms rather than piling up sockets.
server.headersTimeout = 65_000
server.requestTimeout = 60_000

async function shutdown(signal: string) {
  logger.info('Shutting down', { signal })

  const forceExit = setTimeout(() => {
    logger.error('Forced shutdown after timeout')
    process.exit(1)
  }, 10_000)
  forceExit.unref()

  server.close(async () => {
    try {
      await prisma.$disconnect()
    } catch (error) {
      logger.error('Error during Prisma disconnect', { error })
    }
    clearTimeout(forceExit)
    logger.info('Shutdown complete')
    process.exit(0)
  })
}

process.on('SIGTERM', () => void shutdown('SIGTERM'))
process.on('SIGINT', () => void shutdown('SIGINT'))

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled promise rejection', { error: reason })
})

process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', { error })
  // An uncaught exception leaves the process in an undefined state: shut down.
  void shutdown('uncaughtException')
})
