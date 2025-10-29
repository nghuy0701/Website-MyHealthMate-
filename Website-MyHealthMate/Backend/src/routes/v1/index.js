const express = require('express');
const { userRouter } = require('./users');
const { predictionRouter } = require('./predictions');
const { patientRouter } = require('./patients');
const { mlRouter } = require('./ml');

const router = express.Router();

// API v1 routes
router.use('/users', userRouter);
router.use('/predictions', predictionRouter);
router.use('/patients', patientRouter);
router.use('/ml', mlRouter);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Diabetes Prediction API is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = { APIs_V1: router };
