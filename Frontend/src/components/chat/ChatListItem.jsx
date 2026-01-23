import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';

export function ChatListItem({ conversation, isActive, onClick }) {
  const { doctor, lastMessage, timestamp, unread, isGroup } = conversation;

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
            <span className="text-xs text-gray-500 ml-2 flex-shrink-0">{timestamp}</span>
          </div>
          
          {!isGroup && (
            <p className="text-sm text-gray-600 mb-1">{doctor.specialty}</p>
          )}
          
          <p className="text-sm text-gray-500 truncate">{lastMessage}</p>
        </div>

        {/* Unread badge */}
        {unread > 0 && (
          <div className="bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
            {unread}
          </div>
        )}
      </div>
    </div>
  );
}
