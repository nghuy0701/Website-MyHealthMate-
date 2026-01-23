export function TypingIndicator({ senderName }) {
  return (
    <div className="flex justify-start mb-3">
      <div className="max-w-[70%] items-start flex flex-col">
        <span className="text-xs text-gray-500 mb-1 px-1">{senderName}</span>
        <div className="bg-gray-200 text-gray-800 rounded-2xl rounded-bl-sm px-4 py-3">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
