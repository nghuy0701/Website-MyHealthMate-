import { StatusCodes } from 'http-status-codes'
import { chatService } from '~/services'
import ApiError from '~/utils/ApiError'

/**
 * Chat Controller - Handles HTTP requests for chat functionality
 */

// Send message (branched by role)
const sendMessage = async (req, res, next) => {
  try {
    const userId = req.session.user.userId
    const userRole = req.session.user.role
    const { content, conversationId, attachments } = req.body

    if (!content && (!attachments || attachments.length === 0)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Message content or attachments required')
    }

    let result

    // Treat 'member' as 'patient' for chat purposes
    const isPatient = userRole === 'patient' || userRole === 'member'
    const isDoctor = userRole === 'doctor'

    if (isPatient) {
      // Patient sends message (may create conversation)
      result = await chatService.sendMessageAsPatient(userId, content || '', attachments || [])
    } else if (isDoctor) {
      // Doctor replies to patient
      if (!conversationId) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          'Conversation ID is required for doctor replies'
        )
      }
      result = await chatService.sendMessageAsDoctor(userId, conversationId, content || '', attachments || [])
    } else {
      throw new ApiError(StatusCodes.FORBIDDEN, 'Invalid user role for chat')
    }

    // Emit socket event (if socket is available)
    if (req.app.get('io')) {
      const io = req.app.get('io')
      const receiverId = result.receiverId
      io.to(receiverId).emit('message:new', {
        messageId: result.messageId,
        conversationId: result.conversationId,
        senderId: result.senderId,
        senderRole: result.senderRole,
        content: result.content,
        attachments: result.attachments || [],
        createdAt: result.createdAt
      })
    }

    res.status(StatusCodes.CREATED).json({
      message: 'Message sent successfully',
      data: result
    })
  } catch (error) {
    next(error)
  }
}

// Get doctor's inbox (conversations with patients)
const getDoctorInbox = async (req, res, next) => {
  try {
    const doctorId = req.session.user.userId
    const inbox = await chatService.getDoctorInbox(doctorId)

    res.status(StatusCodes.OK).json({
      message: 'Inbox retrieved successfully',
      data: inbox
    })
  } catch (error) {
    next(error)
  }
}

// Get patient's conversation info
const getPatientConversation = async (req, res, next) => {
  try {
    const patientId = req.session.user.userId
    const conversation = await chatService.getPatientConversation(patientId)

    res.status(StatusCodes.OK).json({
      message: 'Conversation retrieved successfully',
      data: conversation
    })
  } catch (error) {
    next(error)
  }
}

// Get messages in a conversation
const getMessages = async (req, res, next) => {
  try {
    const userId = req.session.user.userId
    const userRole = req.session.user.role
    const { conversationId } = req.params

    if (!conversationId) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Conversation ID is required')
    }

    const messages = await chatService.getMessages(userId, userRole, conversationId)

    res.status(StatusCodes.OK).json({
      message: 'Messages retrieved successfully',
      data: messages
    })
  } catch (error) {
    next(error)
  }
}

// Mark messages as read
const markAsRead = async (req, res, next) => {
  try {
    const userId = req.session.user.userId
    const { conversationId } = req.params

    if (!conversationId) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Conversation ID is required')
    }

    // Verify user belongs to conversation
    const { conversationModel } = await import('~/models')
    const belongsTo = await conversationModel.belongsToConversation(conversationId, userId)
    
    if (!belongsTo) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        'You are not authorized to access this conversation'
      )
    }

    // Mark as read
    const { messageModel } = await import('~/models')
    await messageModel.markAsRead(conversationId, userId)

    res.status(StatusCodes.OK).json({
      message: 'Messages marked as read'
    })
  } catch (error) {
    next(error)
  }
}

export const chatController = {
  sendMessage,
  getDoctorInbox,
  getPatientConversation,
  getMessages,
  markAsRead
}
