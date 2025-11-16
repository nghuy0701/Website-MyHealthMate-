import express from 'express'
import { adminController } from '~/controllers'
import { adminValidation } from '~/validations'
import { isAuthenticated, isAdmin, uploadMiddleware } from '~/middlewares'

const Router = express.Router()

// Public routes
Router.route('/register')
  .post(adminValidation.createNew, adminController.createNew)

Router.route('/login')
  .post(adminValidation.login, adminController.login)

Router.route('/verify-email/:token')
  .get(adminController.verifyEmail)

// Protected routes (Admin only)
Router.route('/logout')
  .post(isAuthenticated, adminController.logout)

// Upload avatar
Router.route('/me/avatar')
  .post(isAuthenticated, uploadMiddleware.single('avatar'), adminController.uploadAvatar)

Router.route('/')
  .get(isAdmin, adminController.getAllAdmins)

Router.route('/:id')
  .get(isAdmin, adminController.getAdminById)
  .put(isAdmin, adminValidation.update, adminController.updateAdmin)
  .delete(isAdmin, adminController.deleteAdmin)

export const adminRoute = Router
