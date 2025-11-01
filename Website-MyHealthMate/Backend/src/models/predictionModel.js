import { GET_DB  } from '~/configs/mongodb'
import Joi from 'joi'
import { ObjectId  } from 'mongodb'

const COLLECTION_NAME = 'predictions'

// Validation Schema for Prediction
const PREDICTION_COLLECTION_SCHEMA = Joi.object({
  userId: Joi.string().required(),
  patientId: Joi.string().optional().allow(null),
  
  // Input Features
  pregnancies: Joi.number().integer().min(0).required(),
  glucose: Joi.number().min(0).required(),
  bloodPressure: Joi.number().min(0).required(),
  skinThickness: Joi.number().min(0).required(),
  insulin: Joi.number().min(0).required(),
  bmi: Joi.number().min(0).required(),
  diabetesPedigreeFunction: Joi.number().min(0).required(),
  age: Joi.number().integer().min(0).required(),
  
  // Prediction Result
  prediction: Joi.number().valid(0, 1).required(), // 0: No Diabetes, 1: Diabetes
  probability: Joi.number().min(0).max(1).optional(),
  riskLevel: Joi.string().valid('Low', 'Medium', 'High').optional(),
  
  // ML Model Info
  modelUsed: Joi.string().optional(),
  modelVersion: Joi.string().optional(),
  
  // Metadata
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

// Create New Prediction
const createNew = async (data) => {
  try {
    const validData = await PREDICTION_COLLECTION_SCHEMA.validateAsync(data, {
      abortEarly: false
    })
    const createdPrediction = await GET_DB()
      .collection(COLLECTION_NAME)
      .insertOne(validData)
    return createdPrediction
  } catch (error) {
    throw new Error(error)
  }
}

// Find Prediction by ID
const findOneById = async (id) => {
  try {
    const result = await GET_DB()
      .collection(COLLECTION_NAME)
      .findOne({ _id: new ObjectId(id), _destroy: false })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

// Find All Predictions by User ID
const findByUserId = async (userId) => {
  try {
    const results = await GET_DB()
      .collection(COLLECTION_NAME)
      .find({ userId: userId, _destroy: false })
      .sort({ createdAt: -1 })
      .toArray()
    return results
  } catch (error) {
    throw new Error(error)
  }
}

// Find All Predictions by Patient ID
const findByPatientId = async (patientId) => {
  try {
    const results = await GET_DB()
      .collection(COLLECTION_NAME)
      .find({ patientId: patientId, _destroy: false })
      .sort({ createdAt: -1 })
      .toArray()
    return results
  } catch (error) {
    throw new Error(error)
  }
}

// Get All Predictions
const findAll = async () => {
  try {
    const results = await GET_DB()
      .collection(COLLECTION_NAME)
      .find({ _destroy: false })
      .sort({ createdAt: -1 })
      .toArray()
    return results
  } catch (error) {
    throw new Error(error)
  }
}

// Update Prediction
const update = async (id, data) => {
  try {
    data.updatedAt = Date.now()
    const result = await GET_DB()
      .collection(COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(id), _destroy: false },
        { $set: data },
        { returnDocument: 'after' }
      )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

// Delete Prediction (Soft Delete)
const deletePrediction = async (id) => {
  try {
    await GET_DB()
      .collection(COLLECTION_NAME)
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: { _destroy: true } }
      )
  } catch (error) {
    throw new Error(error)
  }
}

// Get Statistics
const getStatistics = async (userId = null) => {
  try {
    const match = { _destroy: false }
    if (userId) match.userId = userId

    const stats = await GET_DB()
      .collection(COLLECTION_NAME)
      .aggregate([
        { $match: match },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            diabetesCount: {
              $sum: { $cond: [{ $eq: ['$prediction', 1] }, 1, 0] }
            },
            noDiabetesCount: {
              $sum: { $cond: [{ $eq: ['$prediction', 0] }, 1, 0] }
            },
            avgGlucose: { $avg: '$glucose' },
            avgBMI: { $avg: '$bmi' },
            avgAge: { $avg: '$age' }
          }
        }
      ])
      .toArray()

    return stats.length > 0 ? stats[0] : null
  } catch (error) {
    throw new Error(error)
  }
}

export { createNew,
  findOneById,
  findByUserId,
  findByPatientId,
  findAll,
  update,
  deletePrediction,
  getStatistics
 }
