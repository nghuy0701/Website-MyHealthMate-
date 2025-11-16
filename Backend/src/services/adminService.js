import adminModel from '~/models/adminModel.js'
import { pickUser } from '~/utils/formatter'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import bcrypt from 'bcryptjs'
import { env } from '~/configs/environment'
import crypto from 'crypto'
import emailService from './emailService.js'

// Create New Admin (Register)
const createNew = async (reqBody) => {
  try {
    // Verify secret key
    if (reqBody.secretKey !== env.ADMIN_SECRET_KEY) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'Khóa bí mật không hợp lệ! Chỉ người được ủy quyền mới có thể tạo tài khoản admin.')
    }

    // Check if email already exists
    const existAdmin = await adminModel.findOneByEmail(reqBody.email)
    if (existAdmin) {
      throw new ApiError(StatusCodes.CONFLICT, 'Email đã tồn tại!')
    }

    // Check if adminName already exists
    const existAdminName = await adminModel.findOneByAdminName(reqBody.adminName)
    if (existAdminName) {
      throw new ApiError(StatusCodes.CONFLICT, 'Tên admin đã tồn tại!')
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const verificationExpires = Date.now() + 24 * 60 * 60 * 1000 // 24 hours

    // Create new admin with unverified status
    const newAdmin = {
      email: reqBody.email,
      adminName: reqBody.adminName,
      password: bcrypt.hashSync(reqBody.password, 8),
      displayName: reqBody.displayName || reqBody.adminName,
      avatar: reqBody.avatar || null,
      role: 'admin',
      isEmailVerified: false,
      verificationToken: verificationToken,
      verificationExpires: verificationExpires
    }

    const createdAdmin = await adminModel.createNew(newAdmin)
    const getNewAdmin = await adminModel.findOneById(createdAdmin.insertedId.toString())

    if (!getNewAdmin) {
      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        'Failed to retrieve newly created admin.'
      )
    }

    // Send verification email (async, don't wait)
    emailService.sendAdminVerificationEmail(
      getNewAdmin.email,
      getNewAdmin.displayName,
      verificationToken
    )
      .then(result => {
        if (result.success) {
          console.log(`📧 Verification email sent to ${getNewAdmin.email}`)
        } else {
          console.log(`⚠️  Failed to send verification email: ${result.error}`)
        }
      })
      .catch(err => console.error('Email error:', err))

    return pickUser(getNewAdmin)
  } catch (error) {
    throw error
  }
}

// Verify Email
const verifyEmail = async (token) => {
  try {
    const admin = await adminModel.findOneByVerificationToken(token)
    
    if (!admin) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Mã xác thực không hợp lệ hoặc đã hết hạn')
    }

    // Check if token has expired
    if (admin.verificationExpires < Date.now()) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Mã xác thực đã hết hạn')
    }

    // Check if already verified
    if (admin.isEmailVerified) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Email đã được xác thực')
    }

    // Update admin to verified status
    await adminModel.update(admin._id.toString(), {
      isEmailVerified: true,
      verificationToken: null,
      verificationExpires: null
    })

    return { message: 'Xác thực email thành công' }
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
      throw new ApiError(StatusCodes.NOT_FOUND, 'Admin không tồn tại')
    }

    // Check if email is verified
    if (!admin.isEmailVerified) {
      console.log('❌ Email not verified:', reqBody.email)
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        'Vui lòng xác thực email trước khi đăng nhập. Kiểm tra hóp thư để lấy liên kết xác thực.'
      )
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
  verifyEmail,
  login,
  getById,
  getAllAdmins,
  updateAdmin,
  deleteAdmin
}

export default adminService
