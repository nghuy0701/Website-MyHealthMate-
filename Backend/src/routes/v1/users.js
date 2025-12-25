import express from 'express'
import { userController } from '~/controllers'
import { userValidation } from '~/validations'
import { isAuthenticated, isAdmin, uploadMiddleware, loginLimiter, registerLimiter, uploadLimiter, cacheMiddleware, invalidateCacheMiddleware, cacheKeys } from '~/middlewares'

const Router = express.Router()

// Public routes
Router.route('/register')
  .post(registerLimiter, userValidation.createNew, userController.createNew)

Router.route('/login')
  .post(loginLimiter, userValidation.login, userController.login)

// Protected routes
Router.route('/logout')
  .post(isAuthenticated, userController.logout)

Router.route('/me')
  .get(isAuthenticated, cacheMiddleware(300, cacheKeys.users.detail), userController.getCurrentUser)
  .put(isAuthenticated, userValidation.update, invalidateCacheMiddleware(cacheKeys.users.all), userController.updateMe)

Router.route('/me/avatar')
  .post(
    isAuthenticated,
    uploadLimiter,
    uploadMiddleware.single('avatar'),
    invalidateCacheMiddleware(cacheKeys.users.all),
    userController.uploadAvatar
  )

Router.route('/me/change-password')
  .put(isAuthenticated, userController.changePassword)

Router.route('/:id')
  .get(isAdmin, userController.getUserById)
  .put(isAuthenticated, userValidation.update, userController.updateUser)
  .delete(isAdmin, userController.deleteUser)

// Admin only routes
Router.route('/')
  .get(isAdmin, userController.getAllUsers)

export const userRoute = Router
