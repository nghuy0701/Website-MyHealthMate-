import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { cloudinaryProvider } from '~/providers'

/**
 * Upload Controller - Handles file uploads
 */

// Allowed file types
const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword', // .doc
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/vnd.ms-excel', // .xls
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'text/plain',
  'application/zip',
  'application/x-zip-compressed'
]

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

// Upload single file
const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'No file uploaded')
    }

    const file = req.file
    const mimeType = file.mimetype
    const size = file.size

    // Validate file size
    if (size > MAX_FILE_SIZE) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'File size exceeds 10MB limit')
    }

    // Validate file type
    const allAllowedTypes = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_FILE_TYPES]
    if (!allAllowedTypes.includes(mimeType)) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'File type not allowed. Allowed types: images (png/jpg/jpeg/webp/gif), documents (pdf/doc/docx/xls/xlsx/txt/zip)'
      )
    }

    // Determine file type category
    const type = ALLOWED_IMAGE_TYPES.includes(mimeType) ? 'image' : 'file'

    // Upload to Cloudinary
    const uploadResult = await cloudinaryProvider.uploadSingle(file.buffer, {
      folder: 'chat-attachments',
      resource_type: 'auto'
    })

    // Return metadata
    res.status(StatusCodes.OK).json({
      url: uploadResult.secure_url,
      filename: file.originalname,
      mimeType: mimeType,
      size: size,
      type: type
    })
  } catch (error) {
    next(error)
  }
}

export const uploadController = {
  uploadFile
}
