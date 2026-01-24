import { Server } from 'socket.io'
import { createLogger } from '~/utils/logger'

const logger = createLogger('Socket.IO')

/**
 * Initialize Socket.IO server for real-time chat
 * Uses userId as room identifier
 */
export const initializeSocketIO = (httpServer, corsOptions) => {
  const io = new Server(httpServer, {
    cors: corsOptions,
    pingTimeout: 60000,
    pingInterval: 25000
  })

  // Authentication middleware
  io.use((socket, next) => {
    const userId = socket.handshake.auth.userId
    if (!userId) {
      return next(new Error('Authentication error: userId required'))
    }
    socket.userId = userId
    next()
  })

  // Connection handler
  io.on('connection', (socket) => {
    const userId = socket.userId
    logger.info(`[Socket.io] Connected: ${socket.id} (userId: ${userId})`)

    // Join user's personal room
    socket.join(userId)

    /**
     * Conversation room management
     * Clients must join conversation rooms to receive typing indicators
     */
    socket.on('join:conversation', (conversationId) => {
      if (conversationId) {
        socket.join(conversationId)
        logger.info(`[Socket.io] User ${userId} joined conversation ${conversationId}`)
      }
    })

    socket.on('leave:conversation', (conversationId) => {
      if (conversationId) {
        socket.leave(conversationId)
        logger.info(`[Socket.io] User ${userId} left conversation ${conversationId}`)
      }
    })

    /**
     * Typing indicator events
     * Payload: { conversationId, senderId }
     * 
     * Server relays events to conversation room - NO debounce logic
     * Debouncing is handled on the frontend
     */
    socket.on('typing:start', (data) => {
      const { conversationId, senderId } = data
      logger.info(`[Socket.io] typing:start from ${senderId} in conversation ${conversationId}`)
      
      // Emit to conversation room (all members except sender)
      socket.to(conversationId).emit('typing:start', {
        conversationId,
        senderId
      })
    })

    socket.on('typing:stop', (data) => {
      const { conversationId, senderId } = data
      logger.info(`[Socket.io] typing:stop from ${senderId} in conversation ${conversationId}`)
      
      // Emit to conversation room (all members except sender)
      socket.to(conversationId).emit('typing:stop', {
        conversationId,
        senderId
      })
    })

    // Disconnect handler
    socket.on('disconnect', () => {
      logger.info(`[Socket.io] Disconnected: ${userId}`)
    })
  })

  logger.success('Socket.IO initialized successfully')
  return io
}
