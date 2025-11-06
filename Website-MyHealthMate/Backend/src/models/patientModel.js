import { GET_DB  } from '~/configs/mongodb'
import { ObjectId  } from 'mongodb'

const COLLECTION_NAME = 'patients'

// Invalid Update Fields
const INVALID_UPDATE_FIELDS = ['_id', 'userId', 'createdAt']

// Create New Patient
const createNew = async (data) => {
  try {
    const newPatient = {
      ...data,
      createdAt: Date.now(),
      updatedAt: null,
      _destroy: false
    }
    const createdPatient = await GET_DB()
      .collection(COLLECTION_NAME)
      .insertOne(newPatient)
    return createdPatient
  } catch (error) {
    throw new Error(error)
  }
}

// Find Patient by ID
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

// Find All Patients by User ID (Doctor's patients)
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

// Find Patient by Email
const findOneByEmail = async (email) => {
  try {
    const result = await GET_DB()
      .collection(COLLECTION_NAME)
      .findOne({ email: email, _destroy: false })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

// Get All Patients
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

// Update Patient
const update = async (id, data) => {
  try {
    // Remove invalid fields
    Object.keys(data).forEach((key) => {
      if (INVALID_UPDATE_FIELDS.includes(key)) {
        delete data[key]
      }
    })

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

// Delete Patient (Soft Delete)
const deletePatient = async (id) => {
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

const patientModel = {
  createNew,
  findOneById,
  findByUserId,
  findOneByEmail,
  findAll,
  update,
  deletePatient
}

export default patientModel
