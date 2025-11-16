import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'

// Validation Rules
const EMAIL_RULE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const EMAIL_RULE_MESSAGE = 'Email must be a valid email address'
const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&#]{8,}$/
const PASSWORD_RULE_MESSAGE = 'Password must be at least 8 characters with uppercase, lowercase and number'
const ADMIN_NAME_RULE = /^[a-zA-Z0-9_]{3,20}$/
const ADMIN_NAME_RULE_MESSAGE = 'Admin name must be 3-20 characters, alphanumeric and underscore only'

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
    adminName: Joi.string()
      .required()
      .pattern(ADMIN_NAME_RULE)
      .messages({
        'string.pattern.base': ADMIN_NAME_RULE_MESSAGE
      }),
    displayName: Joi.string().optional().allow(null).max(255),
    avatar: Joi.string().optional().allow(null).max(1024),
    secretKey: Joi.string().required().min(1).messages({
      'any.required': 'Secret key is required',
      'string.empty': 'Secret key cannot be empty'
    })
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
      .pattern(EMAIL_RULE)
      .messages({
        'string.pattern.base': EMAIL_RULE_MESSAGE
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
    avatar: Joi.string().optional().allow(null).max(1024),
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

export const adminValidation = {
  createNew,
  login,
  update
}
