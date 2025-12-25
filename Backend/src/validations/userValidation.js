import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'

// Validation Rules
const EMAIL_RULE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const EMAIL_RULE_MESSAGE = 'Email must be a valid email address'
const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&#]{8,}$/
const PASSWORD_RULE_MESSAGE = 'Password must be at least 8 characters with uppercase, lowercase and number'
const USERNAME_RULE = /^[a-zA-Z0-9_]{3,20}$/
const USERNAME_RULE_MESSAGE = 'Username must be 3-20 characters, alphanumeric and underscore only'

const createNew = async (req, res, next) => {
  const correctCondition = Joi.object({
    email: Joi.string()
      .required()
      .pattern(EMAIL_RULE)
      .messages({
        'string.pattern.base': EMAIL_RULE_MESSAGE
      }),
    password: Joi.string()
      .required()
      .pattern(PASSWORD_RULE)
      .messages({
        'string.pattern.base': PASSWORD_RULE_MESSAGE
      }),
    userName: Joi.string()
      .required()
      .pattern(USERNAME_RULE)
      .messages({
        'string.pattern.base': USERNAME_RULE_MESSAGE
      }),
    displayName: Joi.string().optional().allow(null).max(255),
    phone: Joi.string().optional().allow(null).max(20),
    gender: Joi.string().optional().allow(null).valid('male', 'female', 'other'),
    dob: Joi.date().optional().allow(null),
    avatar: Joi.string().optional().allow(null).max(1024)
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

const login = async (req, res, next) => {
  const correctCondition = Joi.object({
    email: Joi.string()
      .required()
      .min(3)
      .max(255)
      .messages({
        'string.min': 'Email/Username must be at least 3 characters',
        'string.max': 'Email/Username must not exceed 255 characters'
      }),
    password: Joi.string().required().min(8).max(50)
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
    displayName: Joi.string().optional().max(255),
    name: Joi.string().optional().max(255),
    age: Joi.alternatives().try(
      Joi.number().integer().min(0).max(150),
      Joi.string().allow('').max(10)
    ).optional().allow(null),
    phone: Joi.string().optional().allow(null).max(20),
    gender: Joi.string().optional().allow(null).valid('male', 'female', 'other', 'Nam', 'Nữ', 'Khác'),
    dob: Joi.date().optional().allow(null),
    avatar: Joi.string().optional().allow(null).max(1024),
    avatarPublicId: Joi.string().optional().allow(null).max(255),
    password: Joi.string()
      .optional()
      .pattern(PASSWORD_RULE)
      .messages({
        'string.pattern.base': PASSWORD_RULE_MESSAGE
      })
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

export const userValidation = {
  createNew,
  login,
  update
}
