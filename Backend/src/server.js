import express from 'express'
import cors from 'cors'
import session from 'express-session'
import { CONNECT_DB, GET_DB } from '~/configs/mongodb'
import { env } from '~/configs/environment'
import { corsOptions } from '~/configs/cors'
import { sessionConfig } from '~/configs/session'
import { APIs_V1 } from '~/routes/v1'
import { errorHandlingMiddleware, generalLimiter } from '~/middlewares'
import { createLogger } from '~/utils/logger'

const START_SERVER = () => {
  const app = express()
  const logger = createLogger('Server')

  const hostname = env.APP_HOST || 'localhost'
  const port = env.APP_PORT || 8017

  // Trust proxy cho production
  if (env.NODE_ENV === 'production') {
    app.set('trust proxy', 1)
  }

  // Config CORS
  app.use(cors(corsOptions))

  // Enable req.body json data with increased limit for base64 images
  app.use(express.json({ limit: '10mb' }))
  app.use(express.urlencoded({ extended: true, limit: '10mb' }))

  // Enable session
  app.use(session(sessionConfig))

  // Apply general rate limiting to all routes
  app.use('/api/', generalLimiter)

  // Import All Routes
  app.use('/api/v1', APIs_V1)

  // Welcome route
  app.get('/', async (req, res) => {
    res.json({
      message: 'Welcome to MyHealthMate - Diabetes Prediction API',
      version: '1.0.0',
      author: env.AUTHOR,
      status: 'running',
      endpoints: {
        health: '/api/v1/health',
        users: '/api/v1/users',
        predictions: '/api/v1/predictions',
        patients: '/api/v1/patients',
        ml: '/api/v1/ml'
      }
    })
  })

  // Error Handling Middleware - Luôn đặt cuối cùng
  app.use(errorHandlingMiddleware)

  // Start server
  app.listen(port, hostname, () => {
    logger.success(`Server running at http://${hostname}:${port}/`, {
      author: env.AUTHOR,
      environment: env.NODE_ENV
    })
  })
}

// Kết nối Redis (optional - không bắt buộc để chạy app)
const logger = createLogger('Bootstrap')

Promise.all([
  CONNECT_DB().then(() => logger.connection('MongoDB Cloud Atlas', 'connected')),
  CONNECT_REDIS().then(() => logger.connection('Redis', 'connected'))
    .catch(() => logger.warn('Redis not available - Running without cache'))
])
  .then(() => START_SERVER())
  .catch(error => {
    logger.error('Failed to start application', { error: error.message })
    process.exit(0)
  })
