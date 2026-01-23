export function MessageBubble({ message, isOwn }) {
  const { content, timestamp, senderName } = message;

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
        {!isOwn && (
          <span className="text-xs text-gray-500 mb-1 px-1">{senderName}</span>
        )}
        <div
          className={`rounded-2xl px-4 py-2 ${
            isOwn
              ? 'bg-green-600 text-white rounded-br-sm'
              : 'bg-gray-200 text-gray-800 rounded-bl-sm'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap break-words">{content}</p>
          <p
            className={`text-xs mt-1 ${
              isOwn ? 'text-green-100' : 'text-gray-500'
            }`}
          >
            {timestamp}
          </p>
        </div>
      </div>
    </div>
  );
}
