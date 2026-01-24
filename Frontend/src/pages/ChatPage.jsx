import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router';
import {
  ArrowLeft,
  Search,
  Phone,
  Video,
  MoreVertical,
  UserPlus,
  Users,
  MessageSquare,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useChat } from '../lib/chat-context';
import { useAuth } from '../lib/auth-context';
import { ChatListItem } from '../components/chat/ChatListItem';
import { MessageBubble } from '../components/chat/MessageBubble';
import { TypingIndicator } from '../components/chat/TypingIndicator';
import { MessageComposer } from '../components/chat/MessageComposer';
import { ChatInfoPanel } from '../components/chat/ChatInfoPanel';

/**
 * ChatPage - Main chat interface with 3-column layout (desktop) or mobile view
 */
export function ChatPage() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const {
    conversations,
    activeConversation,
    setActiveConversation,
    sendMessage,
    markAsRead,
    getConversation,
    getMessages,
    isTyping,
  } = useChat();

  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [showInfoPanel, setShowInfoPanel] = useState(true);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 1024);

  // Get user role
  const userRole = (user && user.role) || 'patient';
  const isDoctor = userRole === 'doctor' || userRole === 'admin';
  const isPatient = userRole === 'patient';

  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 1024;
      setIsMobileView(isMobile);
      if (isMobile) setShowInfoPanel(false);
      else setShowInfoPanel(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Check if redirected from MiniChat with doctor selection
    if (location.state && location.state.selectedDoctorId) {
      const doctorConv = conversations.find(
        (c) => c.participantId === location.state.selectedDoctorId
      );
      if (doctorConv) {
        setActiveConversation(doctorConv.id);
        navigate(`/chat/${doctorConv.id}`, { replace: true });
      }
    } else if (conversationId) {
      setActiveConversation(conversationId);
      markAsRead(conversationId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, location.state && location.state.selectedDoctorId]);

  // Filter conversations based on role
  const roleFilteredConversations = conversations.filter((conv) => {
    if (isDoctor) {
      // Doctor sees: patients who requested consultation + groups they created
      return conv.participantRole === 'user' || (conv.isGroup && conv.members && conv.members.some(m => m.id === (user && user.id)));
    } else {
      // Patient sees: doctors they selected + groups they are members of
      return conv.participantRole === 'doctor' || (conv.isGroup && conv.members && conv.members.some(m => m.id === (user && user.id)));
    }
  });

  const filteredConversations = roleFilteredConversations.filter((conv) => {
    const matchesSearch =
      conv.participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (conv.specialty && conv.specialty.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesFilter =
      filter === 'all' ||
      (filter === 'doctor' && conv.participantRole === 'doctor') ||
      (filter === 'ai' && conv.participantRole === 'ai') ||
      (filter === 'group' && conv.isGroup);

    return matchesSearch && matchesFilter;
  });

  const currentConversation = activeConversation ? getConversation(activeConversation) : null;
  const messages = activeConversation ? getMessages(activeConversation) : [];

  const handleConversationClick = (id) => {
    if (isMobileView) {
      navigate(`/chat/${id}`);
    } else {
      setActiveConversation(id);
      markAsRead(id);
      navigate(`/chat/${id}`, { replace: true });
    }
  };

  const handleBackToList = () => {
    setActiveConversation(null);
    navigate('/chat');
  };

  const handleSendMessage = (content, attachments) => {
    if (activeConversation) {
      sendMessage(activeConversation, content, attachments);
    }
  };

  const handleCreateGroup = () => {
    if (!isDoctor) {
      alert('Chỉ bác sĩ mới có thể tạo nhóm.');
      return;
    }
    // In production, open create group dialog
    alert('Tính năng tạo nhóm sẽ được triển khai với backend!');
  };

  // Mobile: Show list or chat based on conversationId
  if (isMobileView) {
    if (conversationId && currentConversation) {
      return (
        <ChatRoomMobile
          conversation={currentConversation}
          messages={messages}
          onBack={handleBackToList}
          onSend={handleSendMessage}
          isTyping={isTyping}
          userId={(user && user.id) || ''}
        />
      );
    }
    return (
      <ChatListMobile
        conversations={filteredConversations}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filter={filter}
        onFilterChange={setFilter}
        onConversationClick={handleConversationClick}
        activeId={activeConversation}
        isDoctor={isDoctor}
        onCreateGroup={handleCreateGroup}
      />
    );
  }

  // Desktop: Three-column layout with FIXED widths to prevent layout shift
  // IMPORTANT: No overlays, no position fixed - just flexbox columns
  // This ensures sidebar and header remain clickable at all times
  return (
    <div className="h-[calc(100vh-64px)] flex bg-gray-50 relative">
      {/* Left: Conversation List - FIXED WIDTH 320px - Always clickable */}
      <div className="w-[320px] flex-shrink-0 border-r border-gray-200 flex flex-col bg-white relative z-10">
        <div className="h-[140px] flex-shrink-0 p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-gray-800">Tư vấn y tế</h1>
            {isDoctor && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCreateGroup}
                className="hover:bg-green-50 transition-colors duration-150"
                title="Tạo nhóm mới"
              >
                <UserPlus className="w-5 h-5 text-green-600" />
              </Button>
            )}
          </div>

          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-xl border-gray-200 transition-colors duration-150"
            />
          </div>

          <Tabs value={filter} onValueChange={(v) => setFilter(v)}>
            <TabsList className="w-full grid grid-cols-4 bg-gray-100">
              <TabsTrigger value="all" className="text-xs">
                Tất cả
              </TabsTrigger>
              <TabsTrigger value="doctor" className="text-xs">
                {isDoctor ? 'Bệnh nhân' : 'Bác sĩ'}
              </TabsTrigger>
              <TabsTrigger value="group" className="text-xs">
                Nhóm
              </TabsTrigger>
              <TabsTrigger value="ai" className="text-xs">
                AI
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400 px-4">
              <MessageSquare className="w-16 h-16 mb-4" />
              <p className="text-center text-sm">
                {isDoctor 
                  ? 'Chưa có bệnh nhân nào yêu cầu tư vấn.'
                  : 'Chưa có cuộc trò chuyện. Hãy kết nối với bác sĩ qua trang Kiến thức.'
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredConversations.map((conv) => (
                <ChatListItem
                  key={conv.id}
                  conversation={conv}
                  isActive={conv.id === activeConversation}
                  onClick={() => handleConversationClick(conv.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Middle: Chat Room - FLEX, NOT overlay - Always allows interaction with other parts */}
      <div className="flex-1 flex flex-col bg-white relative z-0">
        {currentConversation ? (
          <ChatRoomDesktop
            conversation={currentConversation}
            messages={messages}
            onSend={handleSendMessage}
            isTyping={isTyping}
            userId={(user && user.id) || ''}
            onToggleInfo={() => setShowInfoPanel(!showInfoPanel)}
            isDoctor={isDoctor}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <MessageSquare className="w-24 h-24 mb-4 text-gray-300" />
            <h3 className="text-gray-800 mb-2">Chọn một cuộc trò chuyện</h3>
            <p className="text-sm">Chọn hội thoại bên trái để bắt đầu nhắn tin</p>
          </div>
        )}
      </div>

      {/* Right: Info Panel - FIXED WIDTH 300px - Column, not overlay */}
      {showInfoPanel && currentConversation && (
        <div className="relative z-10">
          <ChatInfoPanel
            conversation={currentConversation}
            onClose={() => setShowInfoPanel(false)}
            isDoctor={isDoctor}
          />
        </div>
      )}
    </div>
  );
}

/**
 * ChatListMobile - Mobile chat list view
 */
function ChatListMobile({
  conversations,
  searchQuery,
  onSearchChange,
  filter,
  onFilterChange,
  onConversationClick,
  activeId,
  isDoctor,
  onCreateGroup,
}) {
  return (
    <div className="min-h-screen bg-white relative">
      <div className="h-[140px] flex-shrink-0 p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-gray-800">Tư vấn y tế</h1>
          {isDoctor && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onCreateGroup}
              className="hover:bg-green-50"
            >
              <UserPlus className="w-5 h-5 text-green-600" />
            </Button>
          )}
        </div>

        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Tìm kiếm..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 rounded-xl border-gray-200"
          />
        </div>

        <Tabs value={filter} onValueChange={onFilterChange}>
          <TabsList className="w-full grid grid-cols-4 bg-gray-100">
            <TabsTrigger value="all" className="text-xs">
              Tất cả
            </TabsTrigger>
            <TabsTrigger value="doctor" className="text-xs">
              {isDoctor ? 'Bệnh nhân' : 'Bác sĩ'}
            </TabsTrigger>
            <TabsTrigger value="group" className="text-xs">
              Nhóm
            </TabsTrigger>
            <TabsTrigger value="ai" className="text-xs">
              AI
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="divide-y divide-gray-100">
        {conversations.map((conv) => (
          <ChatListItem
            key={conv.id}
            conversation={conv}
            isActive={conv.id === activeId}
            onClick={() => onConversationClick(conv.id)}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * ChatRoomDesktop - Desktop chat room view
 */
function ChatRoomDesktop({
  conversation,
  messages,
  onSend,
  isTyping,
  userId,
  onToggleInfo,
  isDoctor,
}) {
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    // Scroll only the messages container, not the window
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  return (
    <>
      {/* Header - FIXED HEIGHT 64px - Part of flex column, not overlay */}
      <div className="h-16 flex-shrink-0 border-b border-gray-200 bg-white px-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={conversation.participantAvatar} />
            <AvatarFallback className="bg-green-600 text-white">
              {conversation.isGroup ? <Users className="w-5 h-5" /> : conversation.participantName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-gray-800">{conversation.participantName}</h3>
            {!conversation.isGroup && (
              <p className="text-xs text-gray-500">
                {conversation.isOnline ? (
                  <span className="text-green-600">● Đang online</span>
                ) : (
                  `Hoạt động ${conversation.lastOnline || 'gần đây'}`
                )}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="hover:bg-gray-100">
            <Phone className="w-5 h-5 text-gray-600" />
          </Button>
          <Button variant="ghost" size="icon" className="hover:bg-gray-100">
            <Video className="w-5 h-5 text-gray-600" />
          </Button>
          <Button variant="ghost" size="icon" className="hover:bg-gray-100" onClick={onToggleInfo}>
            <MoreVertical className="w-5 h-5 text-gray-600" />
          </Button>
        </div>
      </div>

      {/* Messages Area - Scrollable container, content only, no blocking */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 p-4 bg-gray-50 overflow-y-auto relative z-0"
      >
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isOwnMessage={msg.senderId === userId}
          />
        ))}
        {isTyping && <TypingIndicator participantName={conversation.participantName} />}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Composer - Fixed at bottom, part of column layout */}
      <div className="relative z-10 bg-white">
        <MessageComposer onSend={onSend} />
      </div>
    </>
  );
}

/**
 * ChatRoomMobile - Mobile chat room view
 */
function ChatRoomMobile({
  conversation,
  messages,
  onBack,
  onSend,
  isTyping,
  userId,
}) {
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    // Scroll only the messages container, not the window
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-white relative">
      {/* Header */}
      <div className="h-16 flex-shrink-0 border-b border-gray-200 px-4 flex items-center gap-3 relative z-10 bg-white">
        <Button variant="ghost" size="icon" onClick={onBack} className="hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <Avatar className="w-10 h-10">
          <AvatarImage src={conversation.participantAvatar} />
          <AvatarFallback className="bg-green-600 text-white">
            {conversation.isGroup ? <Users className="w-5 h-5" /> : conversation.participantName.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="text-gray-800">{conversation.participantName}</h3>
          <p className="text-xs text-gray-500">
            {conversation.isOnline ? (
              <span className="text-green-600">● Đang online</span>
            ) : (
              `Hoạt động ${conversation.lastOnline || 'gần đây'}`
            )}
          </p>
        </div>
        <Button variant="ghost" size="icon" className="hover:bg-gray-100">
          <MoreVertical className="w-5 h-5 text-gray-600" />
        </Button>
      </div>

      {/* Messages - Scrollable container */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 p-4 bg-gray-50 overflow-y-auto relative z-0"
      >
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isOwnMessage={msg.senderId === userId}
          />
        ))}
        {isTyping && <TypingIndicator participantName={conversation.participantName} />}
        <div ref={messagesEndRef} />
      </div>

      {/* Composer - Fixed at bottom */}
      <div className="relative z-10 bg-white">
        <MessageComposer onSend={onSend} />
      </div>
    </div>
  );
}
