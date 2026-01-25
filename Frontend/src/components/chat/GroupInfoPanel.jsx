import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Button } from '../ui/button';
import { Users, LogOut } from 'lucide-react';
import { Card } from '../ui/card';

export function GroupInfoPanel({ 
  groupName, 
  participants = [], 
  onlineUsers = new Set(),
  onLeaveGroup,
  currentUserId 
}) {
  if (!groupName) return null;

  // Sort participants: online first, then by name
  const sortedParticipants = [...participants].sort((a, b) => {
    const aOnline = onlineUsers.has(a.userId);
    const bOnline = onlineUsers.has(b.userId);
    
    if (aOnline && !bOnline) return -1;
    if (!aOnline && bOnline) return 1;
    return (a.name || '').localeCompare(b.name || '');
  });

  // Count online participants in THIS group
  const onlineCount = participants.filter(p => onlineUsers.has(p.userId)).length;

  return (
    <div className="h-full bg-white border-l border-gray-200 flex flex-col">
      {/* Group Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 mb-3 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
            <Users className="w-10 h-10 text-white" />
          </div>
          
          <h3 className="font-semibold text-gray-800 text-lg mb-1">
            {groupName}
          </h3>
          
          <p className="text-sm text-gray-600 mb-2">
            {participants.length} thành viên
          </p>
          
          <div className="text-sm text-green-600">
            {onlineCount} đang online
          </div>
        </div>
      </div>

      {/* Members List */}
      <div className="flex-1 overflow-y-auto p-4" style={{ minHeight: 0 }}>
        <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Users className="w-4 h-4" />
          Thành viên
        </h4>
        
        <div className="space-y-2">
          {sortedParticipants.map((participant) => {
            const isOnline = onlineUsers.has(participant.userId);
            const isCurrentUser = participant.userId === currentUserId;
            
            return (
              <Card 
                key={participant.userId} 
                className="p-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="w-10 h-10">
                      <AvatarImage 
                        src={participant.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${participant.name}`} 
                        alt={participant.name} 
                      />
                      <AvatarFallback className="bg-gray-100 text-gray-700">
                        {(participant.name || 'U').charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    {/* Online indicator */}
                    <div 
                      className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${
                        isOnline ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                      title={isOnline ? 'Online' : 'Offline'}
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {participant.name || 'Unknown'}
                      {isCurrentUser && (
                        <span className="text-xs text-gray-500 ml-1">(Bạn)</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {participant.role === 'doctor' ? 'Bác sĩ' : 'Bệnh nhân'}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Leave Group Button */}
      <div className="p-4 border-t border-gray-200">
        <Button 
          variant="outline" 
          className="w-full flex items-center justify-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
          onClick={() => {
            console.log('[GroupInfoPanel] Leave group clicked');
            if (onLeaveGroup) {
              onLeaveGroup();
            } else {
              console.error('[GroupInfoPanel] onLeaveGroup prop is not defined!');
            }
          }}
        >
          <LogOut className="w-4 h-4" />
          <span>Rời khỏi nhóm</span>
        </Button>
      </div>
    </div>
  );
}
