import { env } from './environment'

const parseOrigins = (value) =>
  (value || '')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean)

const buildWhitelist = () => {
  const configuredOrigins = parseOrigins(env.ALLOWED_ORIGINS)

  return new Set([
    env.CLIENT_URL,
    env.WEBSITE_DOMAIN_DEV,
    env.WEBSITE_DOMAIN_PROD,
    ...configuredOrigins,
    'http://localhost',
    'http://localhost:80',
    'http://localhost:3000',
    'http://localhost:8017'
  ].filter(Boolean))
}

export const corsOptions = {
  origin: function (origin, callback) {
    const whitelist = buildWhitelist()

    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin || whitelist.has(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
}
