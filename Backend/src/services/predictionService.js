import predictionModel from '~/models/predictionModel.js'
import { formatPrediction  } from '~/utils/formatter'
import { StatusCodes  } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import mlService from './mlService.js'
import emailService from './emailService.js'
import { notificationService } from './index.js'

// Create New Prediction
const createNew = async (req) => {
  try {
    const userId = req.session.user.userId

    // Get prediction from ML Service
    const mlResult = await mlService.predictDiabetes(req.body)

    // Tạo patient record nếu có thông tin bệnh nhân
    let patientId = req.body.patientId || null
    let patientEmail = req.body.patientEmail || null
    let patientName = req.body.patientName || null
    
    if (req.body.patientName && !patientId) {
      // Import patientModel để tạo bệnh nhân mới
      const patientModel = (await import('~/models/patientModel.js')).default
      
      const newPatient = {
        userId: userId,
        displayName: req.body.patientName,
        email: req.body.patientEmail || null,
        phone: null,
        address: null,
        dateOfBirth: null,
        gender: req.body.gender || null
      }
      
      const createdPatient = await patientModel.createNew(newPatient)
      patientId = createdPatient.insertedId.toString()
    }

    const newPrediction = {
      userId: userId,
      patientId: patientId,
      gender: req.body.gender || null,
      pregnancies: req.body.pregnancies,
      glucose: req.body.glucose,
      bloodPressure: req.body.bloodPressure,
      skinThickness: req.body.skinThickness,
      insulin: req.body.insulin,
      bmi: req.body.bmi,
      diabetesPedigreeFunction: req.body.diabetesPedigreeFunction,
      age: req.body.age,
      notes: req.body.notes || null,
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

    // Send prediction result email to patient (async, don't wait)
    if (patientEmail) {
      emailService.sendPredictionResultEmail(patientEmail, patientName, getPrediction)
        .catch(err => {
          // Silent fail - email is not critical
        })
    }

    // Create notification for patient about new prediction result
    try {
      const riskEmoji = getPrediction.riskLevel === 'high' ? '🔴' : 
                        getPrediction.riskLevel === 'medium' ? '🟠' : '🟢';
      
      const notificationData = {
        userId: userId,
        type: 'prediction',
        title: `${riskEmoji} Kết quả dự đoán mới`,
        description: `Kết quả dự đoán tiểu đường của bạn đã sẵn sàng. Mức độ nguy cơ: ${getPrediction.riskLevel === 'high' ? 'Cao' : getPrediction.riskLevel === 'medium' ? 'Trung bình' : 'Thấp'} (${Math.round(getPrediction.probability * 100)}%)`,
        role: 'patient', // Only show to patients
        deepLink: {
          pathname: `/prediction/${getPrediction._id.toString()}`,
          query: {}
        },
        meta: {
          predictionId: getPrediction._id.toString(),
          riskLevel: getPrediction.riskLevel,
          probability: getPrediction.probability
        }
      };
      
      await notificationService.createNotification(notificationData);
      console.log(`[Prediction] Created notification for user ${userId}`);
    } catch (notifError) {
      console.error('[Prediction] Error creating notification:', notifError);
      // Don't fail the prediction if notification fails
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
