export function MessageBubble({ message, isOwn }) {
  const { content, createdAt } = message;

  // Format timestamp to HH:mm
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const messageTime = formatTime(createdAt);

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[70%] flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
        {/* Message Bubble */}
        <div
          className={`rounded-2xl px-4 py-3 shadow-sm ${
            isOwn
              ? 'bg-green-600 text-white rounded-br-sm'
              : 'bg-white text-gray-800 rounded-bl-sm border border-gray-200'
          }`}
        >
          {/* Message Content */}
          <p className={`text-sm whitespace-pre-wrap break-words leading-relaxed ${
            isOwn ? 'text-white' : 'text-gray-800'
          }`}>
            {content}
          </p>
        </div>
        
        {/* Timestamp below bubble */}
        {messageTime && (
          <p className="text-xs text-gray-400 mt-1 px-1">
            {messageTime}
          </p>
        )}
      </div>
    </div>
  );
}
