/**
 * Cloudinary Provider - Upload Image/Video
 */

import { v2 as cloudinary } from 'cloudinary'
import { env } from '~/configs/environment'

// Configure Cloudinary
// Parse CLOUDINARY_URL if available (format: cloudinary://api_key:api_secret@cloud_name)
if (process.env.CLOUDINARY_URL) {
  const cloudinaryUrl = process.env.CLOUDINARY_URL
  const matches = cloudinaryUrl.match(/cloudinary:\/\/(\d+):([^@]+)@(.+)/)
  if (matches) {
    cloudinary.config({
      cloud_name: matches[3],
      api_key: matches[1],
      api_secret: matches[2]
    })
  }
} else {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET
  })
}

const uploadImage = async (file, folder = 'myhealthmate') => {
  try {
    // Convert buffer to base64 if file is a buffer
    const fileData = Buffer.isBuffer(file) 
      ? `data:image/jpeg;base64,${file.toString('base64')}`
      : file

    const result = await cloudinary.uploader.upload(fileData, {
      folder,
      resource_type: 'auto',
      transformation: [
        { width: 500, height: 500, crop: 'limit' }
      ]
    })
    return {
      url: result.secure_url,
      publicId: result.public_id
    }
  } catch (error) {
    throw new Error(`Cloudinary upload failed: ${error.message}`)
  }
}

const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId)
    return result
  } catch (error) {
    throw new Error(`Cloudinary delete failed: ${error.message}`)
  }
}

// Upload single file (image or document) from buffer
const uploadSingle = async (buffer, options = {}) => {
  try {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: options.folder || 'myhealthmate',
          resource_type: options.resource_type || 'auto',
        },
        (error, result) => {
          if (error) {
            reject(new Error(`Cloudinary upload failed: ${error.message}`))
          } else {
            resolve(result)
          }
        }
      )
      
      // Write buffer to stream
      uploadStream.end(buffer)
    })
  } catch (error) {
    throw new Error(`Cloudinary upload failed: ${error.message}`)
  }
}

const cloudinaryProvider = {
  uploadImage,
  deleteImage,
  uploadSingle
}

export { cloudinaryProvider }
export default cloudinaryProvider
