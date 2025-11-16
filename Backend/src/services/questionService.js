import questionModel from '~/models/questionModel.js'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'

// Create New Question
const createNew = async (data) => {
  try {
    const newQuestion = {
      questionId: data.questionId,
      text: data.text,
      type: data.type,
      placeholder: data.placeholder,
      options: data.options || null,
      min: data.min || null,
      max: data.max || null,
      step: data.step || null,
      unit: data.unit || null,
      hint: data.hint || null,
      tooltip: data.tooltip || null,
      order: data.order || 0
    }

    const createdQuestion = await questionModel.createNew(newQuestion)
    const question = await questionModel.findOneById(createdQuestion.insertedId.toString())

    if (!question) {
      throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Không thể tạo câu hỏi')
    }

    return question
  } catch (error) {
    throw error
  }
}

// Get All Questions
const getAllQuestions = async () => {
  try {
    const questions = await questionModel.findAll()
    return questions
  } catch (error) {
    throw error
  }
}

// Get Question by ID
const getById = async (questionId) => {
  try {
    const question = await questionModel.findOneById(questionId)
    if (!question) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Câu hỏi không tồn tại')
    }
    return question
  } catch (error) {
    throw error
  }
}

// Update Question
const updateQuestion = async (questionId, data) => {
  try {
    const question = await questionModel.findOneById(questionId)
    if (!question) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Câu hỏi không tồn tại')
    }

    const updatedQuestion = await questionModel.update(questionId, data)
    return updatedQuestion
  } catch (error) {
    throw error
  }
}

// Delete Question
const deleteQuestion = async (questionId) => {
  try {
    const question = await questionModel.findOneById(questionId)
    if (!question) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Câu hỏi không tồn tại')
    }
    await questionModel.deleteQuestion(questionId)
  } catch (error) {
    throw error
  }
}

const questionService = {
  createNew,
  getAllQuestions,
  getById,
  updateQuestion,
  deleteQuestion
}

export default questionService
