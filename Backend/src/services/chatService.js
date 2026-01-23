import { StatusCodes } from 'http-status-codes'
import { ObjectId } from 'mongodb'
import { 
  patientDoctorModel, 
  conversationModel, 
  messageModel,
  userModel 
} from '~/models'
import ApiError from '~/utils/ApiError'

/**
 * Chat Service - Business logic for medical consultation chat
 * Implements inbox-style consultation model
 */

// Patient sends message (creates conversation if first message)
const sendMessageAsPatient = async (patientId, content) => {
  try {
    // 1. Find assigned doctor
    const mapping = await patientDoctorModel.findDoctorByPatientId(patientId)
    if (!mapping) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'You do not have an assigned doctor yet. Please contact support.'
      )
    }

    const doctorId = mapping.doctorId.toString()

    // 2. Find or create conversation
    let conversation = await conversationModel.findByPatientAndDoctor(patientId, doctorId)
    
    if (!conversation) {
      // Create new conversation (first message)
      const newConv = await conversationModel.createNew({
        patientId,
        doctorId,
        lastMessage: content
      })
      conversation = {
        _id: newConv.insertedId,
        patientId: new ObjectId(patientId),
        doctorId: new ObjectId(doctorId)
      }
    }

    // 3. Save message
    const messageData = {
      conversationId: conversation._id.toString(),
      senderId: patientId,
      senderRole: 'patient',
      content,
      read: false
    }
    const savedMessage = await messageModel.createNew(messageData)

    // 4. Update conversation's last message
    await conversationModel.updateLastMessage(conversation._id.toString(), content)

    // 5. Return message with metadata
    return {
      messageId: savedMessage.insertedId,
      conversationId: conversation._id,
      content,
      senderId: patientId,
      senderRole: 'patient',
      receiverId: doctorId,
      createdAt: Date.now()
    }
  } catch (error) {
    throw error
  }
}

// Doctor replies to patient
const sendMessageAsDoctor = async (doctorId, conversationId, content) => {
  try {
    // 1. Verify conversation belongs to doctor
    const conversation = await conversationModel.findOneById(conversationId)
    if (!conversation) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Conversation not found')
    }

    if (conversation.doctorId.toString() !== doctorId) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        'You are not authorized to reply to this conversation'
      )
    }

    // 2. Save message
    const messageData = {
      conversationId,
      senderId: doctorId,
      senderRole: 'doctor',
      content,
      read: false
    }
    const savedMessage = await messageModel.createNew(messageData)

    // 3. Update conversation's last message
    await conversationModel.updateLastMessage(conversationId, content)

    // 4. Return message with metadata
    const patientId = conversation.patientId.toString()
    return {
      messageId: savedMessage.insertedId,
      conversationId: new ObjectId(conversationId),
      content,
      senderId: doctorId,
      senderRole: 'doctor',
      receiverId: patientId,
      createdAt: Date.now()
    }
  } catch (error) {
    throw error
  }
}

// Get doctor's inbox (conversations with patients who messaged)
const getDoctorInbox = async (doctorId) => {
  try {
    // Get all conversations for this doctor
    const conversations = await conversationModel.findByDoctorId(doctorId)

    // Enrich with patient data and unread count
    const inbox = await Promise.all(
      conversations.map(async (conv) => {
        const patientId = conv.patientId.toString()
        
        // Get patient info
        const patient = await userModel.findOneById(patientId)
        
        // Count unread messages
        const unreadCount = await messageModel.countUnreadMessages(
          conv._id.toString(),
          doctorId
        )

        return {
          conversationId: conv._id,
          patientId: conv.patientId,
          patientName: patient?.displayName || patient?.userName || 'Unknown',
          patientAvatar: patient?.avatar || null,
          lastMessage: conv.lastMessage,
          lastMessageAt: conv.lastMessageAt,
          unreadCount,
          updatedAt: conv.updatedAt
        }
      })
    )

    return inbox
  } catch (error) {
    throw error
  }
}

// Get messages in a conversation
const getMessages = async (userId, userRole, conversationId) => {
  try {
    // 1. Verify user belongs to conversation
    const belongsTo = await conversationModel.belongsToConversation(conversationId, userId)
    if (!belongsTo) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        'You are not authorized to view this conversation'
      )
    }

    // 2. Get all messages
    const messages = await messageModel.findByConversationId(conversationId)

    // 3. Mark messages as read
    await messageModel.markAsRead(conversationId, userId)

    // 4. Enrich messages with sender info
    const enrichedMessages = await Promise.all(
      messages.map(async (msg) => {
        const sender = await userModel.findOneById(msg.senderId.toString())
        return {
          id: msg._id,
          conversationId: msg.conversationId,
          senderId: msg.senderId,
          senderName: sender?.displayName || sender?.userName || 'Unknown',
          senderRole: msg.senderRole,
          content: msg.content,
          read: msg.read,
          createdAt: msg.createdAt,
          isOwn: msg.senderId.toString() === userId
        }
      })
    )

    return enrichedMessages
  } catch (error) {
    throw error
  }
}

// Get patient's conversation (single conversation with assigned doctor)
const getPatientConversation = async (patientId) => {
  try {
    // Find assigned doctor
    const mapping = await patientDoctorModel.findDoctorByPatientId(patientId)
    if (!mapping) {
      return null // No assigned doctor yet
    }

    const doctorId = mapping.doctorId.toString()

    // Find conversation (may not exist if patient hasn't sent first message)
    const conversation = await conversationModel.findByPatientAndDoctor(patientId, doctorId)

    if (!conversation) {
      // Return doctor info but no conversation yet
      const doctor = await userModel.findOneById(doctorId)
      return {
        conversationId: null,
        doctorId: mapping.doctorId,
        doctorName: doctor?.displayName || doctor?.userName || 'Doctor',
        doctorAvatar: doctor?.avatar || null,
        doctorSpecialty: doctor?.specialty || 'General',
        hasConversation: false
      }
    }

    // Get unread count
    const unreadCount = await messageModel.countUnreadMessages(
      conversation._id.toString(),
      patientId
    )

    // Get doctor info
    const doctor = await userModel.findOneById(doctorId)

    return {
      conversationId: conversation._id,
      doctorId: conversation.doctorId,
      doctorName: doctor?.displayName || doctor?.userName || 'Doctor',
      doctorAvatar: doctor?.avatar || null,
      doctorSpecialty: doctor?.specialty || 'General',
      lastMessage: conversation.lastMessage,
      lastMessageAt: conversation.lastMessageAt,
      unreadCount,
      hasConversation: true
    }
  } catch (error) {
    throw error
  }
}

export const chatService = {
  sendMessageAsPatient,
  sendMessageAsDoctor,
  getDoctorInbox,
  getMessages,
  getPatientConversation
}
