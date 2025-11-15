import userModel from '~/models/userModel.js'
import { pickUser  } from '~/utils/formatter'
import { StatusCodes  } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import bcrypt from 'bcryptjs'
import emailService from '~/services/emailService'

// Create New User (Register)
const createNew = async (req) => {
  try {
    // Check if email already exists
    const existUser = await userModel.findOneByEmail(req.body.email)
    if (existUser) {
      throw new ApiError(StatusCodes.CONFLICT, 'Email already exists!')
    }

    // Check if userName already exists
    const existUsername = await userModel.findOneByUsername(req.body.userName)
    if (existUsername) {
      throw new ApiError(StatusCodes.CONFLICT, 'Username already exists!')
    }

    // Create new user
    const newUser = {
      email: req.body.email,
      userName: req.body.userName,
      password: bcrypt.hashSync(req.body.password, 8),
      displayName: req.body.displayName || req.body.userName,
      phone: req.body.phone || null,
      gender: req.body.gender || null,
      dob: req.body.dob || null,
      avatar: req.body.avatar || null,
      role: 'member' // Users can only register as members
    }

    const createdUser = await userModel.createNew(newUser)
    const getNewUser = await userModel.findOneById(createdUser.insertedId.toString())

    if (!getNewUser) {
      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        'Failed to retrieve newly created user.'
      )
    }

    // Send welcome email (async, don't wait)
    emailService.sendWelcomeEmail(getNewUser.email, getNewUser.displayName || getNewUser.userName)
      .then(result => {
        if (result.success) {
          console.log(`📧 Welcome email sent to ${getNewUser.email}`)
        }
      })
      .catch(err => console.error('Email error:', err))

    return pickUser(getNewUser)
  } catch (error) {
    throw error
  }
}

// Login
const login = async (req) => {
  try {
    const { email, password } = req.body
    
    // Try to find user by email or username
    let user = await userModel.findOneByEmail(email)
    
    // If not found by email, try username
    if (!user) {
      user = await userModel.findOneByUsername(email)
    }
    
    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'User not found')
    }

    const passwordIsValid = bcrypt.compareSync(password, user.password)
    
    if (!passwordIsValid) {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        'Your Email/Username or Password is incorrect!'
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

    data.updateAt = Date.now()

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

const userService = {
  createNew,
  login,
  getById,
  getAllUsers,
  updateUser,
  deleteUser
}

export default userService
