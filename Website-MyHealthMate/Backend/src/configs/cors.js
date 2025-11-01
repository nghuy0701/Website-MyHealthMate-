import { env } from './environment'

export const corsOptions = {
  origin: function (origin, callback) {
    const whitelist = [
      env.WEBSITE_DOMAIN_DEV,
      env.WEBSITE_DOMAIN_PROD
    ]
    
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
}
