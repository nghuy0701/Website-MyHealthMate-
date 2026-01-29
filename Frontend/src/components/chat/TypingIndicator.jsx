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
export function TypingIndicator({ senderName = "AI" }) {
  if (!senderName) return null;

  return (
    <div className="flex items-center gap-2 px-4 py-2 mb-2">
      {/* Animated typing dots */}
      <div className="typing-dots" aria-hidden="true">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>

      {/* Typing text (single line) */}
      <span className="text-xs text-gray-500 italic whitespace-nowrap">
        {senderName} đang soạn tin nhắn...
      </span>

      {/* Plain style tag (works in Vite/React) */}
      <style>{`
        .typing-dots {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          line-height: 1;
        }

        .typing-dot {
          width: 6px;
          height: 6px;
          background-color: #9ca3af;
          border-radius: 999px;
          animation: typingDotPulse 1.2s infinite ease-in-out;
          opacity: 0.35;
          transform: scale(0.85);
        }

        .typing-dot:nth-child(2) {
          animation-delay: 0.2s;
        }

        .typing-dot:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes typingDotPulse {
          0%, 70%, 100% {
            opacity: 0.35;
            transform: scale(0.85);
          }
          35% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
