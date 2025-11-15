import express from 'express'
import { userController } from '~/controllers'
import { userValidation } from '~/validations'
import { isAuthenticated, isAdmin } from '~/middlewares'

const Router = express.Router()

// Public routes
Router.route('/register')
  .post(userValidation.createNew, userController.createNew)

Router.route('/login')
  .post(userValidation.login, userController.login)

// Protected routes
Router.route('/logout')
  .post(isAuthenticated, userController.logout)

Router.route('/me')
  .get(isAuthenticated, userController.getCurrentUser)

Router.route('/:id')
  .get(isAdmin, userController.getUserById)
  .put(isAuthenticated, userValidation.update, userController.updateUser)
  .delete(isAdmin, userController.deleteUser)

// Admin only routes
Router.route('/')
  .get(isAdmin, userController.getAllUsers)

export const userRoute = Router
