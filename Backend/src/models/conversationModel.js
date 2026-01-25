import { GET_DB } from '~/configs/mongodb'
import { ObjectId } from 'mongodb'

const COLLECTION_NAME = 'conversations'

/**
 * Conversation Model - Tracks patient-doctor conversations (direct or group)
 * Business Rule: 
 * - Direct: Created when patient sends first message
 * - Group: Created by doctor with multiple patients
 */

// Create new conversation (direct or group)
const createNew = async (data) => {
  try {
    const type = data.type || 'direct'
    const newConversation = {
      type, // 'direct' or 'group'
      lastMessage: data.lastMessage || null,
      lastMessageAt: Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      _destroy: false
    }

    if (type === 'direct') {
      // Direct chat: patientId and doctorId
      newConversation.patientId = new ObjectId(data.patientId)
      newConversation.doctorId = new ObjectId(data.doctorId)
    } else if (type === 'group') {
      // Group chat: participants array and groupName
      newConversation.groupName = data.groupName
      newConversation.participants = data.participants.map(p => ({
        userId: new ObjectId(p.userId),
        role: p.role // 'doctor' or 'patient'
      }))
      newConversation.createdBy = new ObjectId(data.createdBy) // doctorId
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
        type: 'direct',
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
        $or: [
          // Direct chats where user is doctor
          { type: 'direct', doctorId: new ObjectId(doctorId) },
          // Group chats where user is participant
          { 
            type: 'group', 
            participants: { 
              $elemMatch: { 
                userId: new ObjectId(doctorId), 
                role: 'doctor' 
              } 
            } 
          }
        ],
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
    const results = await GET_DB()
      .collection(COLLECTION_NAME)
      .find({
        $or: [
          // Direct chats where user is patient
          { type: 'direct', patientId: new ObjectId(patientId) },
          // Group chats where user is participant
          { 
            type: 'group', 
            participants: { 
              $elemMatch: { 
                userId: new ObjectId(patientId), 
                role: 'patient' 
              } 
            } 
          }
        ],
        _destroy: false
      })
      .sort({ updatedAt: -1 })
      .toArray()
    return results
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
          // Direct chat
          { type: 'direct', patientId: new ObjectId(userId) },
          { type: 'direct', doctorId: new ObjectId(userId) },
          // Group chat
          { 
            type: 'group', 
            participants: { 
              $elemMatch: { userId: new ObjectId(userId) } 
            } 
          }
        ],
        _destroy: false
      })
    return !!conversation
  } catch (error) {
    throw new Error(error)
  }
}

// Get participants of a conversation
const getParticipants = async (conversationId) => {
  try {
    const conversation = await GET_DB()
      .collection(COLLECTION_NAME)
      .findOne({
        _id: new ObjectId(conversationId),
        _destroy: false
      })
    
    if (!conversation) return []

    if (conversation.type === 'direct') {
      return [
        { userId: conversation.patientId, role: 'patient' },
        { userId: conversation.doctorId, role: 'doctor' }
      ]
    } else if (conversation.type === 'group') {
      return conversation.participants || []
    }

    return []
  } catch (error) {
    throw new Error(error)
  }
}

// Remove participant from group conversation
const removeParticipant = async (conversationId, userId) => {
  try {
    const result = await GET_DB().collection(COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(conversationId) },
      {
        $pull: {
          participants: { userId: new ObjectId(userId) }
        },
        $set: { updatedAt: Date.now() }
      },
      { returnDocument: 'after' }
    )
    
    return result
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
  belongsToConversation,
  getParticipants,
  removeParticipant
}
