import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:8017';

/**
 * Custom hook for Socket.io connection and chat events
 * @param {string} userId - Current user's ID for room joining
 * @param {Function} onNewMessage - Callback when new message arrives
 * @param {Function} onTypingStart - Callback when someone starts typing
 * @param {Function} onTypingStop - Callback when someone stops typing
 */
export function useSocket(userId, onNewMessage, onTypingStart, onTypingStop) {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!userId) return;

    // Initialize socket connection
    const socket = io(SOCKET_URL, {
      auth: {
        userId: userId
      },
      transports: ['websocket', 'polling']
    });

    socketRef.current = socket;

    // Connection handlers
    socket.on('connect', () => {
      console.log('[Socket.io] Connected:', socket.id);
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('[Socket.io] Disconnected');
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('[Socket.io] Connection error:', error);
      setIsConnected(false);
    });

    // Chat event listeners
    socket.on('message:new', (data) => {
      console.log('[Socket.io] New message:', data);
      if (onNewMessage) {
        onNewMessage(data);
      }
    });

    socket.on('typing:start', (data) => {
      console.log('[Socket.io] Typing start:', data);
      if (onTypingStart) {
        onTypingStart(data);
      }
    });

    socket.on('typing:stop', (data) => {
      console.log('[Socket.io] Typing stop:', data);
      if (onTypingStop) {
        onTypingStop(data);
      }
    });

    // Cleanup on unmount
    return () => {
      console.log('[Socket.io] Cleaning up connection');
      socket.disconnect();
    };
  }, [userId, onNewMessage, onTypingStart, onTypingStop]);

  // Helper functions to emit events
  // Consistent payload: { conversationId, senderId }
  const emitTypingStart = (conversationId, senderId) => {
    if (socketRef.current?.connected && conversationId && senderId) {
      socketRef.current.emit('typing:start', { conversationId, senderId });
      console.log('[Socket] Emit typing:start', { conversationId, senderId });
    }
  };

  const emitTypingStop = (conversationId, senderId) => {
    if (socketRef.current?.connected && conversationId && senderId) {
      socketRef.current.emit('typing:stop', { conversationId, senderId });
      console.log('[Socket] Emit typing:stop', { conversationId, senderId });
    }
  };

  // Helper functions to join/leave conversation rooms
  const joinConversation = (conversationId) => {
    if (socketRef.current?.connected && conversationId) {
      socketRef.current.emit('join:conversation', conversationId);
      console.log('[Socket] Joined conversation:', conversationId);
    }
  };

  const leaveConversation = (conversationId) => {
    if (socketRef.current?.connected && conversationId) {
      socketRef.current.emit('leave:conversation', conversationId);
      console.log('[Socket] Left conversation:', conversationId);
    }
  };

  return {
    socket: socketRef.current,
    isConnected,
    emitTypingStart,
    emitTypingStop,
    joinConversation,
    leaveConversation
  };
}
