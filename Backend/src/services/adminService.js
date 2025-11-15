import adminModel from '~/models/adminModel.js'
import { pickUser } from '~/utils/formatter'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import bcrypt from 'bcryptjs'

// Create New Admin (Register)
const createNew = async (reqBody) => {
  try {
    // Check if email already exists
    const existAdmin = await adminModel.findOneByEmail(reqBody.email)
    if (existAdmin) {
      throw new ApiError(StatusCodes.CONFLICT, 'Email already exists!')
    }

    // Check if adminName already exists
    const existAdminName = await adminModel.findOneByAdminName(reqBody.adminName)
    if (existAdminName) {
      throw new ApiError(StatusCodes.CONFLICT, 'Admin name already exists!')
    }

    // Create new admin
    const newAdmin = {
      email: reqBody.email,
      adminName: reqBody.adminName,
      password: bcrypt.hashSync(reqBody.password, 8),
      displayName: reqBody.displayName || reqBody.adminName,
      avatar: reqBody.avatar || null,
      role: 'admin'
    }

    const createdAdmin = await adminModel.createNew(newAdmin)
    const getNewAdmin = await adminModel.findOneById(createdAdmin.insertedId.toString())

    if (!getNewAdmin) {
      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        'Failed to retrieve newly created admin.'
      )
    }

    return pickUser(getNewAdmin)
  } catch (error) {
    throw error
  }
}

// Login
const login = async (reqBody) => {
  try {
    console.log('🔐 Admin login attempt:', reqBody.email)
    const admin = await adminModel.findOneByEmail(reqBody.email)
    
    if (!admin) {
      console.log('❌ Admin not found:', reqBody.email)
      throw new ApiError(StatusCodes.NOT_FOUND, 'Admin not found')
    }

    console.log('✅ Admin found:', admin.email)
    const passwordIsValid = bcrypt.compareSync(reqBody.password, admin.password)
    
    if (!passwordIsValid) {
      console.log('❌ Invalid password for:', reqBody.email)
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        'Your Email or Password is incorrect!'
      )
    }

    console.log('✅ Login successful for:', admin.email)
    return pickUser(admin)
  } catch (error) {
    console.error('❌ Login error:', error.message)
    throw error
  }
}

// Get Admin by ID
const getById = async (adminId) => {
  try {
    const admin = await adminModel.findOneById(adminId)
    if (!admin) return null
    return pickUser(admin)
  } catch (error) {
    throw error
  }
}

// Get All Admins
const getAllAdmins = async () => {
  try {
    const admins = await adminModel.findAll()
    return admins.map(admin => pickUser(admin))
  } catch (error) {
    throw error
  }
}

// Update Admin
const updateAdmin = async (adminId, data) => {
  try {
    const admin = await adminModel.findOneById(adminId)
    if (!admin) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Admin not found')
    }

    // If password is being updated, hash it
    if (data.password) {
      data.password = bcrypt.hashSync(data.password, 8)
    }

    data.updateAt = Date.now()

    const updatedAdmin = await adminModel.update(adminId, data)
    return pickUser(updatedAdmin)
  } catch (error) {
    throw error
  }
}

// Delete Admin
const deleteAdmin = async (adminId) => {
  try {
    const admin = await adminModel.findOneById(adminId)
    if (!admin) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Admin not found')
    }
    await adminModel.deleteAdmin(adminId)
  } catch (error) {
    throw error
  }
}

const adminService = {
  createNew,
  login,
  getById,
  getAllAdmins,
  updateAdmin,
  deleteAdmin
}

export default adminService
