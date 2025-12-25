import rateLimit from 'express-rate-limit'
import { StatusCodes } from 'http-status-codes'

/**
 * Rate limiter cho login attempts
 * Giới hạn: 5 requests mỗi 15 phút
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    statusCode: StatusCodes.TOO_MANY_REQUESTS,
    message: 'Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau 15 phút.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skipSuccessfulRequests: true // Don't count successful requests
})

/**
 * Rate limiter cho prediction API
 * Giới hạn: 10 predictions mỗi 10 phút
 */
export const predictionLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10, // Limit each IP to 10 predictions per windowMs
  message: {
    statusCode: StatusCodes.TOO_MANY_REQUESTS,
    message: 'Bạn đã thực hiện quá nhiều dự đoán. Vui lòng thử lại sau 10 phút.'
  },
  standardHeaders: true,
  legacyHeaders: false
})

/**
 * Rate limiter cho registration
 * Giới hạn: 3 registrations mỗi giờ
 */
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 registrations per hour
  message: {
    statusCode: StatusCodes.TOO_MANY_REQUESTS,
    message: 'Quá nhiều lần đăng ký. Vui lòng thử lại sau 1 giờ.'
  },
  standardHeaders: true,
  legacyHeaders: false
})

/**
 * Rate limiter cho API calls tổng quát
 * Giới hạn: 100 requests mỗi 15 phút
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    statusCode: StatusCodes.TOO_MANY_REQUESTS,
    message: 'Quá nhiều yêu cầu từ IP này. Vui lòng thử lại sau.'
  },
  standardHeaders: true,
  legacyHeaders: false
})

/**
 * Rate limiter cho email sending
 * Giới hạn: 5 emails mỗi giờ
 */
export const emailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 emails per hour
  message: {
    statusCode: StatusCodes.TOO_MANY_REQUESTS,
    message: 'Bạn đã gửi quá nhiều email. Vui lòng thử lại sau 1 giờ.'
  },
  standardHeaders: true,
  legacyHeaders: false
})

/**
 * Rate limiter cho file uploads
 * Giới hạn: 10 uploads mỗi 30 phút
 */
export const uploadLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 10, // Limit each IP to 10 uploads per windowMs
  message: {
    statusCode: StatusCodes.TOO_MANY_REQUESTS,
    message: 'Bạn đã upload quá nhiều file. Vui lòng thử lại sau 30 phút.'
  },
  standardHeaders: true,
  legacyHeaders: false
})
