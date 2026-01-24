export function TypingIndicator({ participantName }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="flex gap-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
      </div>
      <span className="text-sm text-gray-500">{participantName} đang soạn tin...</span>
    </div>
  );
}
