import express from 'express'
import { uploadController } from '~/controllers/uploadController'
import { isAuthenticated } from '~/middlewares/authMiddleware'
import { uploadMiddleware } from '~/middlewares/uploadMiddleware'

const Router = express.Router()

// All upload routes require authentication
Router.use(isAuthenticated)

// POST /api/v1/uploads - Upload single file
Router.post('/', uploadMiddleware.single('file'), uploadController.uploadFile)

export const uploadRoute = Router
