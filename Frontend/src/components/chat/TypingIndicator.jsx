/**
 * TypingIndicator - Shows who is typing with animated dots
 * @param {string} senderName - Name or role of person typing (e.g., "Bác sĩ Demo", "Nguyễn Huy")
 * 
 * UI Requirements:
 * - Animated 3 dots before text
 * - Single line: "● ● ● {name} đang soạn tin nhắn..."
 * - Smaller, italic, muted color
 * - Smooth sequential animation
 */
export function TypingIndicator({ senderName }) {
  if (!senderName) return null;
  
  return (
    <div className="flex items-center gap-2 px-4 py-2 mb-2">
      {/* Animated typing dots */}
      <div className="flex items-center gap-1">
        <div className="typing-dot"></div>
        <div className="typing-dot" style={{ animationDelay: '0.2s' }}></div>
        <div className="typing-dot" style={{ animationDelay: '0.4s' }}></div>
      </div>
      
      {/* Typing text */}
      <span className="text-sm text-gray-500 italic">
        {senderName} đang soạn tin nhắn...
      </span>
      
      <style jsx>{`
        .typing-dot {
          width: 6px;
          height: 6px;
          background-color: #9ca3af;
          border-radius: 50%;
          animation: typingDotPulse 1.4s infinite ease-in-out;
        }
        
        @keyframes typingDotPulse {
          0%, 60%, 100% {
            opacity: 0.3;
            transform: scale(0.8);
          }
          30% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
