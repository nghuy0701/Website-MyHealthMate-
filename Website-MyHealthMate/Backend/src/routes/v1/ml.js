import express from 'express'
import * as controllers from '~/controllers'
import * as middlewares from '~/middlewares'

const router = express.Router()

// ML Service health check (public)
router.get('/health', controllers.mlController.checkHealth)

// ML Service info (public)
router.get('/info', controllers.mlController.getInfo)

// Test ML prediction (requires authentication)
router.post('/test', middlewares.isAuthenticated, controllers.mlController.testPredict)

export const mlRouter = router
