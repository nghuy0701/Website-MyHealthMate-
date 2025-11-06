import { GET_DB  } from '~/configs/mongodb'
import { ObjectId  } from 'mongodb'

const COLLECTION_NAME = 'users'

const USER_ROLES = {
  MEMBER: 'member'
}

// Invalid Update Fields
const INVALID_UPDATE_FIELDS = ['_id', 'email', 'userName', 'createdAt']

// Create New User
const createNew = async (data) => {
  try {
    const newUser = {
      ...data,
      role: data.role || USER_ROLES.MEMBER,
      createdAt: Date.now(),
      updateAt: null,
      _destroy: false
    }
    const createdUser = await GET_DB()
      .collection(COLLECTION_NAME)
      .insertOne(newUser)
    return createdUser
  } catch (error) {
    throw new Error(error)
  }
}

// Find User by Email
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

// Find User by Username
const findOneByUsername = async (userName) => {
  try {
    const result = await GET_DB()
      .collection(COLLECTION_NAME)
      .findOne({ userName: userName, _destroy: false })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

// Find User by ID
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

// Update User
const update = async (id, data) => {
  try {
    // Remove invalid fields
    Object.keys(data).forEach((key) => {
      if (INVALID_UPDATE_FIELDS.includes(key)) {
        delete data[key]
      }
    })

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

// Delete User (Soft Delete)
const deleteUser = async (id) => {
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

// Get All Users
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

const userModel = {
  USER_ROLES,
  createNew,
  findOneByEmail,
  findOneByUsername,
  findOneById,
  update,
  deleteUser,
  findAll
}

export default userModel
