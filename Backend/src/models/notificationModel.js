import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/configs/mongodb'

const COLLECTION_NAME = 'notifications'

const NOTIFICATION_TYPES = {
  CHAT: 'chat',
  PREDICTION: 'prediction',
  REMINDER: 'reminder',
  ALERT: 'alert',
  ARTICLE: 'article'
}

const USER_ROLES = {
  DOCTOR: 'doctor',
  PATIENT: 'patient'
}

const NOTIFICATION_COLLECTION_SCHEMA = Joi.object({
  userId: Joi.string().required(),
  type: Joi.string().valid(...Object.values(NOTIFICATION_TYPES)).required(),
  title: Joi.string().required().max(200),
  description: Joi.string().required().max(500),
  isRead: Joi.boolean().default(false),
  role: Joi.string().valid(...Object.values(USER_ROLES)).optional(), // Role-based visibility
  deepLink: Joi.object({
    pathname: Joi.string().required(),
    query: Joi.object().optional()
  }).optional(), // Deep linking info
  meta: Joi.object({
    conversationId: Joi.string(),
    senderId: Joi.string(),
    senderName: Joi.string(),
    predictionId: Joi.string(),
    articleId: Joi.string()
  }).optional(),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  _destroy: Joi.boolean().default(false)
})

const validateBeforeCreate = async (data) => {
  return await NOTIFICATION_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data)
    const newNotification = {
      ...validData,
      userId: new ObjectId(validData.userId),
      createdAt: Date.now()
    }
    
    // Convert meta IDs to ObjectId if present
    if (newNotification.meta) {
      if (newNotification.meta.conversationId) {
        newNotification.meta.conversationId = new ObjectId(newNotification.meta.conversationId)
      }
      if (newNotification.meta.senderId) {
        newNotification.meta.senderId = new ObjectId(newNotification.meta.senderId)
      }
      if (newNotification.meta.predictionId) {
        newNotification.meta.predictionId = new ObjectId(newNotification.meta.predictionId)
      }
      if (newNotification.meta.articleId) {
        newNotification.meta.articleId = new ObjectId(newNotification.meta.articleId)
      }
    }

    const result = await GET_DB().collection(COLLECTION_NAME).insertOne(newNotification)
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const findByUserId = async (userId, limit = 50) => {
  try {
    const notifications = await GET_DB()
      .collection(COLLECTION_NAME)
      .find({
        userId: new ObjectId(userId),
        _destroy: false
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray()
    
    return notifications
  } catch (error) {
    throw new Error(error)
  }
}

const countUnreadByUserId = async (userId) => {
  try {
    const count = await GET_DB()
      .collection(COLLECTION_NAME)
      .countDocuments({
        userId: new ObjectId(userId),
        isRead: false,
        _destroy: false
      })
    return count
  } catch (error) {
    throw new Error(error)
  }
}

const markAsRead = async (notificationId, userId) => {
  try {
    const result = await GET_DB()
      .collection(COLLECTION_NAME)
      .updateOne(
        {
          _id: new ObjectId(notificationId),
          userId: new ObjectId(userId),
          _destroy: false
        },
        {
          $set: { isRead: true }
        }
      )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const markAllAsRead = async (userId) => {
  try {
    const result = await GET_DB()
      .collection(COLLECTION_NAME)
      .updateMany(
        {
          userId: new ObjectId(userId),
          isRead: false,
          _destroy: false
        },
        {
          $set: { isRead: true }
        }
      )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const deleteNotification = async (notificationId, userId) => {
  try {
    const result = await GET_DB()
      .collection(COLLECTION_NAME)
      .updateOne(
        {
          _id: new ObjectId(notificationId),
          userId: new ObjectId(userId)
        },
        {
          $set: { _destroy: true }
        }
      )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

export const notificationModel = {
  COLLECTION_NAME,
  NOTIFICATION_TYPES,
  USER_ROLES,
  createNew,
  findByUserId,
  countUnreadByUserId,
  markAsRead,
  markAllAsRead,
  deleteNotification
}
