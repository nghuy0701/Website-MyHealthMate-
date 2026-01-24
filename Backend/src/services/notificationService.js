import { notificationModel } from '~/models'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

const createNotification = async (notificationData) => {
  try {
    const result = await notificationModel.createNew(notificationData)
    const newNotification = await notificationModel.findByUserId(notificationData.userId, 1)
    return newNotification[0]
  } catch (error) {
    throw error
  }
}

const getMyNotifications = async (userId) => {
  try {
    const notifications = await notificationModel.findByUserId(userId, 50)
    return notifications
  } catch (error) {
    throw error
  }
}

const getUnreadCount = async (userId) => {
  try {
    const count = await notificationModel.countUnreadByUserId(userId)
    return { count }
  } catch (error) {
    throw error
  }
}

const markNotificationAsRead = async (notificationId, userId) => {
  try {
    const result = await notificationModel.markAsRead(notificationId, userId)
    if (result.matchedCount === 0) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Notification not found')
    }
    return { success: true }
  } catch (error) {
    throw error
  }
}

const markAllNotificationsAsRead = async (userId) => {
  try {
    await notificationModel.markAllAsRead(userId)
    return { success: true }
  } catch (error) {
    throw error
  }
}

const deleteNotification = async (notificationId, userId) => {
  try {
    const result = await notificationModel.deleteNotification(notificationId, userId)
    if (result.matchedCount === 0) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Notification not found')
    }
    return { success: true }
  } catch (error) {
    throw error
  }
}

export const notificationService = {
  createNotification,
  getMyNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification
}
