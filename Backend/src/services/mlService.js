import axios from 'axios'
import { env } from '~/configs/environment'
import { StatusCodes } from 'http-status-codes'
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
 * @param {Object} data - Patient health data (21 questions)
 * @returns {Promise<Object>} Prediction result
 */
const predictDiabetes = async (data) => {
  try {
    // Extract gender (question 1)
    const gender = data.gender || null

    // Extract 8 medical indices for ML model (questions 2-9)
    const {
      pregnancies,      // Số lần mang thai
      glucose,          // Nồng độ glucose
      bloodPressure,    // Huyết áp
      skinThickness,    // Độ dày da
      insulin,          // Nồng độ insulin
      bmi,              // Chỉ số BMI
      diabetesPedigreeFunction, // Di truyền tiểu đường
      age               // Tuổi
    } = data

    // Extract 12 symptom questions (questions 10-21)
    const symptoms = {
      frequentThirst: data.frequentThirst || null,           // Câu 10: Khát nước thường xuyên
      frequentUrination: data.frequentUrination || null,     // Câu 11: Đi tiểu nhiều
      fatigue: data.fatigue || null,                         // Câu 12: Mệt mỏi
      weightLoss: data.weightLoss || null,                   // Câu 13: Giảm cân
      increasedHunger: data.increasedHunger || null,         // Câu 14: Đói nhanh
      blurredVision: data.blurredVision || null,             // Câu 15: Mờ mắt
      highBloodPressureDiagnosis: data.highBloodPressureDiagnosis || null, // Câu 16: Chẩn đoán huyết áp cao
      familyHistory: data.familyHistory || null,             // Câu 17: Tiền sử gia đình
      lowExercise: data.lowExercise || null,                 // Câu 18: Ít vận động
      sweetConsumption: data.sweetConsumption || null,       // Câu 19: Sử dụng đồ ngọt
      overweight: data.overweight || null,                   // Câu 20: Thừa cân/béo phì
      smokingAlcohol: data.smokingAlcohol || null,           // Câu 21: Hút thuốc/uống rượu
      numbnessTingling: data.numbnessTingling || null        // Câu 22: Tê/ngứa ran (nếu có)
    }

    // Store symptoms as JSON string for notes field
    const symptomsJson = JSON.stringify(symptoms, null, 2)

    // Prepare payload for ML service (only 8 medical indices)
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

    // Call ML API
    const response = await mlClient.post('/predict', payload)

    if (response.data && response.data.success) {
      const result = response.data.data

      // Convert probability from 0-1 to 0-100 for consistency
      const probabilityPercent = (result.probability || result.probability_diabetes) * 100;

      return {
        prediction: result.prediction, // 0 or 1
        probability: probabilityPercent,
        probabilities: result.probabilities || {
          no_diabetes: result.probability_no_diabetes,
          diabetes: result.probability_diabetes
        },
        riskLevel: determineRiskLevel(probabilityPercent),
        modelUsed: result.model_used || 'Unknown',
        modelVersion: result.model_version || 'Unknown',
        // Include additional data for saving to database
        gender: gender,
        symptoms: symptomsJson
      }
    } else {
      throw new Error('Invalid response from ML service')
    }
  } catch (error) {
    console.error('❌ ML Service error:', error.message)
    console.error('❌ Error details:', {
      code: error.code,
      response: error.response?.data,
      status: error.response?.status
    })

    // If ML service is unavailable, use fallback
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      console.warn('⚠️ ML Service unavailable, using fallback prediction')
      return {
        ...fallbackPrediction(data),
        gender: data.gender || null,
        symptoms: JSON.stringify({
          frequentThirst: data.frequentThirst || null,
          frequentUrination: data.frequentUrination || null,
          fatigue: data.fatigue || null,
          weightLoss: data.weightLoss || null,
          increasedHunger: data.increasedHunger || null,
          blurredVision: data.blurredVision || null,
          highBloodPressureDiagnosis: data.highBloodPressureDiagnosis || null,
          familyHistory: data.familyHistory || null,
          lowExercise: data.lowExercise || null,
          sweetConsumption: data.sweetConsumption || null,
          overweight: data.overweight || null,
          smokingAlcohol: data.smokingAlcohol || null,
          numbnessTingling: data.numbnessTingling || null
        }, null, 2)
      }
    }

    throw new ApiError(
      StatusCodes.SERVICE_UNAVAILABLE,
      `ML Service error: ${error.message}`
    )
  }
}

/**
 * Determine risk level based on probability
 * @param {Number} probability - Probability of diabetes (0-100)
 * @returns {String} Risk level: Low, Medium, High
 */
const determineRiskLevel = (probability) => {
  if (probability < 30) return 'low'
  if (probability < 60) return 'medium'
  return 'high'
}

/**
 * Fallback prediction when ML service is unavailable
 * Uses simple rule-based algorithm based on 8 medical indices + 12 symptoms
 * @param {Object} data - Patient health data (21 questions)
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

  // === MEDICAL INDICES (60 points max) ===

  // Glucose level (most important factor - 25 points)
  if (glucose > 140) score += 25
  else if (glucose > 126) score += 20
  else if (glucose > 100) score += 12
  else score += 3

  // BMI (15 points)
  if (bmi > 30) score += 15
  else if (bmi > 25) score += 10
  else if (bmi > 23) score += 5
  else score += 2

  // Age (10 points)
  if (age > 60) score += 10
  else if (age > 45) score += 7
  else if (age > 30) score += 4
  else score += 1

  // Diabetes Pedigree Function (10 points)
  if (diabetesPedigreeFunction > 0.7) score += 10
  else if (diabetesPedigreeFunction > 0.5) score += 7
  else if (diabetesPedigreeFunction > 0.3) score += 4
  else score += 1

  // === SYMPTOMS (40 points max) ===

  // Critical symptoms (5 points each)
  if (data.frequentThirst === 'Có' || data.frequentThirst === true) score += 5
  if (data.frequentUrination === 'Có' || data.frequentUrination === true) score += 5
  if (data.fatigue === 'Có' || data.fatigue === true) score += 4
  if (data.weightLoss === 'Có' || data.weightLoss === true) score += 5
  if (data.increasedHunger === 'Có' || data.increasedHunger === true) score += 4
  if (data.blurredVision === 'Có' || data.blurredVision === true) score += 4

  // Risk factors (3 points each)
  if (data.familyHistory === 'Có' || data.familyHistory === true) score += 5
  if (data.highBloodPressureDiagnosis === 'Có' || data.highBloodPressureDiagnosis === true) score += 3

  // Lifestyle factors (2 points each)
  if (data.lowExercise === 'Có' || data.lowExercise === true) score += 2
  if (data.sweetConsumption === 'Có' || data.sweetConsumption === true) score += 2
  if (data.overweight === 'Có' || data.overweight === true) score += 3
  if (data.smokingAlcohol === 'Có' || data.smokingAlcohol === true) score += 2
  if (data.numbnessTingling === 'Có' || data.numbnessTingling === true) score += 3

  // Additional medical factors
  if (pregnancies > 6) score += 3
  else if (pregnancies > 3) score += 2
  else if (pregnancies > 0) score += 1

  if (insulin > 200) score += 2
  else if (insulin > 150) score += 1

  if (bloodPressure > 90) score += 3
  else if (bloodPressure > 80) score += 2
  else if (bloodPressure > 70) score += 1

  if (skinThickness > 30) score += 2
  else if (skinThickness > 20) score += 1

  // Calculate probability (convert to 0-100 scale)
  const probability = Math.min(score, 100)
  const prediction = probability > 50 ? 1 : 0
  const riskLevel = determineRiskLevel(probability)

  console.log(`📊 Fallback prediction - Score: ${score}/100, Probability: ${probability}%`)

  return {
    prediction,
    probability,
    probabilities: {
      no_diabetes: 100 - probability,
      diabetes: probability
    },
    riskLevel,
    modelUsed: 'Rule-Based Fallback (21 Questions)',
    modelVersion: 'v2.0.0'
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

const mlService = {
  predictDiabetes,
  checkHealth,
  getInfo,
  fallbackPrediction
}

export default mlService
