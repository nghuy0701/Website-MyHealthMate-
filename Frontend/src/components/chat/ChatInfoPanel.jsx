import { X, Shield, Clock } from 'lucide-react';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

export function ChatInfoPanel({ conversation, onClose, isDoctor }) {
  return (
    <div className="w-[300px] flex-shrink-0 border-l border-gray-200 bg-white flex flex-col">
      {/* Header */}
      <div className="h-16 flex-shrink-0 border-b border-gray-200 px-4 flex items-center justify-between">
        <h2 className="font-medium text-gray-900">Thông tin</h2>
        <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-gray-100">
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* User Info */}
        <div className="flex flex-col items-center mb-6">
          <Avatar className="w-16 h-16 mb-3">
            <AvatarImage src={conversation.participantAvatar} />
            <AvatarFallback className="bg-green-600 text-white text-lg">
              {conversation.participantName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <h3 className="font-medium text-gray-900">{conversation.participantName}</h3>
          {conversation.specialty && (
            <p className="text-sm text-gray-500">{conversation.specialty}</p>
          )}
        </div>

        {/* Status */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className={`w-2 h-2 rounded-full ${conversation.isOnline ? 'bg-green-600' : 'bg-gray-400'}`}></div>
            <div className="text-sm">
              <p className="text-gray-900 font-medium">
                {conversation.isOnline ? 'Đang hoạt động' : 'Ngoại tuyến'}
              </p>
              {!conversation.isOnline && conversation.lastOnline && (
                <p className="text-xs text-gray-500">{conversation.lastOnline}</p>
              )}
            </div>
          </div>
        </div>

        {/* Info Items */}
        <div className="space-y-2 border-t border-gray-200 pt-4">
          {conversation.specialty && (
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="text-gray-500">Chuyên khoa</p>
                <p className="text-gray-900">{conversation.specialty}</p>
              </div>
            </div>
          )}

          {conversation.joinedDate && (
            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="text-gray-500">Tham gia từ</p>
                <p className="text-gray-900">{conversation.joinedDate}</p>
              </div>
            </div>
          )}
        </div>

        {/* Group Members */}
        {conversation.isGroup && conversation.members && (
          <div className="mt-6 border-t border-gray-200 pt-4">
            <h4 className="font-medium text-gray-900 mb-3">Thành viên ({conversation.members.length})</h4>
            <div className="space-y-2">
              {conversation.members.map((member) => (
                <div key={member.id} className="flex items-center gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback className="bg-gray-300 text-xs">
                      {member.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-gray-900">{member.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
