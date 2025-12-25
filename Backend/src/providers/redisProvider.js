import { createClient } from 'redis'
import { env } from '~/configs/environment'
import { createLogger } from '~/utils/logger'

const logger = createLogger('Redis')
let redisClient = null

/**
 * Kết nối Redis với retry logic
 */
const CONNECT_REDIS = async () => {
  try {
    // Nếu đã có connection, return
    if (redisClient && redisClient.isOpen) {
      return redisClient
    }

    // Tạo Redis client
    redisClient = createClient({
      url: env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        reconnectStrategy: (retries) => {
          // Trong development mode, chỉ retry 3 lần
          if (env.NODE_ENV === 'development' && retries > 3) {
            logger.warn('Redis not available - Running without cache in development mode')
            return false // Stop retrying
          }
          // Production: retry với exponential backoff
          if (retries > 10) {
            return new Error('Redis connection failed after 10 retries')
          }
          return Math.min(retries * 100, 3000)
        }
      }
    })

    // Error handling
    redisClient.on('error', (err) => {
      logger.error('Redis client error', { error: err.message })
    })

    redisClient.on('connect', () => {
      logger.debug('Redis connecting...')
    })

    redisClient.on('ready', () => {
      logger.success('Redis is ready')
    })

    redisClient.on('reconnecting', () => {
      logger.warn('Redis reconnecting...')
    })

    // Connect
    await redisClient.connect()

    return redisClient
  } catch (error) {
    logger.failure('Cannot connect to Redis', { error: error.message })
    // Không throw error để app vẫn chạy được khi Redis offline
    return null
  }
}

/**
 * Lấy Redis client instance
 */
const GET_REDIS = () => {
  if (!redisClient || !redisClient.isOpen) {
    logger.warn('Redis client is not connected')
    return null
  }
  return redisClient
}

/**
 * Đóng kết nối Redis
 */
const CLOSE_REDIS = async () => {
  if (redisClient && redisClient.isOpen) {
    await redisClient.quit()
    logger.success('Redis connection closed')
  }
}

/**
 * Cache helper functions
 */
export const redisCache = {
  /**
   * Get cache value
   * @param {string} key - Cache key
   * @returns {Promise<any>} - Cached value (parsed JSON)
   */
  get: async (key) => {
    try {
      const client = GET_REDIS()
      if (!client) return null

      const value = await client.get(key)
      return value ? JSON.parse(value) : null
    } catch (error) {
      logger.error(`Redis GET error for key ${key}`, { error: error.message })
      return null
    }
  },

  /**
   * Set cache value
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttl - Time to live in seconds (default: 1 hour)
   */
  set: async (key, value, ttl = 3600) => {
    try {
      const client = GET_REDIS()
      if (!client) return false

      await client.setEx(key, ttl, JSON.stringify(value))
      return true
    } catch (error) {
      logger.error(`Redis SET error for key ${key}`, { error: error.message })
      return false
    }
  },

  /**
   * Delete cache key
   * @param {string} key - Cache key to delete
   */
  del: async (key) => {
    try {
      const client = GET_REDIS()
      if (!client) return false

      await client.del(key)
      return true
    } catch (error) {
      logger.error(`Redis DEL error for key ${key}`, { error: error.message })
      return false
    }
  },

  /**
   * Delete keys by pattern
   * @param {string} pattern - Pattern to match (e.g., 'articles:*')
   */
  delByPattern: async (pattern) => {
    try {
      const client = GET_REDIS()
      if (!client) return false

      const keys = await client.keys(pattern)
      if (keys.length > 0) {
        await client.del(keys)
      }
      return true
    } catch (error) {
      logger.error(`Redis DEL pattern error for ${pattern}`, { error: error.message })
      return false
    }
  },

  /**
   * Check if key exists
   * @param {string} key - Cache key
   */
  exists: async (key) => {
    try {
      const client = GET_REDIS()
      if (!client) return false

      const result = await client.exists(key)
      return result === 1
    } catch (error) {
      logger.error(`Redis EXISTS error for key ${key}`, { error: error.message })
      return false
    }
  },

  /**
   * Get remaining TTL for a key
   * @param {string} key - Cache key
   * @returns {Promise<number>} - TTL in seconds (-2: not exist, -1: no expiry)
   */
  ttl: async (key) => {
    try {
      const client = GET_REDIS()
      if (!client) return -2

      return await client.ttl(key)
    } catch (error) {
      logger.error(`Redis TTL error for key ${key}`, { error: error.message })
      return -2
    }
  }
}

export { CONNECT_REDIS, GET_REDIS, CLOSE_REDIS }
