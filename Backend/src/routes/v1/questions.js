import express from 'express'
import { questionController } from '~/controllers/questionController.js'
import { isAdmin } from '~/middlewares'

const Router = express.Router()

// Public routes - anyone can view questions
Router.route('/')
  .get(questionController.getAllQuestions)
  .post(isAdmin, questionController.createNew)

Router.route('/:id')
  .get(questionController.getQuestionById)
  .put(isAdmin, questionController.updateQuestion)
  .delete(isAdmin, questionController.deleteQuestion)

export const questionRoute = Router
