import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'

const createNew = async (req, res, next) => {
  const correctCondition = Joi.object({
    fullName: Joi.string().required().min(3).max(100),
    email: Joi.string().email().optional().allow(null),
    phone: Joi.string().optional().allow(null).max(20),
    gender: Joi.string().valid('male', 'female', 'other').optional().allow(null),
    dob: Joi.date().optional().allow(null),
    address: Joi.string().optional().allow(null).max(500),
    medicalHistory: Joi.string().optional().allow(null),
    notes: Joi.string().optional().allow(null)
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
    fullName: Joi.string().optional().min(3).max(100),
    email: Joi.string().email().optional().allow(null),
    phone: Joi.string().optional().allow(null).max(20),
    gender: Joi.string().valid('male', 'female', 'other').optional().allow(null),
    dob: Joi.date().optional().allow(null),
    address: Joi.string().optional().allow(null).max(500),
    medicalHistory: Joi.string().optional().allow(null),
    notes: Joi.string().optional().allow(null)
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

export const patientValidation = {
  createNew,
  update
}
