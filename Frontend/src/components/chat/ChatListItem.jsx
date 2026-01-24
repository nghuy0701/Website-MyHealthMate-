import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { formatTime } from '../../lib/utils';

export function ChatListItem({ conversation, isActive, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`p-3 cursor-pointer transition-colors duration-150 ${
        isActive ? 'bg-green-50' : 'hover:bg-gray-50'
      }`}
    >
      <div className="flex items-start gap-3">
        <Avatar className="w-10 h-10 flex-shrink-0">
          <AvatarImage src={conversation.participantAvatar} />
          <AvatarFallback className="bg-green-600 text-white text-sm">
            {conversation.participantName.charAt(0)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3 className="font-medium text-gray-900 truncate">
              {conversation.participantName}
            </h3>
            <span className="text-xs text-gray-500 flex-shrink-0">
              {formatTime(conversation.lastMessageTime)}
            </span>
          </div>

          <p className="text-sm text-gray-600 truncate">
            {conversation.lastMessage || 'Không có tin nhắn'}
          </p>

          {conversation.unreadCount > 0 && (
            <div className="mt-1 flex items-center">
              <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-green-600 rounded-full">
                {conversation.unreadCount}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
