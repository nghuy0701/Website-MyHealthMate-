import express from 'express'
import { mlController } from '~/controllers'
import { isAuthenticated } from '~/middlewares'

const Router = express.Router()

// ML Service health check (public)
Router.route('/health')
  .get(mlController.checkHealth)

// ML Service info (public)
Router.route('/info')
  .get(mlController.getInfo)

// Test ML prediction (requires authentication)
Router.route('/test')
  .post(isAuthenticated, mlController.testPredict)

export const mlRoute = Router
