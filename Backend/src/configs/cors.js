import { env } from './environment'

export const corsOptions = {
  origin: function (origin, callback) {
    // Allow multiple origins for development
    const whitelist = [
      env.WEBSITE_DOMAIN_DEV,
      env.WEBSITE_DOMAIN_PROD,
      'http://localhost',
      'http://localhost:80',
      'http://localhost:3000',
      'http://localhost:8017'
    ].filter(Boolean) // Remove undefined values
    
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
}
