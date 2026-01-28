import multer from 'multer'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

// Storage in memory for easy transfer to Cloudinary
const storage = multer.memoryStorage()

// File filter - accept images and document files
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'application/zip',
    'application/x-zip-compressed'
  ]

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(
      new ApiError(
        StatusCodes.BAD_REQUEST,
        'File type not allowed. Allowed: images, PDF, DOC, DOCX, XLS, XLSX, TXT, ZIP'
      ),
      false
    )
  }
}

// Multer configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max file size
  }
})

export const uploadMiddleware = {
  single: (fieldName) => upload.single(fieldName),
  array: (fieldName, maxCount) => upload.array(fieldName, maxCount)
}
