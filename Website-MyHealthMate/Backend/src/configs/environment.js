import 'dotenv/config'

export const env = {
  NODE_ENV: process.env.NODE_ENV,
  APP_HOST: process.env.APP_HOST,
  APP_PORT: process.env.APP_PORT,
  MONGODB_URI: process.env.MONGODB_URI,
  DATABASE_NAME: process.env.DATABASE_NAME,
  SESSION_SECRET: process.env.SESSION_SECRET,
  WEBSITE_DOMAIN_DEV: process.env.WEBSITE_DOMAIN_DEV,
  WEBSITE_DOMAIN_PROD: process.env.WEBSITE_DOMAIN_PROD,
  ML_SERVICE_URL: process.env.ML_SERVICE_URL || 'http://localhost:5001',
  AUTHOR: process.env.AUTHOR
}
