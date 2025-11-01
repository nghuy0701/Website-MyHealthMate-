import { GET_DB  } from '~/configs/mongodb'
import Joi from 'joi'
import { ObjectId  } from 'mongodb'

const COLLECTION_NAME = 'admin'

// Validation Rules
const EMAIL_RULE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const EMAIL_RULE_MESSAGE = 'Email must be a valid email address'
const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/
const PASSWORD_RULE_MESSAGE = 'Password must be at least 8 characters with uppercase, lowercase and number'
const ADMIN_NAME_RULE = /^[a-zA-Z0-9_]{3,20}$/
const ADMIN_NAME_RULE_MESSAGE = 'Admin name must be 3-20 characters, alphanumeric and underscore only'

const ADMIN_ROLES = {
  ADMIN: 'admin'
}

// Validation Schema (Match SQL structure from web.sql)
const ADMIN_COLLECTION_SCHEMA = Joi.object({
  email: Joi.string()
    .required()
    .pattern(EMAIL_RULE)
    .message(EMAIL_RULE_MESSAGE),
  password: Joi.string()
    .required()
    .pattern(PASSWORD_RULE)
    .message(PASSWORD_RULE_MESSAGE),
  adminName: Joi.string()
    .required()
    .pattern(ADMIN_NAME_RULE)
    .message(ADMIN_NAME_RULE_MESSAGE),
  displayName: Joi.string().optional().allow(null).max(255),
  role: Joi.string()
    .default(ADMIN_ROLES.ADMIN)
    .valid(ADMIN_ROLES.ADMIN),
  avatar: Joi.string().optional().allow(null).max(1024),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updateAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

// Invalid Update Fields
const INVALID_UPDATE_FIELDS = ['_id', 'email', 'adminName', 'createdAt']

// Create New Admin
const createNew = async (data) => {
  try {
    const validData = await ADMIN_COLLECTION_SCHEMA.validateAsync(data, {
      abortEarly: false
    })
    const createdAdmin = await GET_DB()
      .collection(COLLECTION_NAME)
      .insertOne(validData)
    return createdAdmin
  } catch (error) {
    throw new Error(error)
  }
}

// Find Admin by Email
const findOneByEmail = async (email) => {
  try {
    const result = await GET_DB()
      .collection(COLLECTION_NAME)
      .findOne({ email: email, _destroy: false })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

// Find Admin by AdminName
const findOneByAdminName = async (adminName) => {
  try {
    const result = await GET_DB()
      .collection(COLLECTION_NAME)
      .findOne({ adminName: adminName, _destroy: false })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

// Find Admin by ID
const findOneById = async (id) => {
  try {
    const result = await GET_DB()
      .collection(COLLECTION_NAME)
      .findOne({ _id: new ObjectId(id), _destroy: false })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

// Update Admin
const update = async (id, data) => {
  try {
    // Remove invalid fields
    Object.keys(data).forEach((key) => {
      if (INVALID_UPDATE_FIELDS.includes(key)) {
        delete data[key]
      }
    })

    data.updateAt = Date.now()

    const result = await GET_DB()
      .collection(COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(id), _destroy: false },
        { $set: data },
        { returnDocument: 'after' }
      )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

// Delete Admin (Soft Delete)
const deleteAdmin = async (id) => {
  try {
    await GET_DB()
      .collection(COLLECTION_NAME)
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: { _destroy: true } }
      )
  } catch (error) {
    throw new Error(error)
  }
}

// Get All Admins
const findAll = async () => {
  try {
    const results = await GET_DB()
      .collection(COLLECTION_NAME)
      .find({ _destroy: false })
      .toArray()
    return results
  } catch (error) {
    throw new Error(error)
  }
}

export { ADMIN_ROLES,
  createNew,
  findOneByEmail,
  findOneByAdminName,
  findOneById,
  update,
  deleteAdmin,
  findAll
 }
