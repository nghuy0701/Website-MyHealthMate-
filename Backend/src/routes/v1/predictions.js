import express from 'express'
import { predictionController } from '~/controllers'
import { predictionValidation } from '~/validations'
import { isAuthenticated, isAdmin, predictionLimiter, cacheMiddleware, invalidateCacheMiddleware, cacheKeys } from '~/middlewares'

const Router = express.Router()

// All prediction routes require authentication
Router.use(isAuthenticated)

// Create new prediction and get all (admin)
Router.route('/')
  .post(predictionLimiter, predictionValidation.createNew, invalidateCacheMiddleware(cacheKeys.predictions.all), predictionController.createNew)
  .get(isAdmin, predictionController.getAllPredictions)

// Get my predictions
Router.route('/my-predictions')
  .get(cacheMiddleware(300, cacheKeys.predictions.user), predictionController.getMyPredictions)

// Get statistics
Router.route('/statistics')
  .get(predictionController.getStatistics)

// Get predictions by patient ID
Router.route('/patient/:patientId')
  .get(predictionController.getPredictionsByPatientId)

// Prediction operations by ID
Router.route('/:id')
  .get(cacheMiddleware(300, cacheKeys.predictions.detail), predictionController.getPredictionById)
  .put(predictionValidation.update, invalidateCacheMiddleware(cacheKeys.predictions.all), predictionController.updatePrediction)
  .delete(isAdmin, invalidateCacheMiddleware(cacheKeys.predictions.all), predictionController.deletePrediction)

export const predictionRoute = Router
