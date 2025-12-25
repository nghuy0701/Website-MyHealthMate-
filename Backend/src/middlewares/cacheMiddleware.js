import { redisCache } from '~/providers/redisProvider'

/**
 * Cache middleware factory
 * @param {number} ttl - Time to live in seconds (default: 1 hour)
 * @param {function} keyGenerator - Function to generate cache key from req
 * @returns {function} Express middleware
 */
export const cacheMiddleware = (ttl = 3600, keyGenerator = null) => {
  return async (req, res, next) => {
    try {
      // Generate cache key
      const cacheKey = keyGenerator 
        ? keyGenerator(req)
        : `cache:${req.method}:${req.originalUrl}`

      // Try to get from cache
      const cachedData = await redisCache.get(cacheKey)

      if (cachedData) {
        // Cache hit - return cached data
        return res.json({
          ...cachedData,
          _fromCache: true
        })
      }

      // Cache miss - modify res.json to cache the response
      const originalJson = res.json.bind(res)
      res.json = function(data) {
        // Cache the response data (async, don't block)
        redisCache.set(cacheKey, data, ttl).catch(err => {
          console.error('Error caching response:', err)
        })
        
        // Send response
        return originalJson(data)
      }

      next()
    } catch (error) {
      // If cache fails, continue without caching
      console.error('Cache middleware error:', error)
      next()
    }
  }
}

/**
 * Cache invalidation middleware
 * Xóa cache khi có thay đổi dữ liệu (POST, PUT, DELETE)
 * @param {string|function} pattern - Pattern or function to generate pattern
 */
export const invalidateCacheMiddleware = (pattern) => {
  return async (req, res, next) => {
    try {
      // Lưu original res.json
      const originalJson = res.json.bind(res)
      
      res.json = async function(data) {
        // Invalidate cache sau khi response thành công
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const cachePattern = typeof pattern === 'function' 
            ? pattern(req)
            : pattern

          await redisCache.delByPattern(cachePattern).catch(err => {
            console.error('Error invalidating cache:', err)
          })
        }
        
        return originalJson(data)
      }

      next()
    } catch (error) {
      console.error('Cache invalidation middleware error:', error)
      next()
    }
  }
}

/**
 * Predefined cache keys generators
 */
export const cacheKeys = {
  articles: {
    list: (req) => {
      const { page = 1, limit = 10 } = req.query
      return `articles:list:${page}:${limit}`
    },
    detail: (req) => `articles:detail:${req.params.id}`,
    all: () => 'articles:*'
  },
  
  predictions: {
    user: (req) => `predictions:user:${req.session?.userId}`,
    detail: (req) => `predictions:detail:${req.params.id}`,
    all: () => 'predictions:*'
  },

  users: {
    detail: (req) => `users:detail:${req.params.id || req.session?.userId}`,
    all: () => 'users:*'
  },

  questions: {
    list: () => 'questions:list',
    all: () => 'questions:*'
  }
}
