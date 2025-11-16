import express from 'express'
import { articleController } from '~/controllers/articleController.js'
import { isAdmin } from '~/middlewares'

const Router = express.Router()

// Public routes - anyone can view articles
Router.route('/')
  .get(articleController.getAllArticles)
  .post(isAdmin, articleController.createNew)

Router.route('/:id')
  .get(articleController.getArticleById)
  .put(isAdmin, articleController.updateArticle)
  .delete(isAdmin, articleController.deleteArticle)

export const articleRoute = Router
