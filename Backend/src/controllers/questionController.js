import { StatusCodes } from 'http-status-codes'
import questionService from '~/services/questionService.js'
import ApiError from '~/utils/ApiError'

// Create New Question
const createNew = async (req, res, next) => {
  try {
    const createdQuestion = await questionService.createNew(req.body)
    res.status(StatusCodes.CREATED).json({
      message: 'Tạo câu hỏi thành công',
      data: createdQuestion
    })
  } catch (error) {
    next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message))
  }
}

// Get All Questions
const getAllQuestions = async (req, res, next) => {
  try {
    const questions = await questionService.getAllQuestions()
    res.status(StatusCodes.OK).json({
      message: 'Lấy danh sách câu hỏi thành công',
      data: questions
    })
  } catch (error) {
    next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message))
  }
}

// Get Question by ID
const getQuestionById = async (req, res, next) => {
  try {
    const questionId = req.params.id
    const question = await questionService.getById(questionId)

    res.status(StatusCodes.OK).json({
      message: 'Lấy câu hỏi thành công',
      data: question
    })
  } catch (error) {
    next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message))
  }
}

// Update Question
const updateQuestion = async (req, res, next) => {
  try {
    const questionId = req.params.id
    const updatedQuestion = await questionService.updateQuestion(questionId, req.body)
    res.status(StatusCodes.OK).json({
      message: 'Cập nhật câu hỏi thành công',
      data: updatedQuestion
    })
  } catch (error) {
    next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message))
  }
}

// Delete Question
const deleteQuestion = async (req, res, next) => {
  try {
    const questionId = req.params.id
    await questionService.deleteQuestion(questionId)
    res.status(StatusCodes.OK).json({
      message: 'Xóa câu hỏi thành công'
    })
  } catch (error) {
    next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message))
  }
}

export const questionController = {
  createNew,
  getAllQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion
}
