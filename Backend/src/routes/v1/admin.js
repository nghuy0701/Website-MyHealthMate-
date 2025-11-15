import express from 'express'
import { adminController } from '~/controllers'
import { adminValidation } from '~/validations'
import { isAuthenticated, isAdmin } from '~/middlewares'

const Router = express.Router()

// Public routes
Router.route('/register')
  .post(adminValidation.createNew, adminController.createNew)

Router.route('/login')
  .post(adminValidation.login, adminController.login)

// Protected routes (Admin only)
Router.route('/logout')
  .post(isAuthenticated, adminController.logout)

Router.route('/')
  .get(isAdmin, adminController.getAllAdmins)

Router.route('/:id')
  .get(isAdmin, adminController.getAdminById)
  .put(isAdmin, adminValidation.update, adminController.updateAdmin)
  .delete(isAdmin, adminController.deleteAdmin)

export const adminRoute = Router
