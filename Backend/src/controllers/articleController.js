import { StatusCodes } from 'http-status-codes'
import articleService from '~/services/articleService.js'
import ApiError from '~/utils/ApiError'

// Create New Article
const createNew = async (req, res, next) => {
  try {
    const createdArticle = await articleService.createNew(req.body)
    res.status(StatusCodes.CREATED).json({
      message: 'Tạo bài viết thành công',
      data: createdArticle
    })
  } catch (error) {
    next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message))
  }
}

// Get All Articles
const getAllArticles = async (req, res, next) => {
  try {
    const articles = await articleService.getAllArticles()
    res.status(StatusCodes.OK).json({
      message: 'Lấy danh sách bài viết thành công',
      data: articles
    })
  } catch (error) {
    next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message))
  }
}

// Get Article by ID
const getArticleById = async (req, res, next) => {
  try {
    const articleId = req.params.id
    const article = await articleService.getById(articleId)

    res.status(StatusCodes.OK).json({
      message: 'Lấy bài viết thành công',
      data: article
    })
  } catch (error) {
    next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message))
  }
}

// Update Article
const updateArticle = async (req, res, next) => {
  try {
    const articleId = req.params.id
    const updatedArticle = await articleService.updateArticle(articleId, req.body)
    res.status(StatusCodes.OK).json({
      message: 'Cập nhật bài viết thành công',
      data: updatedArticle
    })
  } catch (error) {
    next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message))
  }
}

// Delete Article
const deleteArticle = async (req, res, next) => {
  try {
    const articleId = req.params.id
    await articleService.deleteArticle(articleId)
    res.status(StatusCodes.OK).json({
      message: 'Xóa bài viết thành công'
    })
  } catch (error) {
    next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message))
  }
}

export const articleController = {
  createNew,
  getAllArticles,
  getArticleById,
  updateArticle,
  deleteArticle
}
