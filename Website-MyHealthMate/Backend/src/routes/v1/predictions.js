import express from 'express'
import { predictionController } from '~/controllers'
import { predictionValidation } from '~/validations'
import { isAuthenticated, isAdmin } from '~/middlewares'

const Router = express.Router()

// All prediction routes require authentication
Router.use(isAuthenticated)

// Create new prediction and get all (admin)
Router.route('/')
  .post(predictionValidation.createNew, predictionController.createNew)
  .get(isAdmin, predictionController.getAllPredictions)

// Get my predictions
Router.route('/my-predictions')
  .get(predictionController.getMyPredictions)

// Get statistics
Router.route('/statistics')
  .get(predictionController.getStatistics)

// Get predictions by patient ID
Router.route('/patient/:patientId')
  .get(predictionController.getPredictionsByPatientId)

// Prediction operations by ID
Router.route('/:id')
  .get(predictionController.getPredictionById)
  .put(predictionValidation.update, predictionController.updatePrediction)
  .delete(predictionController.deletePrediction)

export const predictionRoute = Router
