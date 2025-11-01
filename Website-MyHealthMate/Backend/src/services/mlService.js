import axios from 'axios'
import { env  } from '~/configs/environment'
import { StatusCodes  } from 'http-status-codes'
import ApiError from '~/utils/ApiError'

/**
 * ML Service Client
 * Giao tiếp với Python ML Service qua HTTP API
 */

// Create axios instance for ML service
const mlClient = axios.create({
  baseURL: env.ML_SERVICE_URL || 'http://localhost:5001',
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json'
  }
})

/**
 * Call ML API to predict diabetes
 * @param {Object} data - Patient health data
 * @returns {Promise<Object>} Prediction result
 */
const predictDiabetes = async (data) => {
  try {
    const {
      pregnancies,
      glucose,
      bloodPressure,
      skinThickness,
      insulin,
      bmi,
      diabetesPedigreeFunction,
      age
    } = data

    // Prepare payload for ML service
    const payload = {
      pregnancies: Number(pregnancies),
      glucose: Number(glucose),
      blood_pressure: Number(bloodPressure),
      skin_thickness: Number(skinThickness),
      insulin: Number(insulin),
      bmi: Number(bmi),
      diabetes_pedigree_function: Number(diabetesPedigreeFunction),
      age: Number(age)
    }

    console.log('🔮 Calling ML Service with data:', payload)

    // Call ML API
    const response = await mlClient.post('/predict', payload)

    if (response.data && response.data.success) {
      const result = response.data.data
      
      console.log('✅ ML Service response:', result)

      return {
        prediction: result.prediction, // 0 or 1
        probability: result.probability || result.probability_diabetes,
        probabilities: result.probabilities || {
          no_diabetes: result.probability_no_diabetes,
          diabetes: result.probability_diabetes
        },
        riskLevel: determineRiskLevel(result.probability || result.probability_diabetes),
        modelUsed: result.model_used || 'Unknown',
        modelVersion: result.model_version || 'Unknown'
      }
    } else {
      throw new Error('Invalid response from ML service')
    }
  } catch (error) {
    console.error('❌ ML Service error:', error.message)

    // If ML service is unavailable, use fallback
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      console.warn('⚠️ ML Service unavailable, using fallback prediction')
      return fallbackPrediction(data)
    }

    throw new ApiError(
      StatusCodes.SERVICE_UNAVAILABLE,
      `ML Service error: ${error.message}`
    )
  }
}

/**
 * Determine risk level based on probability
 * @param {Number} probability - Probability of diabetes (0-1)
 * @returns {String} Risk level: Low, Medium, High
 */
const determineRiskLevel = (probability) => {
  if (probability < 0.3) return 'Low'
  if (probability < 0.6) return 'Medium'
  return 'High'
}

/**
 * Fallback prediction when ML service is unavailable
 * Uses simple rule-based algorithm
 * @param {Object} data - Patient health data
 * @returns {Object} Prediction result
 */
const fallbackPrediction = (data) => {
  const {
    pregnancies,
    glucose,
    bloodPressure,
    skinThickness,
    insulin,
    bmi,
    diabetesPedigreeFunction,
    age
  } = data

  let score = 0

  // Glucose level (most important factor)
  if (glucose > 140) score += 40
  else if (glucose > 100) score += 20
  else score += 5

  // BMI
  if (bmi > 30) score += 25
  else if (bmi > 25) score += 15
  else score += 5

  // Age
  if (age > 45) score += 15
  else if (age > 30) score += 8
  else score += 3

  // Diabetes Pedigree Function
  if (diabetesPedigreeFunction > 0.5) score += 10
  else score += 5

  // Pregnancies
  if (pregnancies > 6) score += 5
  else if (pregnancies > 0) score += 2

  // Insulin
  if (insulin > 200) score += 3
  else if (insulin > 100) score += 1

  // Blood Pressure
  if (bloodPressure > 80) score += 2

  // Calculate probability
  const probability = Math.min(score / 100, 1)
  const prediction = probability > 0.5 ? 1 : 0
  const riskLevel = determineRiskLevel(probability)

  return {
    prediction,
    probability,
    probabilities: {
      no_diabetes: 1 - probability,
      diabetes: probability
    },
    riskLevel,
    modelUsed: 'Rule-Based Fallback',
    modelVersion: 'v1.0.0'
  }
}

/**
 * Check ML service health
 * @returns {Promise<Object>} Health status
 */
const checkHealth = async () => {
  try {
    const response = await mlClient.get('/health')
    return {
      status: 'available',
      data: response.data
    }
  } catch (error) {
    return {
      status: 'unavailable',
      error: error.message
    }
  }
}

/**
 * Get ML service info
 * @returns {Promise<Object>} Service info
 */
const getInfo = async () => {
  try {
    const response = await mlClient.get('/')
    return response.data
  } catch (error) {
    throw new ApiError(
      StatusCodes.SERVICE_UNAVAILABLE,
      `Cannot get ML service info: ${error.message}`
    )
  }
}

export { predictDiabetes,
  checkHealth,
  getInfo,
  fallbackPrediction
 }
