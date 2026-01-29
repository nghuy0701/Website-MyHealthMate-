import { useRef, useCallback } from 'react';

/**
 * Custom hook for managing typing indicator with periodic re-emit
 * 
 * Requirements:
 * - Emit typing:start when user starts typing
 * - Re-emit typing:start every 3 seconds while typing (for users who reload)
 * - Emit typing:stop when input becomes empty or message sent
 * - Prevent flickering by not emitting on every keystroke
 * 
 * @param {Function} emitTypingStart - Socket.io emit function for typing:start
 * @param {Function} emitTypingStop - Socket.io emit function for typing:stop
 * @param {string} conversationId - Current conversation ID
 * @param {string} senderId - Current user ID
 * @param {number} debounceMs - Re-emit interval (default 3000ms)
 */
export function useTypingIndicator(
  emitTypingStart,
  emitTypingStop,
  conversationId,
  senderId,
  debounceMs = 3000
) {
  // Track if user is currently typing (NOT in state to avoid re-renders)
  const isTypingRef = useRef(false);
  
  // Timer for periodic re-emit of typing:start
  const typingIntervalRef = useRef(null);

  /**
   * Call this when user types in the input
   * - First keystroke: emit typing:start and start periodic re-emit
   * - While typing: re-emit every 3 seconds (helps when receiver reloads)
   * - Only stop when explicitly called via stopTyping()
   */
  const handleTyping = useCallback(() => {
    if (!conversationId || !senderId) return;

    // First keystroke - emit typing:start and setup periodic re-emit
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      emitTypingStart(conversationId, senderId);

      // Setup periodic re-emit every 3 seconds
      typingIntervalRef.current = setInterval(() => {
        emitTypingStart(conversationId, senderId);
      }, debounceMs);
    }
  }, [conversationId, senderId, emitTypingStart, debounceMs]);

  /**
   * Call this when user sends a message OR when input becomes empty
   * - Immediately stop typing indicator
   * - Clear periodic re-emit interval
   */
  const stopTyping = useCallback(() => {
    if (!conversationId || !senderId) return;

    // Clear interval (if any)
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }

    // Emit typing:stop if was typing
    if (isTypingRef.current) {
      isTypingRef.current = false;
      emitTypingStop(conversationId, senderId);
    }
  }, [conversationId, senderId, emitTypingStop]);

  /**
   * Cleanup function - call on unmount or conversation change
   */
  const cleanup = useCallback(() => {
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }
    if (isTypingRef.current) {
      isTypingRef.current = false;
      // Don't emit typing:stop on cleanup to avoid unnecessary events
    }
  }, []);

  return {
    handleTyping,
    stopTyping,
    cleanup
  };
}
