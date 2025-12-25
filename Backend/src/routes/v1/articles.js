import express from 'express'
import { articleController } from '~/controllers/articleController.js'
import { isAdmin, cacheMiddleware, invalidateCacheMiddleware, cacheKeys } from '~/middlewares'

const Router = express.Router()

// Public routes - anyone can view articles
Router.route('/')
  .get(cacheMiddleware(600, cacheKeys.articles.list), articleController.getAllArticles)
  .post(isAdmin, invalidateCacheMiddleware(cacheKeys.articles.all), articleController.createNew)

Router.route('/:id')
  .get(cacheMiddleware(600, cacheKeys.articles.detail), articleController.getArticleById)
  .put(isAdmin, invalidateCacheMiddleware(cacheKeys.articles.all), articleController.updateArticle)
  .delete(isAdmin, invalidateCacheMiddleware(cacheKeys.articles.all), articleController.deleteArticle)

export const articleRoute = Router
