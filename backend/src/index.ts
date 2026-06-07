import cors from 'cors'
import express from 'express'
import { errorHandler } from './middleware/error-handler.middleware.js'
import { notFoundHandler } from './middleware/not-found.middleware.js'
import { apiRouter } from './routes/index.js'

const app = express()
const port = Number(process.env.PORT) || 3001

app.use(cors())
app.use(express.json())
app.use('/api', apiRouter)
app.use(notFoundHandler)
app.use(errorHandler)

app.listen(port, () => {
  console.log(`API server running on http://localhost:${port}`)
})
