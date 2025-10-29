const { GET_DB } = require('../configs/mongodb');
const Joi = require('joi');
const { ObjectId } = require('mongodb');

const COLLECTION_NAME = 'users';

// Validation Rules
const EMAIL_RULE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMAIL_RULE_MESSAGE = 'Email must be a valid email address';
const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
const PASSWORD_RULE_MESSAGE = 'Password must be at least 8 characters with uppercase, lowercase and number';
const USERNAME_RULE = /^[a-zA-Z0-9_]{3,20}$/;
const USERNAME_RULE_MESSAGE = 'Username must be 3-20 characters, alphanumeric and underscore only';

const USER_ROLES = {
  PATIENT: 'patient',
  DOCTOR: 'doctor',
  ADMIN: 'admin'
};

// Validation Schema
const USER_COLLECTION_SCHEMA = Joi.object({
  email: Joi.string()
    .required()
    .pattern(EMAIL_RULE)
    .message(EMAIL_RULE_MESSAGE),
  password: Joi.string()
    .required()
    .pattern(PASSWORD_RULE)
    .message(PASSWORD_RULE_MESSAGE),
  username: Joi.string()
    .required()
    .pattern(USERNAME_RULE)
    .message(USERNAME_RULE_MESSAGE),
  fullName: Joi.string().required().min(3).max(100),
  role: Joi.string()
    .default(USER_ROLES.PATIENT)
    .valid(USER_ROLES.PATIENT, USER_ROLES.DOCTOR, USER_ROLES.ADMIN),
  isActive: Joi.boolean().default(true),
  phone: Joi.string().optional().allow(null),
  gender: Joi.string().optional().allow(null),
  dob: Joi.date().optional().allow(null),
  avatar: Joi.string().optional().allow(null),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
});

// Invalid Update Fields
const INVALID_UPDATE_FIELDS = ['_id', 'email', 'username', 'createdAt'];

// Create New User
const createNew = async (data) => {
  try {
    const validData = await USER_COLLECTION_SCHEMA.validateAsync(data, {
      abortEarly: false
    });
    const createdUser = await GET_DB()
      .collection(COLLECTION_NAME)
      .insertOne(validData);
    return createdUser;
  } catch (error) {
    throw new Error(error);
  }
};

// Find User by Email
const findOneByEmail = async (email) => {
  try {
    const result = await GET_DB()
      .collection(COLLECTION_NAME)
      .findOne({ email: email, _destroy: false });
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

// Find User by Username
const findOneByUsername = async (username) => {
  try {
    const result = await GET_DB()
      .collection(COLLECTION_NAME)
      .findOne({ username: username, _destroy: false });
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

// Find User by ID
const findOneById = async (id) => {
  try {
    const result = await GET_DB()
      .collection(COLLECTION_NAME)
      .findOne({ _id: new ObjectId(id), _destroy: false });
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

// Update User
const update = async (id, data) => {
  try {
    // Remove invalid fields
    Object.keys(data).forEach((key) => {
      if (INVALID_UPDATE_FIELDS.includes(key)) {
        delete data[key];
      }
    });

    const result = await GET_DB()
      .collection(COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(id), _destroy: false },
        { $set: data },
        { returnDocument: 'after' }
      );
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

// Delete User (Soft Delete)
const deleteUser = async (id) => {
  try {
    await GET_DB()
      .collection(COLLECTION_NAME)
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: { _destroy: true } }
      );
  } catch (error) {
    throw new Error(error);
  }
};

// Get All Users
const findAll = async () => {
  try {
    const results = await GET_DB()
      .collection(COLLECTION_NAME)
      .find({ _destroy: false })
      .toArray();
    return results;
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = {
  USER_ROLES,
  createNew,
  findOneByEmail,
  findOneByUsername,
  findOneById,
  update,
  deleteUser,
  findAll
};
