import predictionModel from '~/models/predictionModel.js'
import { formatPrediction  } from '~/utils/formatter'
import { StatusCodes  } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import mlService from './mlService.js'

// Create New Prediction
const createNew = async (req) => {
  try {
    const userId = req.session.user.userId

    // Get prediction from ML Service
    console.log('📊 Creating new prediction for user:', userId)
    const mlResult = await mlService.predictDiabetes(req.body)

    const newPrediction = {
      userId: userId,
      patientId: req.body.patientId || null,
      pregnancies: req.body.pregnancies,
      glucose: req.body.glucose,
      bloodPressure: req.body.bloodPressure,
      skinThickness: req.body.skinThickness,
      insulin: req.body.insulin,
      bmi: req.body.bmi,
      diabetesPedigreeFunction: req.body.diabetesPedigreeFunction,
      age: req.body.age,
      prediction: mlResult.prediction,
      probability: mlResult.probability,
      riskLevel: mlResult.riskLevel,
      modelUsed: mlResult.modelUsed,
      modelVersion: mlResult.modelVersion
    }

    const createdPrediction = await predictionModel.createNew(newPrediction)
    const getPrediction = await predictionModel.findOneById(
      createdPrediction.insertedId.toString()
    )

    if (!getPrediction) {
      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        'Failed to retrieve newly created prediction.'
      )
    }

    return formatPrediction(getPrediction)
  } catch (error) {
    throw error
  }
}

// Get Prediction by ID
const getById = async (predictionId) => {
  try {
    const prediction = await predictionModel.findOneById(predictionId)
    if (!prediction) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Prediction not found')
    }
    return formatPrediction(prediction)
  } catch (error) {
    throw error
  }
}

// Get Predictions by User ID
const getByUserId = async (userId) => {
  try {
    const predictions = await predictionModel.findByUserId(userId)
    return predictions.map(p => formatPrediction(p))
  } catch (error) {
    throw error
  }
}

// Get Predictions by Patient ID
const getByPatientId = async (patientId) => {
  try {
    const predictions = await predictionModel.findByPatientId(patientId)
    return predictions.map(p => formatPrediction(p))
  } catch (error) {
    throw error
  }
}

// Get All Predictions
const getAllPredictions = async () => {
  try {
    const predictions = await predictionModel.findAll()
    return predictions.map(p => formatPrediction(p))
  } catch (error) {
    throw error
  }
}

// Update Prediction
const updatePrediction = async (predictionId, data) => {
  try {
    const prediction = await predictionModel.findOneById(predictionId)
    if (!prediction) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Prediction not found')
    }

    const updatedPrediction = await predictionModel.update(predictionId, data)
    return formatPrediction(updatedPrediction)
  } catch (error) {
    throw error
  }
}

// Delete Prediction
const deletePrediction = async (predictionId) => {
  try {
    const prediction = await predictionModel.findOneById(predictionId)
    if (!prediction) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Prediction not found')
    }
    await predictionModel.deletePrediction(predictionId)
  } catch (error) {
    throw error
  }
}

// Get Statistics
const getStatistics = async (userId = null) => {
  try {
    const stats = await predictionModel.getStatistics(userId)
    return stats
  } catch (error) {
    throw error
  }
}

const predictionService = {
  createNew,
  getById,
  getByUserId,
  getByPatientId,
  getAllPredictions,
  updatePrediction,
  deletePrediction,
  getStatistics
}

export default predictionService
