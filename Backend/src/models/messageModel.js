import { GET_DB } from '~/configs/mongodb'
import { ObjectId } from 'mongodb'

const COLLECTION_NAME = 'messages'

/**
 * Message Model - Stores individual chat messages
 */

// Create new message
const createNew = async (data) => {
  try {
    const newMessage = {
      conversationId: new ObjectId(data.conversationId),
      senderId: new ObjectId(data.senderId),
      senderRole: data.senderRole, // 'patient' or 'doctor'
      content: data.content,
      attachments: data.attachments || [], // Array of { type, url, filename, mimeType, size }
      read: data.read || false,
      createdAt: Date.now(),
      _destroy: false
    }
    const result = await GET_DB()
      .collection(COLLECTION_NAME)
      .insertOne(newMessage)
    return result
  } catch (error) {
    throw new Error(error)
  }
}

// Get all messages in a conversation
const findByConversationId = async (conversationId) => {
  try {
    const results = await GET_DB()
      .collection(COLLECTION_NAME)
      .find({
        conversationId: new ObjectId(conversationId),
        _destroy: false
      })
      .sort({ createdAt: 1 })
      .toArray()
    return results
  } catch (error) {
    throw new Error(error)
  }
}

// Count unread messages for a user in a conversation
const countUnreadMessages = async (conversationId, userId) => {
  try {
    const count = await GET_DB()
      .collection(COLLECTION_NAME)
      .countDocuments({
        conversationId: new ObjectId(conversationId),
        senderId: { $ne: new ObjectId(userId) },
        read: false,
        _destroy: false
      })
    return count
  } catch (error) {
    throw new Error(error)
  }
}

// Mark messages as read
const markAsRead = async (conversationId, userId) => {
  try {
    const result = await GET_DB()
      .collection(COLLECTION_NAME)
      .updateMany(
        {
          conversationId: new ObjectId(conversationId),
          senderId: { $ne: new ObjectId(userId) },
          read: false,
          _destroy: false
        },
        {
          $set: { read: true }
        }
      )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

// Get last message in conversation
const getLastMessage = async (conversationId) => {
  try {
    const result = await GET_DB()
      .collection(COLLECTION_NAME)
      .find({
        conversationId: new ObjectId(conversationId),
        _destroy: false
      })
      .sort({ createdAt: -1 })
      .limit(1)
      .toArray()
    return result[0] || null
  } catch (error) {
    throw new Error(error)
  }
}

export const messageModel = {
  createNew,
  findByConversationId,
  countUnreadMessages,
  markAsRead,
  getLastMessage
}
