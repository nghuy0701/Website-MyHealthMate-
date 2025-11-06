import { StatusCodes } from 'http-status-codes'
import { env } from '~/configs/environment'
import { adminService } from '~/services'
import ApiError from '~/utils/ApiError'

// Register New Admin
const createNew = async (req, res, next) => {
  try {
    const createdAdmin = await adminService.createNew(req.body)
    res.status(StatusCodes.CREATED).json({
      message: 'Admin account created successfully',
      data: createdAdmin
    })
  } catch (error) {
    next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message))
  }
}

// Login Admin
const login = async (req, res, next) => {
  try {
    const result = await adminService.login(req.body)
    if (result) {
      req.session.user = {
        userId: result._id.toString(),
        adminName: result.adminName,
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

// Logout Admin
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

// Get All Admins
const getAllAdmins = async (req, res, next) => {
  try {
    const admins = await adminService.getAllAdmins()
    res.status(StatusCodes.OK).json({
      message: 'Admins retrieved successfully',
      data: admins
    })
  } catch (error) {
    next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message))
  }
}

// Get Admin by ID
const getAdminById = async (req, res, next) => {
  try {
    const adminId = req.params.id
    const admin = await adminService.getById(adminId)
    
    if (!admin) {
      return next(new ApiError(StatusCodes.NOT_FOUND, 'Admin not found'))
    }

    res.status(StatusCodes.OK).json({
      message: 'Admin retrieved successfully',
      data: admin
    })
  } catch (error) {
    next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message))
  }
}

// Update Admin
const updateAdmin = async (req, res, next) => {
  try {
    const adminId = req.params.id
    const updatedAdmin = await adminService.updateAdmin(adminId, req.body)
    res.status(StatusCodes.OK).json({
      message: 'Admin updated successfully',
      data: updatedAdmin
    })
  } catch (error) {
    next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message))
  }
}

// Delete Admin
const deleteAdmin = async (req, res, next) => {
  try {
    const adminId = req.params.id
    await adminService.deleteAdmin(adminId)
    res.status(StatusCodes.OK).json({
      message: 'Admin deleted successfully'
    })
  } catch (error) {
    next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message))
  }
}

export const adminController = {
  createNew,
  login,
  logout,
  getAllAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin
}
