import express from 'express'
import { questionController } from '~/controllers/questionController.js'
import { isAdmin, cacheMiddleware, invalidateCacheMiddleware, cacheKeys } from '~/middlewares'

const Router = express.Router()

// Public routes - anyone can view questions
Router.route('/')
  .get(cacheMiddleware(3600, cacheKeys.questions.list), questionController.getAllQuestions)
  .post(isAdmin, invalidateCacheMiddleware(cacheKeys.questions.all), questionController.createNew)

Router.route('/:id')
  .get(questionController.getQuestionById)
  .put(isAdmin, invalidateCacheMiddleware(cacheKeys.questions.all), questionController.updateQuestion)
  .delete(isAdmin, invalidateCacheMiddleware(cacheKeys.questions.all), questionController.deleteQuestion)

export const questionRoute = Router
