import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'

const createNew = async (req, res, next) => {
  const correctCondition = Joi.object({
    patientId: Joi.string().optional().allow(null),
    patientName: Joi.string().optional().allow(null, '').max(200),
    patientEmail: Joi.string().email().optional().allow(null, ''),
    gender: Joi.string().optional().allow(null).valid('male', 'female', 'other'),
    pregnancies: Joi.number().integer().min(0).max(20).required(),
    glucose: Joi.number().min(0).max(300).required(),
    bloodPressure: Joi.number().min(0).max(200).required(),
    skinThickness: Joi.number().min(0).max(100).required(),
    insulin: Joi.number().min(0).max(900).required(),
    bmi: Joi.number().min(0).max(70).required(),
    diabetesPedigreeFunction: Joi.number().min(0).max(3).required(),
    age: Joi.number().integer().min(0).max(120).required(),
    notes: Joi.string().optional().allow(null, '').max(2000)
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

const update = async (req, res, next) => {
  const correctCondition = Joi.object({
    gender: Joi.string().optional().allow(null).valid('male', 'female', 'other'),
    pregnancies: Joi.number().integer().min(0).max(20).optional(),
    glucose: Joi.number().min(0).max(300).optional(),
    bloodPressure: Joi.number().min(0).max(200).optional(),
    skinThickness: Joi.number().min(0).max(100).optional(),
    insulin: Joi.number().min(0).max(900).optional(),
    bmi: Joi.number().min(0).max(70).optional(),
    diabetesPedigreeFunction: Joi.number().min(0).max(3).optional(),
    age: Joi.number().integer().min(0).max(120).optional(),
    notes: Joi.string().optional().allow(null, '').max(2000)
  })

  try {
    await correctCondition.validateAsync(req.body, {
      abortEarly: false,
      allowUnknown: false
    })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

export const predictionValidation = {
  createNew,
  update
}
