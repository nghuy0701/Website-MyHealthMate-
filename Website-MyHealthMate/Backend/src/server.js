import express from 'express'
import cors from 'cors'
import session from 'express-session'
import { CONNECT_DB, GET_DB } from '~/configs/mongodb'
import { env } from '~/configs/environment'
import { corsOptions } from '~/configs/cors'
import { sessionConfig } from '~/configs/session'
import { APIs_V1 } from '~/routes/v1'
import { errorHandlingMiddleware } from '~/middlewares'

const START_SERVER = () => {
  const app = express()

  const hostname = env.APP_HOST || 'localhost'
  const port = env.APP_PORT || 8017

  // Trust proxy cho production
  if (env.NODE_ENV === 'production') {
    app.set('trust proxy', 1)
  }

  // Config CORS
  app.use(cors(corsOptions))

  // Enable req.body json data
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))

  // Enable session
  app.use(session(sessionConfig))

  // Import All Routes
  app.use('/v1', APIs_V1)

  // Welcome route
  app.get('/', async (req, res) => {
    // Log all collections for debugging
    console.log(await GET_DB().listCollections().toArray())

    res.json({
      message: 'Welcome to MyHealthMate - Diabetes Prediction API',
      version: '1.0.0',
      author: env.AUTHOR,
      status: 'running',
      endpoints: {
        health: '/v1/health',
        users: '/v1/users',
        predictions: '/v1/predictions',
        patients: '/v1/patients',
        ml: '/v1/ml'
      }
    })
  })

  // Error Handling Middleware - Luôn đặt cuối cùng
  app.use(errorHandlingMiddleware)

  // Start server
  app.listen(port, hostname, () => {
    console.log(`Hello ${env.AUTHOR}, I am running at http://${hostname}:${port}/`)
  })
}

// Chỉ khi Kết nối tới Database thành công thì mới Start Server Back-end lên.
CONNECT_DB()
  .then(() => console.log('Connected to MongoDB Cloud Atlas!'))
  .then(() => START_SERVER())
  .catch(error => {
    console.error(error)
    process.exit(0)
  })
