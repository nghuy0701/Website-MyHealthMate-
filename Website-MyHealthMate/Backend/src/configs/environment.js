import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

// Get current file directory
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load .env from root directory (2 levels up from Backend/src/configs)
const envPath = path.resolve(__dirname, '../../../.env')
dotenv.config({ path: envPath })

export const env = {
  NODE_ENV: process.env.NODE_ENV,
  APP_HOST: process.env.APP_HOST,
  APP_PORT: process.env.APP_PORT,
  
  // Database
  MONGODB_URI: process.env.MONGODB_URI,
  DATABASE_NAME: process.env.DATABASE_NAME,
  
  // Session
  SESSION_SECRET: process.env.SESSION_SECRET,
  
  // Domain
  WEBSITE_DOMAIN_DEV: process.env.WEBSITE_DOMAIN_DEV,
  WEBSITE_DOMAIN_PROD: process.env.WEBSITE_DOMAIN_PROD,
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
  
  // ML Service
  ML_SERVICE_URL: process.env.ML_SERVICE_URL || 'http://localhost:5001',
  
  // Cloudinary
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  
  // Brevo (SendInBlue)
  BREVO_API_KEY: process.env.BREVO_API_KEY,
  BREVO_SENDER_EMAIL: process.env.BREVO_SENDER_EMAIL,
  
  AUTHOR: process.env.AUTHOR
}
