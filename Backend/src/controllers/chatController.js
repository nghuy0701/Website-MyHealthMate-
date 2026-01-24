import { StatusCodes } from 'http-status-codes'
import { chatService } from '~/services'
import { notificationService } from '~/services/notificationService'
import ApiError from '~/utils/ApiError'
import { createLogger } from '~/utils/logger'

const logger = createLogger('ChatController')

/**
 * Chat Controller - Handles HTTP requests for chat functionality
 */

// Send message (branched by role)
const sendMessage = async (req, res, next) => {
  try {
    const userId = req.session.user.userId
    const userRole = req.session.user.role
    const { content, conversationId } = req.body

    if (!content || content.trim() === '') {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Message content is required')
    }

    let result

    // Treat 'member' as 'patient' for chat purposes
    const isPatient = userRole === 'patient' || userRole === 'member'
    const isDoctor = userRole === 'doctor'

    if (isPatient) {
      // Patient sends message (may create conversation)
      result = await chatService.sendMessageAsPatient(userId, content)
    } else if (isDoctor) {
      // Doctor replies to patient
      if (!conversationId) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          'Conversation ID is required for doctor replies'
        )
      }
      result = await chatService.sendMessageAsDoctor(userId, conversationId, content)
    } else {
      throw new ApiError(StatusCodes.FORBIDDEN, 'Invalid user role for chat')
    }

    // Emit socket events (if socket is available)
    if (req.app.get('io')) {
      const io = req.app.get('io')
      const receiverId = result.receiverId
      
      // Emit message event
      io.to(receiverId).emit('message:new', {
        messageId: result.messageId,
        conversationId: result.conversationId,
        senderId: result.senderId,
        senderRole: result.senderRole,
        content: result.content,
        createdAt: result.createdAt
      })

      // Create and emit notification (background task - don't wait)
      createChatNotification(receiverId, result, isDoctor, io).catch(err => {
        logger.error('Error creating chat notification:', err)
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

// Helper function to create chat notification
const createChatNotification = async (receiverId, messageResult, senderIsDoctor, io) => {
  try {
    const senderName = senderIsDoctor ? messageResult.senderName : 'Bệnh nhân'
    const truncatedContent = messageResult.content.length > 100 
      ? messageResult.content.substring(0, 100) + '…'
      : messageResult.content

    const notificationData = {
      userId: receiverId,
      type: 'chat',
      title: `Tin nhắn mới từ ${senderName}`,
      description: truncatedContent,
      role: senderIsDoctor ? 'patient' : 'doctor', // Only show to the recipient's role
      deepLink: {
        pathname: '/chat',
        query: {
          conversationId: messageResult.conversationId
        }
      },
      meta: {
        conversationId: messageResult.conversationId,
        senderId: messageResult.senderId,
        senderName: senderName
      }
    }

    const notification = await notificationService.createNotification(notificationData)
    
    // Emit notification event to receiver
    io.to(receiverId).emit('notification:new', {
      notification: {
        id: notification._id.toString(),
        type: notification.type,
        title: notification.title,
        description: notification.description,
        isRead: notification.isRead,
        role: notification.role,
        deepLink: notification.deepLink,
        createdAt: notification.createdAt,
        meta: {
          conversationId: notification.meta?.conversationId?.toString(),
          senderId: notification.meta?.senderId?.toString(),
          senderName: notification.meta?.senderName
        }
      }
    })
    
    logger.info(`[Notification] Created chat notification for user ${receiverId}`)
  } catch (error) {
    logger.error('[Notification] Error creating chat notification:', error)
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
