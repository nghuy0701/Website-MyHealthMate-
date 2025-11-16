import articleModel from '~/models/articleModel.js'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'

// Create New Article
const createNew = async (data) => {
  try {
    const newArticle = {
      code: data.code,
      title: data.title,
      description: data.description,
      image: data.image,
      category: data.category,
      content: data.content,
      featured: data.featured || false
    }

    const createdArticle = await articleModel.createNew(newArticle)
    const article = await articleModel.findOneById(createdArticle.insertedId.toString())

    if (!article) {
      throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Không thể tạo bài viết')
    }

    return article
  } catch (error) {
    throw error
  }
}

// Get All Articles
const getAllArticles = async () => {
  try {
    const articles = await articleModel.findAll()
    return articles
  } catch (error) {
    throw error
  }
}

// Get Article by ID
const getById = async (articleId) => {
  try {
    const article = await articleModel.findOneById(articleId)
    if (!article) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Bài viết không tồn tại')
    }
    return article
  } catch (error) {
    throw error
  }
}

// Update Article
const updateArticle = async (articleId, data) => {
  try {
    const article = await articleModel.findOneById(articleId)
    if (!article) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Bài viết không tồn tại')
    }

    const updatedArticle = await articleModel.update(articleId, data)
    return updatedArticle
  } catch (error) {
    throw error
  }
}

// Delete Article
const deleteArticle = async (articleId) => {
  try {
    const article = await articleModel.findOneById(articleId)
    if (!article) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Bài viết không tồn tại')
    }
    await articleModel.deleteArticle(articleId)
  } catch (error) {
    throw error
  }
}

const articleService = {
  createNew,
  getAllArticles,
  getById,
  updateArticle,
  deleteArticle
}

export default articleService
