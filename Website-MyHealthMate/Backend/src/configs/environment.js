require('dotenv').config();

const env = {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  HOST: process.env.HOST,
  MONGODB_URI: process.env.MONGODB_URI,
  DATABASE_NAME: process.env.DATABASE_NAME,
  SESSION_SECRET: process.env.SESSION_SECRET,
  WEBSITE_DOMAIN_DEVELOPMENT: process.env.WEBSITE_DOMAIN_DEVELOPMENT,
  WEBSITE_DOMAIN_PRODUCTION: process.env.WEBSITE_DOMAIN_PRODUCTION,
  AUTHOR_NAME: process.env.AUTHOR_NAME,
  ML_SERVICE_URL: process.env.ML_SERVICE_URL || 'http://localhost:5001'
};

module.exports = { env };
