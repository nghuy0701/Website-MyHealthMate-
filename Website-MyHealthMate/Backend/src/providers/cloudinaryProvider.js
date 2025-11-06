/**
 * Cloudinary Provider - Upload Image/Video
 */

import { v2 as cloudinary } from 'cloudinary'
import { env } from '~/configs/environment'

// Configure Cloudinary
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET
})

const uploadImage = async (file, folder = 'myhealthmate') => {
  try {
    const result = await cloudinary.uploader.upload(file, {
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

const cloudinaryProvider = {
  uploadImage,
  deleteImage
}

export default cloudinaryProvider
