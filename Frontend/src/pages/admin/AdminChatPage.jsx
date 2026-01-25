import { useState, useEffect, useRef } from 'react';
import { useAdmin } from '../../lib/admin-context';
import { Input } from '../../components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '../../components/ui/avatar';
import { Search, MessageSquare } from 'lucide-react';
import { MessageBubble } from '../../components/chat/MessageBubble';
import { MessageComposer } from '../../components/chat/MessageComposer';
import { TypingIndicator } from '../../components/chat/TypingIndicator';

// Mock data - Danh sách bệnh nhân đang tư vấn
const mockPatientConversations = [
  {
    id: 'patient-001',
    patient: {
      id: 'patient-001',
      name: 'Nguyễn Văn A',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=NguyenVanA',
      type: 'patient' // patient, group, ai
    },
    lastMessage: 'Vâng ạ, em cảm ơn bác sĩ rất nhiều! 🙏',
    timestamp: '09:26',
    unread: 2
  },
  {
    id: 'patient-002',
    patient: {
      id: 'patient-002',
      name: 'Trần Thị B',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TranThiB',
      type: 'patient'
    },
    lastMessage: 'Vâng ạ, em sẽ cố gắng. Nhưng em thấy khó kiểm soát khẩu phần ăn tối lắm ạ.',
    timestamp: '14:35',
    unread: 0
  },
  {
    id: 'patient-003',
    patient: {
      id: 'patient-003',
      name: 'Lê Văn C',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LeVanC',
      type: 'patient'
    },
    lastMessage: 'Vâng ạ, em cũng thấy thế. Em có cần tăng liều insulin không ạ?',
    timestamp: 'Hôm qua',
    unread: 1
  },
  {
    id: 'group-001',
    patient: {
      id: 'group-001',
      name: 'Nhóm Hỗ trợ Tiểu đường Type 2',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DiabetesGroup',
      type: 'group'
    },
    lastMessage: 'Chào mọi người! Hôm nay mình muốn chia sẻ kinh nghiệm...',
    timestamp: '2 giờ',
    unread: 5
  }
];

const mockMessages = {
  'patient-001': [
    {
      id: 'msg-1',
      senderId: 'patient-001',
      senderName: 'Nguyễn Văn A',
      content: 'Chào bác sĩ Hương, em vừa nhận được kết quả xét nghiệm HbA1c là 6.8%. Em muốn hỏi kết quả này có ổn không ạ?',
      timestamp: '09:15',
      isOwn: false
    },
    {
      id: 'msg-2',
      senderId: 'doctor',
      senderName: 'Bạn',
      content: 'Chào bạn! Kết quả HbA1c 6.8% là rất tốt, cho thấy đường huyết của bạn đã được kiểm soát tốt trong 3 tháng qua. Mục tiêu lý tưởng là dưới 7%, và bạn đã đạt được điều đó.',
      timestamp: '09:18',
      isOwn: true
    },
    {
      id: 'msg-3',
      senderId: 'patient-001',
      senderName: 'Nguyễn Văn A',
      content: 'Cảm ơn bác sĩ! Vậy em có cần điều chỉnh liều thuốc không ạ?',
      timestamp: '09:20',
      isOwn: false
    },
    {
      id: 'msg-4',
      senderId: 'doctor',
      senderName: 'Bạn',
      content: 'Hiện tại bạn vẫn duy trì liều Metformin 500mg x 2 lần/ngày. Với kết quả này, chúng ta chưa cần thay đổi. Hãy tiếp tục theo dõi đường huyết hàng ngày và ghi chép vào sổ nhé.',
      timestamp: '09:23',
      isOwn: true
    },
    {
      id: 'msg-5',
      senderId: 'doctor',
      senderName: 'Bạn',
      content: 'Ngoài ra, bạn nhớ khám lại sau 3 tháng để kiểm tra HbA1c và chức năng thận nhé. Tôi sẽ lên lịch hẹn cho bạn.',
      timestamp: '09:24',
      isOwn: true
    },
    {
      id: 'msg-6',
      senderId: 'patient-001',
      senderName: 'Nguyễn Văn A',
      content: 'Vâng ạ, em cảm ơn bác sĩ rất nhiều! 🙏',
      timestamp: '09:26',
      isOwn: false
    }
  ],
  'patient-002': [
    {
      id: 'msg-conv2-1',
      senderId: 'doctor',
      senderName: 'Bạn',
      content: 'Chào bạn! Dựa trên phân tích chế độ ăn tuần trước, tôi thấy bạn cần tăng lượng rau xanh và giảm carbohydrate tinh chế.',
      timestamp: '14:30',
      isOwn: true
    },
    {
      id: 'msg-conv2-2',
      senderId: 'patient-002',
      senderName: 'Trần Thị B',
      content: 'Vâng ạ, em sẽ cố gắng. Nhưng em thấy khó kiểm soát khẩu phần ăn tối lắm ạ.',
      timestamp: '14:35',
      isOwn: false
    }
  ],
  'patient-003': [
    {
      id: 'msg-conv3-1',
      senderId: 'doctor',
      senderName: 'Bạn',
      content: 'Chào bạn, tôi đã xem kết quả xét nghiệm đường huyết lúc đói của bạn. Chỉ số 145 mg/dL hơi cao so với mục tiêu 80-130 mg/dL.',
      timestamp: 'Hôm qua 16:20',
      isOwn: true
    },
    {
      id: 'msg-conv3-2',
      senderId: 'patient-003',
      senderName: 'Lê Văn C',
      content: 'Vâng ạ, em cũng thấy thế. Em có cần tăng liều insulin không ạ?',
      timestamp: 'Hôm qua 16:25',
      isOwn: false
    }
  ],
  'group-001': [
    {
      id: 'msg-group-1',
      senderId: 'admin',
      senderName: 'Quản trị viên',
      content: 'Chào mừng các bạn đến với nhóm Hỗ trợ Tiểu đường Type 2!',
      timestamp: '08:00',
      isOwn: false
    },
    {
      id: 'msg-group-2',
      senderId: 'patient-002',
      senderName: 'Nguyễn Văn A',
      content: 'Chào mọi người! Mình mới tham gia nhóm.',
      timestamp: '09:30',
      isOwn: false
    }
  ]
};

export function AdminChatPage() {
  const { admin } = useAdmin();
  const messagesEndRef = useRef(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('all'); // all, patients, groups, ai
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [conversations, setConversations] = useState(mockPatientConversations);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  // Load messages when patient changes
  useEffect(() => {
    if (selectedPatientId && mockMessages[selectedPatientId]) {
      setMessages(mockMessages[selectedPatientId]);
    } else {
      setMessages([]);
    }
  }, [selectedPatientId]);

  // Auto scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Filter conversations by tab and search
  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.patient.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (selectedTab === 'all') return matchesSearch;
    if (selectedTab === 'patients') return matchesSearch && conv.patient.type === 'patient';
    if (selectedTab === 'groups') return matchesSearch && conv.patient.type === 'group';
    if (selectedTab === 'ai') return matchesSearch && conv.patient.type === 'ai';
    return matchesSearch;
  });

  const selectedConversation = conversations.find(c => c.patient.id === selectedPatientId);

  const handleSendMessage = (content) => {
    if (!content.trim()) return;
    
    const newMessage = {
      id: `msg-${Date.now()}`,
      senderId: admin?.id || 'doctor',
      senderName: 'Bạn',
      content: content,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      isOwn: true
    };

    setMessages(prev => [...prev, newMessage]);

    // Simulate patient typing indicator
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
    }, 2000);
  };

  const handlePatientClick = (patientId) => {
    setSelectedPatientId(patientId);
    // Mark as read
    setConversations(prev =>
      prev.map(conv =>
        conv.patient.id === patientId ? { ...conv, unread: 0 } : conv
      )
    );
  };

  const getPatientTypeLabel = (type) => {
    if (type === 'group') return 'Nhóm';
    if (type === 'ai') return 'AI';
    return 'Bệnh nhân';
  };

  return (
    <div className="h-[calc(100vh-80px)] flex bg-gray-50">
      {/* Left Column - Chat List */}
      <div className="w-96 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Tư vấn y tế</h1>
          
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm..."
              className="pl-10 bg-gray-50 border-gray-200 rounded-xl"
            />
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedTab('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedTab === 'all'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setSelectedTab('patients')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedTab === 'patients'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Bệnh nhân
            </button>
            <button
              onClick={() => setSelectedTab('groups')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedTab === 'groups'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Nhóm
            </button>
            <button
              onClick={() => setSelectedTab('ai')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedTab === 'ai'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              AI
            </button>
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length > 0 ? (
            filteredConversations.map((conv) => (
              <div
                key={conv.patient.id}
                onClick={() => handlePatientClick(conv.patient.id)}
                className={`p-4 border-b border-gray-100 cursor-pointer transition-colors hover:bg-gray-50 ${
                  selectedPatientId === conv.patient.id ? 'bg-green-50' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={conv.patient.avatar} alt={conv.patient.name} />
                    <AvatarFallback className="bg-green-100 text-green-700">
                      {conv.patient.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-semibold text-gray-800 truncate">{conv.patient.name}</h3>
                      <span className="text-xs text-gray-500 ml-2 flex-shrink-0">{conv.timestamp}</span>
                    </div>
                    
                    <p className="text-sm text-gray-500 mb-1">{getPatientTypeLabel(conv.patient.type)}</p>
                    
                    <p className="text-sm text-gray-500 truncate">{conv.lastMessage}</p>
                  </div>

                  {conv.unread > 0 && (
                    <div className="bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                      {conv.unread}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-gray-500">
              <p className="text-sm">Không tìm thấy cuộc trò chuyện</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Column - Chat Content */}
      <div className="flex-1 flex flex-col">
        {selectedPatientId && selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4 flex items-center gap-3 flex-shrink-0">
              <Avatar className="w-10 h-10">
                <AvatarImage src={selectedConversation.patient.avatar} />
                <AvatarFallback className="bg-green-100 text-green-700">
                  {selectedConversation.patient.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="font-semibold text-gray-800">{selectedConversation.patient.name}</h2>
                <p className="text-sm text-gray-500">{getPatientTypeLabel(selectedConversation.patient.type)}</p>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
              {messages.length > 0 ? (
                <>
                  {messages.map((message) => (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      isOwn={message.isOwn}
                    />
                  ))}
                  {isTyping && (
                    <TypingIndicator senderName={selectedConversation.patient.name} />
                  )}
                  <div ref={messagesEndRef} />
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <p className="text-sm">Chưa có tin nhắn nào</p>
                </div>
              )}
            </div>

            {/* Message Input */}
            <MessageComposer onSendMessage={handleSendMessage} />
          </>
        ) : (
          /* Empty State - Default when no chat selected */
          <div className="flex-1 flex items-center justify-center bg-white">
            <div className="text-center">
              <MessageSquare className="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-800 mb-2">Chọn một cuộc trò chuyện</h3>
              <p className="text-sm text-gray-500">Chọn hội thoại bên trái để bắt đầu nhắn tin</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
