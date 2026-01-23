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
    logger.info(`User connected: ${userId}`)

    // Join user's personal room
    socket.join(userId)

    // Handle typing indicator
    socket.on('typing:start', (data) => {
      const { receiverId, conversationId } = data
      socket.to(receiverId).emit('typing:start', {
        senderId: userId,
        conversationId
      })
    })

    socket.on('typing:stop', (data) => {
      const { receiverId, conversationId } = data
      socket.to(receiverId).emit('typing:stop', {
        senderId: userId,
        conversationId
      })
    })

    // Disconnect handler
    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${userId}`)
    })
  })

  logger.success('Socket.IO initialized successfully')
  return io
}
