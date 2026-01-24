import { formatTime } from '../../lib/utils';

export function MessageBubble({ message, isOwnMessage }) {
  return (
    <div className={`flex mb-4 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-xs px-4 py-2 rounded-lg ${
          isOwnMessage
            ? 'bg-green-600 text-white'
            : 'bg-gray-200 text-gray-900'
        }`}
      >
        <p className="text-sm break-words">{message.content}</p>
        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-2 space-y-1">
            {message.attachments.map((attachment, idx) => (
              <a
                key={idx}
                href={attachment.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-xs underline block ${
                  isOwnMessage ? 'text-green-100' : 'text-blue-600'
                }`}
              >
                {attachment.name}
              </a>
            ))}
          </div>
        )}
        <p className={`text-xs mt-1 ${isOwnMessage ? 'text-green-100' : 'text-gray-500'}`}>
          {formatTime(message.createdAt)}
        </p>
      </div>
    </div>
  );
}
