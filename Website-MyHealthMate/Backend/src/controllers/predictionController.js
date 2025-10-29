const { StatusCodes } = require('http-status-codes');
const services = require('../services');
const ApiError = require('../utils/ApiError');

// Create New Prediction
const createNew = async (req, res, next) => {
  try {
    const prediction = await services.predictionService.createNew(req);
    res.status(StatusCodes.CREATED).json({
      message: 'Prediction created successfully',
      data: prediction
    });
  } catch (error) {
    next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message));
  }
};

// Get Prediction by ID
const getPredictionById = async (req, res, next) => {
  try {
    const predictionId = req.params.id;
    const prediction = await services.predictionService.getById(predictionId);
    res.status(StatusCodes.OK).json({
      message: 'Prediction retrieved successfully',
      data: prediction
    });
  } catch (error) {
    next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message));
  }
};

// Get Predictions by User ID
const getPredictionsByUserId = async (req, res, next) => {
  try {
    const userId = req.params.userId || req.session.user.userId;
    const predictions = await services.predictionService.getByUserId(userId);
    res.status(StatusCodes.OK).json({
      message: 'Predictions retrieved successfully',
      data: predictions
    });
  } catch (error) {
    next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message));
  }
};

// Get My Predictions
const getMyPredictions = async (req, res, next) => {
  try {
    const userId = req.session.user.userId;
    const predictions = await services.predictionService.getByUserId(userId);
    res.status(StatusCodes.OK).json({
      message: 'Your predictions retrieved successfully',
      data: predictions
    });
  } catch (error) {
    next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message));
  }
};

// Get Predictions by Patient ID
const getPredictionsByPatientId = async (req, res, next) => {
  try {
    const patientId = req.params.patientId;
    const predictions = await services.predictionService.getByPatientId(patientId);
    res.status(StatusCodes.OK).json({
      message: 'Patient predictions retrieved successfully',
      data: predictions
    });
  } catch (error) {
    next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message));
  }
};

// Get All Predictions (Admin only)
const getAllPredictions = async (req, res, next) => {
  try {
    const predictions = await services.predictionService.getAllPredictions();
    res.status(StatusCodes.OK).json({
      message: 'All predictions retrieved successfully',
      data: predictions
    });
  } catch (error) {
    next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message));
  }
};

// Update Prediction
const updatePrediction = async (req, res, next) => {
  try {
    const predictionId = req.params.id;
    const updatedPrediction = await services.predictionService.updatePrediction(
      predictionId,
      req.body
    );
    res.status(StatusCodes.OK).json({
      message: 'Prediction updated successfully',
      data: updatedPrediction
    });
  } catch (error) {
    next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message));
  }
};

// Delete Prediction
const deletePrediction = async (req, res, next) => {
  try {
    const predictionId = req.params.id;
    await services.predictionService.deletePrediction(predictionId);
    res.status(StatusCodes.OK).json({
      message: 'Prediction deleted successfully'
    });
  } catch (error) {
    next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message));
  }
};

// Get Statistics
const getStatistics = async (req, res, next) => {
  try {
    const userId = req.query.userId || null;
    const stats = await services.predictionService.getStatistics(userId);
    res.status(StatusCodes.OK).json({
      message: 'Statistics retrieved successfully',
      data: stats
    });
  } catch (error) {
    next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message));
  }
};

module.exports = {
  createNew,
  getPredictionById,
  getPredictionsByUserId,
  getMyPredictions,
  getPredictionsByPatientId,
  getAllPredictions,
  updatePrediction,
  deletePrediction,
  getStatistics
};
