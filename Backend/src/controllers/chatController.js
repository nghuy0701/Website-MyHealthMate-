import { StatusCodes } from 'http-status-codes'
import { chatService } from '~/services'
import { notificationService } from '~/services/notificationService'
import { createLogger } from '~/utils/logger'
import ApiError from '~/utils/ApiError'

/**
 * Chat Controller - Handles HTTP requests for chat functionality
 */

const logger = createLogger('ChatController')

// TEMPORARY: Migrate existing messages to add status field
const migrateMessageStatus = async (req, res, next) => {
  try {
    const { GET_DB } = await import('~/configs/mongodb')
    const db = GET_DB()

    const result = await db.collection('messages').updateMany(
      { status: { $exists: false } },
      { $set: { status: 'sent' } }
    )

    res.status(StatusCodes.OK).json({
      message: 'Migration completed',
      modifiedCount: result.modifiedCount
    })
  } catch (error) {
    next(error)
  }
}


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
        // Conversation with participants (direct or group)
        const senderId = result.senderId?.toString() || userId?.toString()
        for (const participant of result.participants) {
          const participantId = participant.userId.toString()

          io.to(participantId).emit('conversation:updated', {
            conversationId: result.conversationId,
            lastMessage: result.content || '[Attachment]',
            lastMessageAt: result.createdAt
          })

          if (participantId === senderId) continue

          const receiverRole = participant.role || (result.senderRole === 'doctor' ? 'patient' : 'doctor')
          await createChatNotification(participantId, receiverRole, result, io)
        }
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

        // Create notification for receiver
        const receiverRole = result.senderRole === 'doctor' ? 'patient' : 'doctor'
        await createChatNotification(result.receiverId, receiverRole, result, io)
      } else {
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

// Helper function to create chat notification
const createChatNotification = async (receiverId, receiverRole, messageResult, io) => {
  try {
    // Fetch sender's name from database
    const { userModel } = await import('~/models')
    const sender = await userModel.findOneById(messageResult.senderId)
    const senderName = sender?.displayName || sender?.userName || (messageResult.senderRole === 'doctor' ? 'B??c s??' : 'B???nh nh??n')
    const truncatedContent = messageResult.content.length > 100
      ? messageResult.content.substring(0, 100) + '…'
      : messageResult.content

    const notificationData = {
      userId: receiverId,
      type: 'chat',
      title: `Tin nhắn mới từ ${senderName}`,
      description: truncatedContent,
      role: receiverRole, // Only show to the recipient's role
      deepLink: {
        pathname: '/chat',
        query: {
          conversationId: messageResult.conversationId.toString()
        }
      },
      meta: {
        conversationId: messageResult.conversationId.toString(),
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

    logger.info(`[Notification] Created chat notification for user ${receiverId} from ${senderName}`)
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


    }

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Successfully left group'
    })
  } catch (error) {
    next(error)
  }
}

// Mark messages as seen
const markMessagesAsSeen = async (req, res, next) => {
  try {
    const userId = req.session.user.userId
    const { conversationId } = req.params

    if (!conversationId) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Conversation ID is required')
    }

    // Mark messages as seen and get updated messages
    const updatedMessages = await chatService.markMessagesAsSeen(conversationId, userId)

    // Emit socket event to notify senders
    if (req.app.get('io') && updatedMessages.length > 0) {
      const io = req.app.get('io')

      // Group messages by sender to emit once per sender
      const bySender = {}
      updatedMessages.forEach(msg => {
        if (!bySender[msg.senderId]) {
          bySender[msg.senderId] = []
        }
        bySender[msg.senderId].push(msg.messageId)
      })

      // Emit to conversation room (all participants will receive it)
      // Frontend will filter to only update messages from the correct sender
      const payload = {
        conversationId,
        updates: Object.keys(bySender).map(senderId => ({
          senderId,
          messageIds: bySender[senderId],
          status: 'seen'
        })),
        seenBy: userId
      }

      io.to(conversationId).emit('message:status_update', payload)
    }


    res.status(StatusCodes.OK).json({
      message: 'Messages marked as seen',
      data: { count: updatedMessages.length }
    })
  } catch (error) {
    console.error('[chatController] Error in markMessagesAsSeen:', error)
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
  leaveGroup,
  markMessagesAsSeen,
  migrateMessageStatus
}
