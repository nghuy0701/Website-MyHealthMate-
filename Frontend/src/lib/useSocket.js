import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:8017';

/**
 * Stable Socket.io hook
 * Creates connection ONCE per userId, never recreates
 */
export function useSocket(userId) {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const currentConversationRoomRef = useRef(null);

  // Initialize socket ONCE
  useEffect(() => {
    if (!userId || socketRef.current) return;

    console.log('[Socket] Connecting for user:', userId);

    const socket = io(SOCKET_URL, {
      auth: { userId },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[Socket] Connected:', socket.id);
      setIsConnected(true);
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
      setIsConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.error('[Socket] Error:', err.message);
      setIsConnected(false);
    });

    return () => {
      console.log('[Socket] Cleanup');
      socket.disconnect();
      socketRef.current = null;
      currentConversationRoomRef.current = null;
    };
  }, [userId]);

  // Join conversation room (leave previous first)
  const joinConversation = (conversationId) => {
    if (!socketRef.current?.connected || !conversationId) return;

    // Leave previous room if exists
    if (currentConversationRoomRef.current) {
      socketRef.current.emit('leave:conversation', currentConversationRoomRef.current);
      console.log('[Socket] Left conversation:', currentConversationRoomRef.current);
    }

    // Join new room
    socketRef.current.emit('join:conversation', conversationId);
    currentConversationRoomRef.current = conversationId;
    console.log('[Socket] Joined conversation:', conversationId);
  };

  // Leave conversation room
  const leaveConversation = () => {
    if (!socketRef.current?.connected || !currentConversationRoomRef.current) return;

    socketRef.current.emit('leave:conversation', currentConversationRoomRef.current);
    console.log('[Socket] Left conversation:', currentConversationRoomRef.current);
    currentConversationRoomRef.current = null;
  };

  // Register event listener
  const on = (event, handler) => {
    if (socketRef.current) {
      socketRef.current.on(event, handler);
    }
  };

  // Unregister event listener
  const off = (event, handler) => {
    if (socketRef.current) {
      socketRef.current.off(event, handler);
    }
  };

  // Emit event
  const emit = (event, data) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    }
  };

  return {
    isConnected,
    on,
    off,
    emit,
    joinConversation,
    leaveConversation
  };
}
