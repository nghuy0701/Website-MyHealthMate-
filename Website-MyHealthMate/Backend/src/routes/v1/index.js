import express from 'express'
import { userRouter } from './users'
import { predictionRouter } from './predictions'
import { patientRouter } from './patients'
import { mlRouter } from './ml'

const router = express.Router()

// API v1 routes
router.use('/users', userRouter)
router.use('/predictions', predictionRouter)
router.use('/patients', patientRouter)
router.use('/ml', mlRouter)

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Diabetes Prediction API is running',
    timestamp: new Date().toISOString()
  })
})

export const APIs_V1 = router
