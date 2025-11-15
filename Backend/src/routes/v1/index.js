import express from 'express'
import { userRoute } from './users.js'
import { adminRoute } from './admin.js'
import { predictionRoute } from './predictions.js'
import { patientRoute } from './patients.js'
import { mlRoute } from './ml.js'

const Router = express.Router()

// API v1 routes
Router.use('/users', userRoute)
Router.use('/admin', adminRoute)
Router.use('/predictions', predictionRoute)
Router.use('/patients', patientRoute)
Router.use('/ml', mlRoute)

// Health check endpoint
Router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'MyHealthMate API is running',
    timestamp: new Date().toISOString()
  })
})

export const APIs_V1 = Router
