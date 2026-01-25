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

    if (conversationId) {
      // Send to existing conversation (direct or group)
      result = await chatService.sendMessage(userId, userRole, conversationId, content || '', attachments || [])
    } else if (isPatient) {
      // Patient sends message without conversationId (creates direct conversation)
      result = await chatService.sendMessageAsPatient(userId, content || '', attachments || [])
    } else if (isDoctor) {
      // Doctor must specify conversationId
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Conversation ID is required for doctor messages'
      )
    } else {
      throw new ApiError(StatusCodes.FORBIDDEN, 'Invalid user role for chat')
    }

    // Emit socket event
    if (req.app.get('io')) {
      const io = req.app.get('io')
      const conversationId = result.conversationId.toString()
      
      // ALWAYS emit to conversation room (for both direct and group)
      // Both users join this room when they open the conversation
      io.to(conversationId).emit('message:new', {
        messageId: result.messageId,
        conversationId: result.conversationId,
        senderId: result.senderId,
        senderName: result.senderName || 'Unknown',
        senderRole: result.senderRole,
        content: result.content,
        attachments: result.attachments || [],
        createdAt: result.createdAt
      })
      
      // ALSO emit to user rooms for conversation list updates
      // This ensures inbox/conversation list updates even when not viewing the chat
      if (result.participants) {
        // Group: emit to all participants
        result.participants.forEach(p => {
          io.to(p.userId.toString()).emit('conversation:updated', {
            conversationId: result.conversationId,
            lastMessage: result.content || '[Attachment]',
            lastMessageAt: result.createdAt
          })
        })
      } else if (result.receiverId) {
        // Direct: emit to both sender and receiver
        io.to(result.receiverId).emit('conversation:updated', {
          conversationId: result.conversationId,
          lastMessage: result.content || '[Attachment]',
          lastMessageAt: result.createdAt
        })
        io.to(userId).emit('conversation:updated', {
          conversationId: result.conversationId,
          lastMessage: result.content || '[Attachment]',
          lastMessageAt: result.createdAt
        })
      }
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
    const conversations = await chatService.getPatientConversation(patientId)

    res.status(StatusCodes.OK).json({
      message: 'Conversations retrieved successfully',
      data: conversations // Return array of conversations
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

// Create group conversation (doctor only)
const createGroupConversation = async (req, res, next) => {
  try {
    const doctorId = req.session.user.userId
    const { groupName, patientIds } = req.body

    if (!groupName || !patientIds || !Array.isArray(patientIds) || patientIds.length === 0) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Group name and patient IDs are required'
      )
    }

    if (patientIds.length < 2) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Group must have at least 2 patients'
      )
    }

    const result = await chatService.createGroupConversation(doctorId, groupName, patientIds)

    // Emit socket event to all participants for real-time update
    if (req.app.get('io')) {
      const io = req.app.get('io')
      const conversationId = result.conversationId.toString()
      
      // Emit to each participant's user room with full participant details
      result.participants.forEach(participant => {
        const userId = participant.userId.toString()
        io.to(userId).emit('conversation:created', {
          conversationId: conversationId,
          type: 'group',
          groupName: result.groupName,
          participants: result.participants, // Already enriched with name and avatar
          participantCount: result.participants.length,
          createdAt: Date.now()
        })
        console.log('[chatController] Emitted conversation:created to user room:', userId)
      })
    }

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Group conversation created successfully',
      conversation: result
    })
  } catch (error) {
    next(error)
  }
}

// Leave group conversation
const leaveGroup = async (req, res, next) => {
  try {
    const userId = req.session.user.userId
    const { conversationId } = req.params

    if (!conversationId) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Conversation ID is required')
    }

    // Remove user from group
    const result = await chatService.leaveGroup(userId, conversationId)

    // Emit socket event to notify remaining members
    if (req.app.get('io')) {
      const io = req.app.get('io')
      
      // Notify conversation room with updated participants list
      io.to(conversationId).emit('group:member_left', {
        conversationId,
        userId,
        participants: result.participants, // Updated list without the user who left
        groupName: result.groupName
      })
      
      console.log('[chatController] User left group:', userId, conversationId)
      console.log('[chatController] Remaining participants:', result.participants.length)
    }

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Successfully left group'
    })
  } catch (error) {
    next(error)
  }
}

export const chatController = {
  sendMessage,
  createGroupConversation,
  getDoctorInbox,
  getPatientConversation,
  getMessages,
  markAsRead,
  leaveGroup
}
