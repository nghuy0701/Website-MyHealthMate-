import { StatusCodes  } from 'http-status-codes'
import { env  } from '~/configs/environment'
import { userService } from '~/services'
import ApiError from '~/utils/ApiError'

// Register New User
const createNew = async (req, res, next) => {
  try {
    const createUser = await userService.createNew(req)
    res.status(StatusCodes.CREATED).json({
      message: 'User account created successfully',
      data: createUser
    })
  } catch (error) {
    next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message))
  }
}

// Login
const login = async (req, res, next) => {
  try {
    const result = await userService.login(req)
    if (result) {
      req.session.user = {
        userId: result._id.toString(),
        userName: result.userName,
        role: result.role
      }
    }
    res.status(StatusCodes.OK).json({
      message: 'Login successful',
      data: result
    })
  } catch (error) {
    next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message))
  }
}

// Logout
const logout = (req, res, next) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        return next(
          new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, err.message)
        )
      }

      res.clearCookie('connect.sid', {
        path: '/',
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax'
      })

      res.status(StatusCodes.OK).json({
        message: 'Logout successful'
      })
    })
  } catch (error) {
    next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message))
  }
}

// Get Current User
const getCurrentUser = async (req, res, next) => {
  try {
    const userId = req.session.user?.userId

    if (!userId) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        message: 'Not authenticated'
      })
      return
    }

    const user = await userService.getById(userId)

    res.status(StatusCodes.OK).json({
      message: 'User information retrieved successfully',
      data: user
    })
  } catch (error) {
    next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message))
  }
}

// Update Current User
const updateMe = async (req, res, next) => {
  try {
    const userId = req.session.user?.userId

    if (!userId) {
      return next(new ApiError(StatusCodes.UNAUTHORIZED, 'Not authenticated'))
    }

    const updatedUser = await userService.updateUser(userId, req.body)
    
    res.status(StatusCodes.OK).json({
      message: 'Profile updated successfully',
      data: updatedUser
    })
  } catch (error) {
    next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message))
  }
}

// Get All Users (Admin only)
const getAllUsers = async (req, res, next) => {
  try {
    const users = await userService.getAllUsers()
    res.status(StatusCodes.OK).json({
      message: 'Users retrieved successfully',
      data: users
    })
  } catch (error) {
    next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message))
  }
}

// Get User by ID
const getUserById = async (req, res, next) => {
  try {
    const userId = req.params.id
    const user = await userService.getById(userId)
    
    if (!user) {
      return next(new ApiError(StatusCodes.NOT_FOUND, 'User not found'))
    }

    res.status(StatusCodes.OK).json({
      message: 'User retrieved successfully',
      data: user
    })
  } catch (error) {
    next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message))
  }
}

// Update User
const updateUser = async (req, res, next) => {
  try {
    const userId = req.params.id
    const updatedUser = await userService.updateUser(userId, req.body)
    res.status(StatusCodes.OK).json({
      message: 'User updated successfully',
      data: updatedUser
    })
  } catch (error) {
    next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message))
  }
}

// Delete User
const deleteUser = async (req, res, next) => {
  try {
    const userId = req.params.id
    await userService.deleteUser(userId)
    res.status(StatusCodes.OK).json({
      message: 'User deleted successfully'
    })
  } catch (error) {
    next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message))
  }
}

// Change Password
const changePassword = async (req, res, next) => {
  try {
    const userId = req.session.user?.userId

    if (!userId) {
      return next(new ApiError(StatusCodes.UNAUTHORIZED, 'Not authenticated'))
    }

    const { oldPassword, newPassword } = req.body

    const result = await userService.changePassword(userId, oldPassword, newPassword)
    
    res.status(StatusCodes.OK).json({
      message: result.message
    })
  } catch (error) {
    next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message))
  }
}

// Upload Avatar
const uploadAvatar = async (req, res, next) => {
  try {
    const userId = req.session.user?.userId

    if (!userId) {
      return next(new ApiError(StatusCodes.UNAUTHORIZED, 'Not authenticated'))
    }

    if (!req.file) {
      return next(new ApiError(StatusCodes.BAD_REQUEST, 'No file uploaded'))
    }

    const updatedUser = await userService.uploadAvatar(userId, req.file)
    
    res.status(StatusCodes.OK).json({
      message: 'Avatar uploaded successfully',
      data: updatedUser
    })
  } catch (error) {
    next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message))
  }
}

export const userController = {
  createNew,
  login,
  logout,
  getCurrentUser,
  updateMe,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  changePassword,
  uploadAvatar
}
