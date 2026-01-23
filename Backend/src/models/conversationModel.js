import { GET_DB } from '~/configs/mongodb'
import { ObjectId } from 'mongodb'

const COLLECTION_NAME = 'conversations'

/**
 * Conversation Model - Tracks patient-doctor conversations
 * Business Rule: Created ONLY when patient sends first message
 */

// Create new conversation
const createNew = async (data) => {
  try {
    const newConversation = {
      patientId: new ObjectId(data.patientId),
      doctorId: new ObjectId(data.doctorId),
      lastMessage: data.lastMessage || null,
      lastMessageAt: Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      _destroy: false
    }
    const result = await GET_DB()
      .collection(COLLECTION_NAME)
      .insertOne(newConversation)
    return result
  } catch (error) {
    throw new Error(error)
  }
}

// Find conversation between patient and doctor
const findByPatientAndDoctor = async (patientId, doctorId) => {
  try {
    const result = await GET_DB()
      .collection(COLLECTION_NAME)
      .findOne({
        patientId: new ObjectId(patientId),
        doctorId: new ObjectId(doctorId),
        _destroy: false
      })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

// Find conversation by ID
const findOneById = async (conversationId) => {
  try {
    const result = await GET_DB()
      .collection(COLLECTION_NAME)
      .findOne({
        _id: new ObjectId(conversationId),
        _destroy: false
      })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

// Get all conversations for a doctor (inbox)
const findByDoctorId = async (doctorId) => {
  try {
    const results = await GET_DB()
      .collection(COLLECTION_NAME)
      .find({
        doctorId: new ObjectId(doctorId),
        _destroy: false
      })
      .sort({ updatedAt: -1 })
      .toArray()
    return results
  } catch (error) {
    throw new Error(error)
  }
}

// Get conversation for a patient
const findByPatientId = async (patientId) => {
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

// Update last message
const updateLastMessage = async (conversationId, lastMessage) => {
  try {
    const result = await GET_DB()
      .collection(COLLECTION_NAME)
      .updateOne(
        { _id: new ObjectId(conversationId) },
        {
          $set: {
            lastMessage: lastMessage,
            lastMessageAt: Date.now(),
            updatedAt: Date.now()
          }
        }
      )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

// Check if user belongs to conversation
const belongsToConversation = async (conversationId, userId) => {
  try {
    const conversation = await GET_DB()
      .collection(COLLECTION_NAME)
      .findOne({
        _id: new ObjectId(conversationId),
        $or: [
          { patientId: new ObjectId(userId) },
          { doctorId: new ObjectId(userId) }
        ],
        _destroy: false
      })
    return !!conversation
  } catch (error) {
    throw new Error(error)
  }
}

export const conversationModel = {
  createNew,
  findByPatientAndDoctor,
  findOneById,
  findByDoctorId,
  findByPatientId,
  updateLastMessage,
  belongsToConversation
}
