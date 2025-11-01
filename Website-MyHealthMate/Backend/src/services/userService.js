import { userModel  } from '../models'
import { pickUser  } from '~/utils/formatter'
import { StatusCodes  } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import bcrypt from 'bcryptjs'

// Create New User (Register)
const createNew = async (req) => {
  try {
    // Check if email already exists
    const existUser = await userModel.findOneByEmail(req.body.email)
    if (existUser) {
      throw new ApiError(StatusCodes.CONFLICT, 'Email already exists!')
    }

    // Check if username already exists
    const existUsername = await userModel.findOneByUsername(req.body.username)
    if (existUsername) {
      throw new ApiError(StatusCodes.CONFLICT, 'Username already exists!')
    }

    // Create new user
    const newUser = {
      email: req.body.email,
      username: req.body.username,
      password: bcrypt.hashSync(req.body.password, 8),
      fullName: req.body.fullName || req.body.username,
      role: req.body.role || 'patient'
    }

    const createdUser = await userModel.createNew(newUser)
    const getNewUser = await userModel.findOneById(createdUser.insertedId.toString())

    if (!getNewUser) {
      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        'Failed to retrieve newly created user.'
      )
    }

    return pickUser(getNewUser)
  } catch (error) {
    throw error
  }
}

// Login
const login = async (req) => {
  try {
    const user = await userModel.findOneByEmail(req.body.email)
    
    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'User not found')
    }

    if (!user.isActive) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'User account is not active')
    }

    const passwordIsValid = bcrypt.compareSync(req.body.password, user.password)
    
    if (!passwordIsValid) {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        'Your Email or Password is incorrect!'
      )
    }

    return pickUser(user)
  } catch (error) {
    throw error
  }
}

// Get User by ID
const getById = async (userId) => {
  try {
    const user = await userModel.findOneById(userId)
    if (!user) return null
    return pickUser(user)
  } catch (error) {
    throw error
  }
}

// Get All Users
const getAllUsers = async () => {
  try {
    const users = await userModel.findAll()
    return users.map(user => pickUser(user))
  } catch (error) {
    throw error
  }
}

// Update User
const updateUser = async (userId, data) => {
  try {
    const user = await userModel.findOneById(userId)
    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'User not found')
    }

    // If password is being updated, hash it
    if (data.password) {
      data.password = bcrypt.hashSync(data.password, 8)
    }

    data.updatedAt = Date.now()

    const updatedUser = await userModel.update(userId, data)
    return pickUser(updatedUser)
  } catch (error) {
    throw error
  }
}

// Delete User
const deleteUser = async (userId) => {
  try {
    const user = await userModel.findOneById(userId)
    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'User not found')
    }
    await userModel.deleteUser(userId)
  } catch (error) {
    throw error
  }
}

export { createNew,
  login,
  getById,
  getAllUsers,
  updateUser,
  deleteUser
 }
