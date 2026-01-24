import { StatusCodes } from 'http-status-codes'
import { notificationService } from '~/services/notificationService'
import ApiError from '~/utils/ApiError'

const getMyNotifications = async (req, res, next) => {
  try {
    const userId = req.session.user?.userId
    if (!userId) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'User not authenticated')
    }

    const notifications = await notificationService.getMyNotifications(userId)
    res.status(StatusCodes.OK).json({
      message: 'Get notifications successfully',
      data: notifications
    })
  } catch (error) {
    next(error)
  }
}

const getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.session.user?.userId
    if (!userId) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'User not authenticated')
    }

    const result = await notificationService.getUnreadCount(userId)
    res.status(StatusCodes.OK).json({
      message: 'Get unread count successfully',
      data: result
    })
  } catch (error) {
    next(error)
  }
}

const markAsRead = async (req, res, next) => {
  try {
    const userId = req.session.user?.userId
    if (!userId) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'User not authenticated')
    }

    const { id } = req.params
    await notificationService.markNotificationAsRead(id, userId)
    res.status(StatusCodes.OK).json({
      message: 'Notification marked as read',
      data: { success: true }
    })
  } catch (error) {
    next(error)
  }
}

const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.session.user?.userId
    if (!userId) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'User not authenticated')
    }

    await notificationService.markAllNotificationsAsRead(userId)
    res.status(StatusCodes.OK).json({
      message: 'All notifications marked as read',
      data: { success: true }
    })
  } catch (error) {
    next(error)
  }
}

const deleteNotification = async (req, res, next) => {
  try {
    const userId = req.session.user?.userId
    if (!userId) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'User not authenticated')
    }

    const { id } = req.params
    await notificationService.deleteNotification(id, userId)
    res.status(StatusCodes.OK).json({
      message: 'Notification deleted',
      data: { success: true }
    })
  } catch (error) {
    next(error)
  }
}

export const notificationController = {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification
}
