import { env } from './environment'

export const corsOptions = {
  origin: function (origin, callback) {
    // Allow development ports: 3000, 3001, 3002
    const whitelist = [
      env.WEBSITE_DOMAIN_DEV,
      env.WEBSITE_DOMAIN_PROD,
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002'
    ]
    
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error(`Not allowed by CORS: ${origin}`))
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
}
