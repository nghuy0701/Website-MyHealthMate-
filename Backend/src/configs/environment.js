const dotenv = require('dotenv')
const path = require('path')

// Load .env from root (Backend/../.env)
const envPath = path.resolve(__dirname, '../../../.env')
dotenv.config({ path: envPath })

export const env = {
  // Environment
  NODE_ENV: process.env.NODE_ENV,
  
  // Database (Critical Infrastructure)
  MONGODB_URI: process.env.MONGODB_URI,
  DATABASE_NAME: process.env.DATABASE_NAME,
  
  // Security & Authentication
  SESSION_SECRET: process.env.SESSION_SECRET,
  
  // Security & Authentication
  ADMIN_SECRET_KEY: process.env.ADMIN_SECRET_KEY || 'default-admin-secret-2024',
  
  // Application Server
  APP_HOST: process.env.APP_HOST,
  APP_PORT: process.env.APP_PORT,
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
  WEBSITE_DOMAIN_DEV: process.env.WEBSITE_DOMAIN_DEV,
  WEBSITE_DOMAIN_PROD: process.env.WEBSITE_DOMAIN_PROD,
  
  // Internal Services
  ML_SERVICE_URL: process.env.ML_SERVICE_URL || 'http://localhost:5001',
  
  // External Services - Cloudinary
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  
  // External Services - Brevo
  BREVO_API_KEY: process.env.BREVO_API_KEY,
  BREVO_SENDER_EMAIL: process.env.BREVO_SENDER_EMAIL,
  
  // Metadata
  AUTHOR: process.env.AUTHOR
}
