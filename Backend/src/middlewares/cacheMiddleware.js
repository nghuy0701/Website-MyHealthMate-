// Redis removed - Cache middleware disabled
/**
 * Cache middleware factory (DISABLED - No Redis)
 * @param {number} ttl - Time to live in seconds (default: 1 hour)
 * @param {function} keyGenerator - Function to generate cache key from req
 * @returns {function} Express middleware
 */
export const cacheMiddleware = (ttl = 3600, keyGenerator = null) => {
  return async (req, res, next) => {
    // Cache disabled - just pass through
    next()
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
