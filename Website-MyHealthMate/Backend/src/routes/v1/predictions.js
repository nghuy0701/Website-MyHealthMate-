const express = require('express');
const controllers = require('../../controllers');
const middlewares = require('../../middlewares');

const router = express.Router();

// All prediction routes require authentication
router.use(middlewares.isAuthenticated);

// Create new prediction
router.post('/', controllers.predictionController.createNew);

// Get my predictions
router.get('/my-predictions', controllers.predictionController.getMyPredictions);

// Get statistics
router.get('/statistics', controllers.predictionController.getStatistics);

// Get predictions by patient ID
router.get('/patient/:patientId', controllers.predictionController.getPredictionsByPatientId);

// Get all predictions (Admin only)
router.get('/', middlewares.isAdmin, controllers.predictionController.getAllPredictions);

// Get prediction by ID
router.get('/:id', controllers.predictionController.getPredictionById);

// Update prediction
router.put('/:id', controllers.predictionController.updatePrediction);

// Delete prediction
router.delete('/:id', controllers.predictionController.deletePrediction);

module.exports = { predictionRouter: router };
