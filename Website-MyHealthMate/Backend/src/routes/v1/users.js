import express from 'express'
import * as controllers from '~/controllers'
import * as middlewares from '~/middlewares'

const router = express.Router()

// Public routes
router.post('/register', controllers.userController.createNew)
router.post('/login', controllers.userController.login)

// Protected routes
router.post('/logout', middlewares.isAuthenticated, controllers.userController.logout)
router.get('/me', middlewares.isAuthenticated, controllers.userController.getCurrentUser)
router.put('/:id', middlewares.isAuthenticated, controllers.userController.updateUser)

// Admin only routes
router.get('/', middlewares.isAdmin, controllers.userController.getAllUsers)
router.get('/:id', middlewares.isAdmin, controllers.userController.getUserById)
router.delete('/:id', middlewares.isAdmin, controllers.userController.deleteUser)

export const userRouter = router
