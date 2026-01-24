import express from 'express'
import { notificationController } from '~/controllers'
import { isAuthenticated } from '~/middlewares'

const Router = express.Router()

// All routes require authentication
Router.use(isAuthenticated)

// Get my notifications
Router.get('/', notificationController.getMyNotifications)

// Get unread count
Router.get('/unread-count', notificationController.getUnreadCount)

// Mark notification as read
Router.put('/:id/read', notificationController.markAsRead)

// Mark all notifications as read
Router.put('/read-all', notificationController.markAllAsRead)

// Delete notification
Router.delete('/:id', notificationController.deleteNotification)

export const notificationRoute = Router
