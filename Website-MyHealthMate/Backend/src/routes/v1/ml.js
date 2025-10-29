const express = require('express');
const controllers = require('../../controllers');
const middlewares = require('../../middlewares');

const router = express.Router();

// ML Service health check (public)
router.get('/health', controllers.mlController.checkHealth);

// ML Service info (public)
router.get('/info', controllers.mlController.getInfo);

// Test ML prediction (requires authentication)
router.post('/test', middlewares.isAuthenticated, controllers.mlController.testPredict);

module.exports = { mlRouter: router };
