import { GET_DB  } from '~/configs/mongodb'
import { ObjectId  } from 'mongodb'

const COLLECTION_NAME = 'predictions'

// Create New Prediction
const createNew = async (data) => {
  try {
    const newPrediction = {
      ...data,
      createdAt: Date.now(),
      updatedAt: null,
      _destroy: false
    }
    const createdPrediction = await GET_DB()
      .collection(COLLECTION_NAME)
      .insertOne(newPrediction)
    return createdPrediction
  } catch (error) {
    throw new Error(error)
  }
}

// Find Prediction by ID
const findOneById = async (id) => {
  try {
    const results = await GET_DB()
      .collection(COLLECTION_NAME)
      .aggregate([
        { $match: { _id: new ObjectId(id), _destroy: false } },
        {
          $lookup: {
            from: 'users',
            let: { userId: { $toObjectId: '$userId' } },
            pipeline: [
              { $match: { $expr: { $eq: ['$_id', '$$userId'] } } },
              { $project: { username: 1, displayName: 1, email: 1 } }
            ],
            as: 'userInfo'
          }
        },
        {
          $lookup: {
            from: 'patients',
            let: { patientId: { $toObjectId: '$patientId' } },
            pipeline: [
              { $match: { $expr: { $eq: ['$_id', '$$patientId'] } } },
              { $project: { displayName: 1, email: 1, phone: 1 } }
            ],
            as: 'patientInfo'
          }
        },
        {
          $addFields: {
            userId: { $arrayElemAt: ['$userInfo', 0] },
            patientId: { $arrayElemAt: ['$patientInfo', 0] }
          }
        },
        { $project: { userInfo: 0, patientInfo: 0 } }
      ])
      .toArray()
    return results[0] || null
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
      .aggregate([
        { $match: { _destroy: false } },
        {
          $lookup: {
            from: 'users',
            let: { userId: { $toObjectId: '$userId' } },
            pipeline: [
              { $match: { $expr: { $eq: ['$_id', '$$userId'] } } },
              { $project: { username: 1, displayName: 1, email: 1 } }
            ],
            as: 'userInfo'
          }
        },
        {
          $lookup: {
            from: 'patients',
            let: { patientId: { $toObjectId: '$patientId' } },
            pipeline: [
              { $match: { $expr: { $eq: ['$_id', '$$patientId'] } } },
              { $project: { displayName: 1, email: 1, phone: 1 } }
            ],
            as: 'patientInfo'
          }
        },
        {
          $addFields: {
            userId: { $arrayElemAt: ['$userInfo', 0] },
            patientId: { $arrayElemAt: ['$patientInfo', 0] }
          }
        },
        { $project: { userInfo: 0, patientInfo: 0 } },
        { $sort: { createdAt: -1 } }
      ])
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

// Delete Prediction (Hard Delete)
const deletePrediction = async (id) => {
  try {
    await GET_DB()
      .collection(COLLECTION_NAME)
      .deleteOne({ _id: new ObjectId(id) })
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
            highRiskCount: {
              $sum: { $cond: [{ $gte: ['$probability', 70] }, 1, 0] }
            },
            mediumRiskCount: {
              $sum: { $cond: [{ $and: [{ $gte: ['$probability', 30] }, { $lt: ['$probability', 70] }] }, 1, 0] }
            },
            lowRiskCount: {
              $sum: { $cond: [{ $lt: ['$probability', 30] }, 1, 0] }
            },
            avgProbability: { $avg: '$probability' },
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

const predictionModel = {
  createNew,
  findOneById,
  findByUserId,
  findByPatientId,
  findAll,
  update,
  deletePrediction,
  getStatistics
}

export default predictionModel
