import { StatusCodes } from 'http-status-codes'
import { ObjectId } from 'mongodb'
import { 
  patientDoctorModel, 
  conversationModel, 
  messageModel,
  userModel,
  patientModel
} from '~/models'
import ApiError from '~/utils/ApiError'

/**
 * Chat Service - Business logic for medical consultation chat
 * Implements inbox-style consultation model
 */

// Patient sends message (creates conversation if first message)
const sendMessageAsPatient = async (patientId, content, attachments = []) => {
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

    // 2. Find or create direct conversation
    let conversation = await conversationModel.findByPatientAndDoctor(patientId, doctorId)
    
    if (!conversation) {
      // Create new direct conversation (first message)
      const newConv = await conversationModel.createNew({
        type: 'direct',
        patientId,
        doctorId,
        lastMessage: content || '[Attachment]'
      })
      conversation = {
        _id: newConv.insertedId,
        patientId: new ObjectId(patientId),
        doctorId: new ObjectId(doctorId),
        type: 'direct'
      }
    }

    // 3. Save message
    const messageData = {
      conversationId: conversation._id.toString(),
      senderId: patientId,
      senderRole: 'patient',
      content,
      attachments,
      read: false
    }
    const savedMessage = await messageModel.createNew(messageData)

    // 4. Update conversation's last message
    await conversationModel.updateLastMessage(
      conversation._id.toString(),
      content || (attachments.length > 0 ? '[Attachment]' : '')
    )

    // 5. Return message with metadata
    return {
      messageId: savedMessage.insertedId,
      conversationId: conversation._id,
      content,
      attachments,
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
const sendMessageAsDoctor = async (doctorId, conversationId, content, attachments = []) => {
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
      attachments,
      read: false
    }
    const savedMessage = await messageModel.createNew(messageData)

    // 3. Update conversation's last message
    await conversationModel.updateLastMessage(
      conversationId,
      content || (attachments.length > 0 ? '[Attachment]' : '')
    )

    // 4. Return message with metadata
    const patientId = conversation.patientId.toString()
    return {
      messageId: savedMessage.insertedId,
      conversationId: new ObjectId(conversationId),
      content,
      attachments,
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
    console.log('[chatService] getDoctorInbox called for doctorId:', doctorId)
    
    // Get all conversations for this doctor (direct and group)
    const conversations = await conversationModel.findByDoctorId(doctorId)
    console.log('[chatService] Raw conversations from DB:', conversations.length)

    // Enrich with patient data and unread count
    const inbox = await Promise.all(
      conversations.map(async (conv) => {
        const convId = conv._id.toString()
        
        // Count unread messages
        const unreadCount = await messageModel.countUnreadMessages(convId, doctorId)

        // Default to 'direct' if type is missing (backward compatibility)
        const convType = conv.type || 'direct'

        if (convType === 'direct') {
          // Direct chat - get patient info
          const patientId = conv.patientId.toString()
          const patient = await userModel.findOneById(patientId)
          
          return {
            conversationId: conv._id,
            type: 'direct',
            patientId: conv.patientId,
            patientName: patient?.displayName || patient?.userName || 'Unknown',
            patientAvatar: patient?.avatar || null,
            lastMessage: conv.lastMessage,
            lastMessageAt: conv.lastMessageAt,
            unreadCount,
            updatedAt: conv.updatedAt
          }
        } else if (convType === 'group') {
          // Group chat - get ALL participant info (doctor + patients)
          const participantInfos = await Promise.all(
            conv.participants.map(async (p) => {
              const user = await userModel.findOneById(p.userId.toString())
              return {
                userId: p.userId.toString(),
                role: p.role,
                name: user?.displayName || user?.userName || 'Unknown',
                avatar: user?.avatar || null
              }
            })
          )

          return {
            conversationId: conv._id,
            type: 'group',
            groupName: conv.groupName,
            participants: participantInfos,
            participantCount: conv.participants.length,
            lastMessage: conv.lastMessage,
            lastMessageAt: conv.lastMessageAt,
            unreadCount,
            updatedAt: conv.updatedAt
          }
        }
        
        // Fallback for unknown types
        return null
      })
    )

    // Filter out null values
    const filteredInbox = inbox.filter(item => item !== null)
    console.log('[chatService] getDoctorInbox returning:', filteredInbox.length, 'conversations')
    return filteredInbox
  } catch (error) {
    console.error('[chatService] getDoctorInbox error:', error)
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
        
        // Get sender name - check patient collection if senderRole is 'patient'
        let senderName = sender?.displayName || sender?.userName || 'Unknown'
        
        if (msg.senderRole === 'patient') {
          // Try to get from patient collection
          const patientData = await patientModel.findByUserId(msg.senderId.toString())
          if (patientData && patientData.length > 0 && patientData[0].fullName) {
            senderName = patientData[0].fullName
          }
        }
        
        return {
          id: msg._id,
          conversationId: msg.conversationId,
          senderId: msg.senderId,
          senderName: senderName,
          senderRole: msg.senderRole,
          content: msg.content,
          attachments: msg.attachments || [], // Include attachments
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

// Get patient's conversations (direct with doctor + groups)
const getPatientConversation = async (patientId) => {
  try {
    console.log('[chatService] getPatientConversation called for patientId:', patientId)
    
    // Get all conversations for this patient (direct and group)
    const conversations = await conversationModel.findByPatientId(patientId)
    console.log('[chatService] Found conversations:', conversations.length)
    
    // Find assigned doctor for direct chat creation
    const mapping = await patientDoctorModel.findDoctorByPatientId(patientId)
    console.log('[chatService] Doctor mapping:', mapping ? 'Found' : 'Not found')
    
    // Enrich conversations
    const enrichedConversations = await Promise.all(
      conversations.map(async (conv) => {
        const convId = conv._id.toString()
        const convType = conv.type || 'direct'
        
        // Count unread messages
        const unreadCount = await messageModel.countUnreadMessages(convId, patientId)
        
        if (convType === 'direct') {
          // Direct conversation with doctor
          const doctorId = conv.doctorId.toString()
          const doctor = await userModel.findOneById(doctorId)
          
          return {
            conversationId: conv._id,
            type: 'direct',
            doctorId: conv.doctorId,
            doctorName: doctor?.displayName || doctor?.userName || 'Doctor',
            doctorAvatar: doctor?.avatar || null,
            doctorSpecialty: doctor?.specialty || 'General',
            lastMessage: conv.lastMessage,
            lastMessageAt: conv.lastMessageAt,
            unreadCount,
            hasConversation: true
          }
        } else if (convType === 'group') {
          // Group conversation - get ALL participant info
          const participantInfos = await Promise.all(
            conv.participants.map(async (p) => {
              const user = await userModel.findOneById(p.userId.toString())
              return {
                userId: p.userId.toString(),
                role: p.role,
                name: user?.displayName || user?.userName || 'Unknown',
                avatar: user?.avatar || null
              }
            })
          )
          
          return {
            conversationId: conv._id,
            type: 'group',
            groupName: conv.groupName,
            participants: participantInfos,
            participantCount: conv.participants.length,
            lastMessage: conv.lastMessage,
            lastMessageAt: conv.lastMessageAt,
            unreadCount,
            hasConversation: true
          }
        }
        
        // Fallback for unknown types
        return null
      })
    )
    
    // Filter out null values
    const validConversations = enrichedConversations.filter(c => c !== null)
    console.log('[chatService] Valid conversations after filter:', validConversations.length)
    
    // If patient has assigned doctor but no direct conversation yet, add placeholder
    if (mapping && !validConversations.some(c => c && c.type === 'direct')) {
      const doctorId = mapping.doctorId.toString()
      const doctor = await userModel.findOneById(doctorId)
      console.log('[chatService] Adding placeholder for assigned doctor:', doctorId)
      validConversations.unshift({
        conversationId: null,
        type: 'direct',
        doctorId: mapping.doctorId,
        doctorName: doctor?.displayName || doctor?.userName || 'Doctor',
        doctorAvatar: doctor?.avatar || null,
        doctorSpecialty: doctor?.specialty || 'General',
        hasConversation: false
      })
    }
    
    console.log('[chatService] Returning conversations:', validConversations.length)
    return validConversations
  } catch (error) {
    throw error
  }
}

// Create group conversation (doctor only)
const createGroupConversation = async (doctorId, groupName, patientIds) => {
  try {
    console.log('[chatService] Creating group:', { doctorId, groupName, patientIds })
    
    // Validate patients exist and are assigned to doctor
    for (const patientId of patientIds) {
      const mapping = await patientDoctorModel.findDoctorByPatientId(patientId)
      if (!mapping || mapping.doctorId.toString() !== doctorId) {
        console.error('[chatService] Patient not assigned:', patientId)
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          `Patient ${patientId} is not assigned to you`
        )
      }
    }

    // Build participants array
    const participants = [
      { userId: doctorId, role: 'doctor' },
      ...patientIds.map(id => ({ userId: id, role: 'patient' }))
    ]
    
    console.log('[chatService] Participants:', participants)

    // Create group conversation
    const result = await conversationModel.createNew({
      type: 'group',
      groupName,
      participants,
      createdBy: doctorId,
      lastMessage: 'Group created'
    })
    
    console.log('[chatService] Group created with ID:', result.insertedId)

    return {
      conversationId: result.insertedId,
      groupName,
      participants,
      type: 'group'
    }
  } catch (error) {
    throw error
  }
}

// Send message to group or direct conversation
const sendMessage = async (userId, userRole, conversationId, content, attachments = []) => {
  try {
    // 1. Verify conversation exists and user is member
    const conversation = await conversationModel.findOneById(conversationId)
    if (!conversation) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Conversation not found')
    }

    const isMember = await conversationModel.belongsToConversation(conversationId, userId)
    if (!isMember) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        'You are not a member of this conversation'
      )
    }

    // 2. Save message
    const messageData = {
      conversationId,
      senderId: userId,
      senderRole: userRole === 'member' ? 'patient' : userRole,
      content,
      attachments,
      read: false
    }
    const savedMessage = await messageModel.createNew(messageData)

    // 3. Update conversation's last message
    await conversationModel.updateLastMessage(
      conversationId,
      content || (attachments.length > 0 ? '[Attachment]' : '')
    )

    // 4. Get all participants for socket broadcast
    const participants = await conversationModel.getParticipants(conversationId)

    // 5. Get sender name for display
    const sender = await userModel.findOneById(userId)
    let senderName = sender?.displayName || sender?.userName || 'Unknown'
    
    // If sender is a patient, get full name from patient collection
    if (messageData.senderRole === 'patient') {
      const patientData = await patientModel.findByUserId(userId)
      if (patientData && patientData.length > 0 && patientData[0].fullName) {
        senderName = patientData[0].fullName
      }
    }

    return {
      messageId: savedMessage.insertedId,
      conversationId: new ObjectId(conversationId),
      content,
      attachments,
      senderId: userId,
      senderName: senderName,
      senderRole: messageData.senderRole,
      participants, // For socket broadcasting
      createdAt: Date.now()
    }
  } catch (error) {
    throw error
  }
}

// Leave group conversation
const leaveGroup = async (userId, conversationId) => {
  try {
    const conversation = await conversationModel.findOneById(conversationId)
    
    if (!conversation) {
      throw new Error('Conversation not found')
    }
    
    if (conversation.type !== 'group') {
      throw new Error('Can only leave group conversations')
    }
    
    // Remove user from participants
    const updatedConversation = await conversationModel.removeParticipant(
      conversationId,
      userId
    )
    
    if (!updatedConversation) {
      throw new Error('Failed to leave group')
    }
    
    console.log(`[chatService] User ${userId} left group ${conversationId}`)
    
    return {
      success: true,
      conversationId
    }
  } catch (error) {
    throw error
  }
}

export const chatService = {
  sendMessageAsPatient,
  sendMessageAsDoctor,
  createGroupConversation,
  sendMessage,
  getDoctorInbox,
  getMessages,
  getPatientConversation,
  leaveGroup
}
