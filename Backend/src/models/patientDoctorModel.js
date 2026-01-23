import { GET_DB } from '~/configs/mongodb'
import { ObjectId } from 'mongodb'

const COLLECTION_NAME = 'patient_doctors'

/**
 * PatientDoctor Model - Maps patients to their assigned doctors
 * Business Rule: One patient can only have ONE assigned doctor
 */

// Create mapping (assign doctor to patient)
const createMapping = async (data) => {
  try {
    const newMapping = {
      patientId: new ObjectId(data.patientId),
      doctorId: new ObjectId(data.doctorId),
      createdAt: Date.now(),
      _destroy: false
    }
    const result = await GET_DB()
      .collection(COLLECTION_NAME)
      .insertOne(newMapping)
    return result
  } catch (error) {
    throw new Error(error)
  }
}

// Find doctor assigned to patient
const findDoctorByPatientId = async (patientId) => {
  try {
    const result = await GET_DB()
      .collection(COLLECTION_NAME)
      .findOne({ 
        patientId: new ObjectId(patientId),
        _destroy: false 
      })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

// Find all patients assigned to a doctor
const findPatientsByDoctorId = async (doctorId) => {
  try {
    const results = await GET_DB()
      .collection(COLLECTION_NAME)
      .find({ 
        doctorId: new ObjectId(doctorId),
        _destroy: false 
      })
      .toArray()
    return results
  } catch (error) {
    throw new Error(error)
  }
}

// Check if patient already has an assigned doctor
const hasAssignedDoctor = async (patientId) => {
  try {
    const count = await GET_DB()
      .collection(COLLECTION_NAME)
      .countDocuments({ 
        patientId: new ObjectId(patientId),
        _destroy: false 
      })
    return count > 0
  } catch (error) {
    throw new Error(error)
  }
}

// Update patient's assigned doctor
const updateMapping = async (patientId, newDoctorId) => {
  try {
    const result = await GET_DB()
      .collection(COLLECTION_NAME)
      .updateOne(
        { 
          patientId: new ObjectId(patientId),
          _destroy: false 
        },
        {
          $set: {
            doctorId: new ObjectId(newDoctorId),
            updatedAt: Date.now()
          }
        }
      )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

export const patientDoctorModel = {
  createMapping,
  findDoctorByPatientId,
  findPatientsByDoctorId,
  hasAssignedDoctor,
  updateMapping
}
