import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { formatRelativeTime } from '../../utils/timeFormatter';

export function ChatListItem({ conversation, isActive, onClick, isTyping = false }) {
  const { doctor, lastMessage, lastMessageAt, timestamp, unread, isGroup } = conversation;
  
  // Calculate relative time from lastMessageAt, fallback to timestamp
  const displayTime = lastMessageAt ? formatRelativeTime(lastMessageAt) : timestamp;

  return (
    <div
      onClick={onClick}
      className={`p-4 border-b border-gray-100 cursor-pointer transition-colors hover:bg-gray-50 ${
        isActive ? 'bg-green-50' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Avatar with online status */}
        <div className="relative flex-shrink-0">
          <Avatar className="w-12 h-12">
            <AvatarImage src={doctor.avatar} alt={doctor.name} />
            <AvatarFallback className="bg-green-100 text-green-700">
              {doctor.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          {doctor.status === 'online' && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-1">
            <h3 className="font-semibold text-gray-800 truncate">{doctor.name}</h3>
            <span className="text-xs text-gray-500 ml-2 flex-shrink-0">{displayTime}</span>
          </div>
          
          {!isGroup && (
            <p className="text-sm text-gray-600 mb-1">{doctor.specialty}</p>
          )}
          
          {/* Show typing indicator or last message */}
          {isTyping ? (
            <div className="flex items-center gap-1.5">
              <div className="typing-dot-small"></div>
              <div className="typing-dot-small" style={{ animationDelay: '0.2s' }}></div>
              <div className="typing-dot-small" style={{ animationDelay: '0.4s' }}></div>
              <span className="text-sm text-green-600 italic">Đang nhập…</span>
            </div>
          ) : (
            <p className="text-sm text-gray-500 truncate">{lastMessage}</p>
          )}
        </div>

        {/* Unread badge */}
        {unread > 0 && (
          <div className="bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
            {unread}
          </div>
        )}
      </div>
      
      <style jsx>{`
        .typing-dot-small {
          width: 5px;
          height: 5px;
          background-color: #16a34a;
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
