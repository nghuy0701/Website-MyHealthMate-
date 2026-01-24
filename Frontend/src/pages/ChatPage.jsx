import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../lib/auth-context';
import { useNotificationStore } from '../lib/useNotificationStore';
import { chatAPI, predictionAPI } from '../lib/api';
import { useSocket } from '../lib/useSocket';
import { useTypingIndicator } from '../lib/useTypingIndicator';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { Search, Phone, Video, MoreVertical } from 'lucide-react';
import { ChatListItem } from '../components/chat/ChatListItem';
import { MessageBubble } from '../components/chat/MessageBubble';
import { MessageComposer } from '../components/chat/MessageComposer';
import { ChatInfoPanel } from '../components/chat/ChatInfoPanel';
import { TypingIndicator } from '../components/chat/TypingIndicator';

// Mock data for PATIENTS viewing DOCTORS
const mockPatientConversations = [
  {
    id: 'conv-1',
    doctor: {
      id: 'doc-noi-tiet-001',
      name: 'BS.CKI Nguyễn Thị Hương',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=NguyenThiHuong',
      status: 'online',
      specialty: 'Bác sĩ Nội tiết - Đái tháo đường'
    },
    lastMessage: 'Chỉ số HbA1c của bạn đã cải thiện rất tốt. Hãy duy trì chế độ này nhé.',
    timestamp: '10 phút',
    unread: 0
  },
  {
    id: 'conv-2',
    doctor: {
      id: 'doc-dinh-duong-002',
      name: 'CN. Lê Minh Tuấn',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LeMinhTuan',
      status: 'online',
      specialty: 'Chuyên gia Dinh dưỡng'
    },
    lastMessage: 'Thực đơn tuần này tôi đã gửi cho bạn. Hãy theo dõi và ghi chép lại cảm nhận nhé.',
    timestamp: '2 giờ',
    unread: 1
  },
  {
    id: 'conv-3',
    doctor: {
      id: 'doc-noi-tiet-003',
      name: 'TS.BS Phạm Đức Minh',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=PhamDucMinh',
      status: 'offline',
      specialty: 'Tiến sĩ Nội tiết - Chuyên gia Đái tháo đường'
    },
    lastMessage: 'Kết quả xét nghiệm cho thấy cần điều chỉnh liều insulin. Tôi sẽ gọi cho bạn chiều nay.',
    timestamp: '1 ngày',
    unread: 0
  },
  {
    id: 'conv-4',
    doctor: {
      id: 'group-support-001',
      name: 'Nhóm Hỗ trợ Tiểu đường Type 2',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DiabetesGroup',
      status: 'online',
      specialty: 'Cộng đồng bệnh nhân',
      isGroup: true
    },
    lastMessage: 'Chào mọi người! Hôm nay mình muốn chia sẻ kinh nghiệm kiểm soát đường huyết...',
    timestamp: '5 giờ',
    unread: 3,
    isGroup: true
  }
];

// Mock data for DOCTORS viewing PATIENTS
const mockDoctorConversations = [
  {
    id: 'conv-p1',
    doctor: {
      id: 'patient-001',
      name: 'Nguyễn Văn An',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=NguyenVanAn',
      status: 'online',
      specialty: 'Bệnh nhân Tiểu đường Type 2'
    },
    lastMessage: 'Cảm ơn bác sĩ! Em sẽ tuân thủ theo chỉ định của bác sĩ.',
    timestamp: '5 phút',
    unread: 2
  },
  {
    id: 'conv-p2',
    doctor: {
      id: 'patient-002',
      name: 'Trần Thị Bình',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TranThiBinh',
      status: 'online',
      specialty: 'Bệnh nhân Tiểu đường Type 1'
    },
    lastMessage: 'Bác sĩ ơi, em đo đường huyết sáng nay là 135 mg/dL có cao không ạ?',
    timestamp: '15 phút',
    unread: 1
  },
  {
    id: 'conv-p3',
    doctor: {
      id: 'patient-003',
      name: 'Lê Minh Châu',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LeMinhChau',
      status: 'offline',
      specialty: 'Bệnh nhân Tiểu đường thai kỳ'
    },
    lastMessage: 'Em cảm ơn bác sĩ đã tư vấn. Em sẽ theo dõi và báo cáo lại.',
    timestamp: '1 giờ',
    unread: 0
  },
  {
    id: 'conv-p4',
    doctor: {
      id: 'patient-004',
      name: 'Phạm Hoàng Dũng',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=PhamHoangDung',
      status: 'online',
      specialty: 'Bệnh nhân Tiền tiểu đường'
    },
    lastMessage: 'Chào bác sĩ, kết quả xét nghiệm HbA1c của con là 6.2%. Xin bác sĩ tư vấn.',
    timestamp: '3 giờ',
    unread: 1
  }
];

const mockMessages = {
  'conv-1': [
    {
      id: 'msg-1',
      senderId: 'patient-001',
      senderName: 'Bạn',
      content: 'Chào bác sĩ Hương, em vừa nhận được kết quả xét nghiệm HbA1c là 6.8%. Em muốn hỏi kết quả này có ổn không ạ?',
      timestamp: '09:15',
      isOwn: true
    },
    {
      id: 'msg-2',
      senderId: 'doc-noi-tiet-001',
      senderName: 'BS.CKI Nguyễn Thị Hương',
      content: 'Chào bạn! Kết quả HbA1c 6.8% là rất tốt, cho thấy đường huyết của bạn đã được kiểm soát tốt trong 3 tháng qua. Mục tiêu lý tưởng là dưới 7%, và bạn đã đạt được điều đó.',
      timestamp: '09:18',
      isOwn: false
    },
    {
      id: 'msg-3',
      senderId: 'patient-001',
      senderName: 'Bạn',
      content: 'Cảm ơn bác sĩ! Vậy em có cần điều chỉnh liều thuốc không ạ?',
      timestamp: '09:20',
      isOwn: true
    },
    {
      id: 'msg-4',
      senderId: 'doc-noi-tiet-001',
      senderName: 'BS.CKI Nguyễn Thị Hương',
      content: 'Hiện tại bạn vẫn duy trì liều Metformin 500mg x 2 lần/ngày. Với kết quả này, chúng ta chưa cần thay đổi. Hãy tiếp tục theo dõi đường huyết hàng ngày và ghi chép vào sổ nhé.',
      timestamp: '09:23',
      isOwn: false
    },
    {
      id: 'msg-5',
      senderId: 'doc-noi-tiet-001',
      senderName: 'BS.CKI Nguyễn Thị Hương',
      content: 'Ngoài ra, bạn nhớ khám lại sau 3 tháng để kiểm tra HbA1c và chức năng thận nhé. Tôi sẽ lên lịch hẹn cho bạn.',
      timestamp: '09:24',
      isOwn: false
    },
    {
      id: 'msg-6',
      senderId: 'patient-001',
      senderName: 'Bạn',
      content: 'Vâng ạ, em cảm ơn bác sĩ rất nhiều! 🙏',
      timestamp: '09:26',
      isOwn: true
    },
    {
      id: 'msg-7',
      senderId: 'doc-noi-tiet-001',
      senderName: 'BS.CKI Nguyễn Thị Hương',
      content: 'Chỉ số HbA1c của bạn đã cải thiện rất tốt. Hãy duy trì chế độ này nhé.',
      timestamp: '09:28',
      isOwn: false
    }
  ],
  'conv-2': [
    {
      id: 'msg-conv2-1',
      senderId: 'doc-dinh-duong-002',
      senderName: 'CN. Lê Minh Tuấn',
      content: 'Chào bạn! Dựa trên phân tích chế độ ăn tuần trước, tôi thấy bạn cần tăng lượng rau xanh và giảm carbohydrate tinh chế.',
      timestamp: '14:30',
      isOwn: false
    },
    {
      id: 'msg-conv2-2',
      senderId: 'patient-001',
      senderName: 'Bạn',
      content: 'Vâng ạ, em sẽ cố gắng. Nhưng em thấy khó kiểm soát khẩu phần ăn tối lắm ạ.',
      timestamp: '14:35',
      isOwn: true
    },
    {
      id: 'msg-conv2-3',
      senderId: 'doc-dinh-duong-002',
      senderName: 'CN. Lê Minh Tuấn',
      content: 'Tôi hiểu. Bữa tối nên ăn trước 19h và không nên quá no. Tôi sẽ gửi cho bạn 5 mẫu thực đơn bữa tối phù hợp, mỗi món đều có chi tiết về lượng calo và chỉ số đường.',
      timestamp: '14:38',
      isOwn: false
    },
    {
      id: 'msg-conv2-4',
      senderId: 'doc-dinh-duong-002',
      senderName: 'CN. Lê Minh Tuấn',
      content: 'Thực đơn tuần này tôi đã gửi cho bạn. Hãy theo dõi và ghi chép lại cảm nhận nhé.',
      timestamp: '14:40',
      isOwn: false
    }
  ],
  'conv-3': [
    {
      id: 'msg-conv3-1',
      senderId: 'doc-noi-tiet-003',
      senderName: 'TS.BS Phạm Đức Minh',
      content: 'Chào bạn, tôi đã xem kết quả xét nghiệm đường huyết lúc đói của bạn. Chỉ số 145 mg/dL hơi cao so với mục tiêu 80-130 mg/dL.',
      timestamp: 'Hôm qua 16:20',
      isOwn: false
    },
    {
      id: 'msg-conv3-2',
      senderId: 'patient-001',
      senderName: 'Bạn',
      content: 'Vâng ạ, em cũng thấy thế. Em có cần tăng liều insulin không ạ?',
      timestamp: 'Hôm qua 16:25',
      isOwn: true
    },
    {
      id: 'msg-conv3-3',
      senderId: 'doc-noi-tiet-003',
      senderName: 'TS.BS Phạm Đức Minh',
      content: 'Kết quả xét nghiệm cho thấy cần điều chỉnh liều insulin. Tôi sẽ gọi cho bạn chiều nay.',
      timestamp: 'Hôm qua 16:30',
      isOwn: false
    }
  ],
  'conv-4': [
    {
      id: 'msg-group-1',
      senderId: 'admin-group',
      senderName: 'Quản trị viên',
      content: 'Chào mừng các bạn đến với nhóm Hỗ trợ Tiểu đường Type 2! Đây là nơi chia sẻ kinh nghiệm và hỗ trợ lẫn nhau trong hành trình kiểm soát bệnh.',
      timestamp: '08:00',
      isOwn: false
    },
    {
      id: 'msg-group-2',
      senderId: 'patient-002',
      senderName: 'Nguyễn Văn A',
      content: 'Chào mọi người! Mình mới tham gia nhóm. Mình bị tiểu đường type 2 được 2 năm rồi.',
      timestamp: '09:30',
      isOwn: false
    },
    {
      id: 'msg-group-3',
      senderId: 'patient-001',
      senderName: 'Bạn',
      content: 'Chào bạn! Mình cũng vậy. Kiểm soát đường huyết đều đặn là quan trọng nhất nhé!',
      timestamp: '10:15',
      isOwn: true
    },
    {
      id: 'msg-group-4',
      senderId: 'patient-003',
      senderName: 'Trần Thị B',
      content: 'Mình thấy tập thể dục đều đặn giúp kiểm soát đường huyết tốt lắm. Ai cũng tập thì chia sẻ kinh nghiệm nhé!',
      timestamp: '11:45',
      isOwn: false
    },
    {
      id: 'msg-group-5',
      senderId: 'patient-004',
      senderName: 'Lê Văn C',
      content: 'Chào mọi người! Hôm nay mình muốn chia sẻ kinh nghiệm kiểm soát đường huyết...',
      timestamp: '13:20',
      isOwn: false
    }
  ]
};

const mockPatientHistory = [
  { title: 'Dự đoán nguy cơ tiểu đường - Kết quả: Nguy cơ cao', date: '20/01/2026' },
  { title: 'Xét nghiệm HbA1c: 6.8%', date: '15/01/2026' },
  { title: 'Đo đường huyết lúc đói: 112 mg/dL', date: '10/01/2026' },
  { title: 'Khám định kỳ - BS.CKI Nguyễn Thị Hương', date: '05/01/2026' },
  { title: 'Xét nghiệm chức năng thận', date: '28/12/2025' }
];

export function ChatPage() {
  const { user } = useAuth();
  const setCurrentConversationId = useNotificationStore(state => state.setCurrentConversationId);
  const messagesContainerRef = useRef(null);
  const typingTimeoutsRef = useRef({}); // Track auto-clear timeouts per conversation
  
  // Branch logic by user role
  const isDoctor = user?.role === 'doctor';
  
  console.log('[ChatPage] Component render - user role:', user?.role, 'isDoctor:', isDoctor);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [conversations, setConversations] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [typingUserId, setTypingUserId] = useState(null); // Store userId of person typing in selected conversation
  const [isLocalUserTyping, setIsLocalUserTyping] = useState(false); // Track if current user is typing
  const [typingConversations, setTypingConversations] = useState({}); // Track typing per conversation: { conversationId: senderId }
  const [patientHistory, setPatientHistory] = useState([]); // Prediction history for selected patient (doctor view)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false); // Loading state for prediction history
  const [selectedPrediction, setSelectedPrediction] = useState(null); // Selected prediction for detail modal
  const [isPredictionModalOpen, setIsPredictionModalOpen] = useState(false); // Modal visibility

  // Get userId early - needed by callbacks below
  const userId = user?._id?.toString() || user?.id?.toString();
  
  // Update notification context with current conversation ID
  useEffect(() => {
    setCurrentConversationId(selectedConversationId);
  }, [selectedConversationId, setCurrentConversationId]);
  
  console.log('[ChatPage] userId:', userId, 'conversations length:', conversations.length, 'selectedConversationId:', selectedConversationId);

  // Socket.io handlers
  const handleNewMessage = useCallback((data) => {
    console.log('[ChatPage] Received new message:', data);
    
    // Update conversations list with new last message and increment unread
    setConversations(prev => prev.map(conv => {
      if (conv.id === data.conversationId.toString()) {
        return {
          ...conv,
          lastMessage: data.content,
          lastMessageAt: data.createdAt, // Store timestamp for relative time
          timestamp: formatTimestamp(new Date(data.createdAt).getTime()),
          // Increment unread ONLY if this is not the currently selected conversation
          // or if the message is from someone else (not own message)
          unread: (data.conversationId.toString() === selectedConversationId && data.senderId === userId) 
            ? conv.unread 
            : (conv.unread || 0) + 1
        };
      }
      return conv;
    }));
    
    // Only add message if it's for the current conversation
    if (data.conversationId.toString() === selectedConversationId) {
      const newMessage = {
        id: data.messageId,
        conversationId: data.conversationId,
        senderId: data.senderId,
        senderName: data.senderRole === 'doctor' ? 'Bác sĩ' : 'Bệnh nhân',
        senderRole: data.senderRole,
        content: data.content,
        createdAt: data.createdAt,
        isOwn: data.senderId === userId // Check if it's own message
      };
      setMessages(prev => [...prev, newMessage]);
      setTypingUserId(null); // Hide typing indicator when message arrives
      
      // If viewing this conversation, mark as read immediately
      if (data.senderId !== userId) {
        markConversationAsRead(data.conversationId.toString());
      }
      
      // Scroll to bottom when receiving new message
      setTimeout(() => scrollToBottom(), 100);
    }
  }, [selectedConversationId, userId]);

  const handleTypingStart = useCallback((data) => {
    // data = { senderId, conversationId }
    console.log('[ChatPage] Received typing:start', data);
    
    // Don't track typing for own messages
    if (data.senderId !== userId) {
      // Update typing for selected conversation (for message area)
      if (data.conversationId === selectedConversationId) {
        setTypingUserId(data.senderId);
        console.log('[ChatPage] Set typing user in chat:', data.senderId);
      }
      
      // Update typing for conversation list (for all conversations)
      setTypingConversations(prev => ({
        ...prev,
        [data.conversationId]: data.senderId
      }));
      console.log('[ChatPage] Set typing in conversation list:', data.conversationId, data.senderId);
      
      // Clear any existing timeout for this conversation
      if (typingTimeoutsRef.current[data.conversationId]) {
        clearTimeout(typingTimeoutsRef.current[data.conversationId]);
      }
      
      // Set new timeout to auto-clear after 5 seconds of inactivity
      typingTimeoutsRef.current[data.conversationId] = setTimeout(() => {
        console.log('[ChatPage] Auto-clearing typing indicator for:', data.conversationId);
        
        // Clear typing for selected conversation
        if (data.conversationId === selectedConversationId) {
          setTypingUserId(null);
        }
        
        // Clear typing for conversation list
        setTypingConversations(prev => {
          const updated = { ...prev };
          delete updated[data.conversationId];
          return updated;
        });
        
        // Clean up timeout reference
        delete typingTimeoutsRef.current[data.conversationId];
      }, 5000); // 5 seconds timeout
    }
  }, [selectedConversationId, userId]);

  const handleTypingStop = useCallback((data) => {
    // data = { senderId, conversationId }
    console.log('[ChatPage] Received typing:stop', data);
    
    // Clear the auto-clear timeout since typing stopped explicitly
    if (typingTimeoutsRef.current[data.conversationId]) {
      clearTimeout(typingTimeoutsRef.current[data.conversationId]);
      delete typingTimeoutsRef.current[data.conversationId];
    }
    
    // Clear typing for selected conversation (for message area)
    if (data.conversationId === selectedConversationId) {
      if (data.senderId === typingUserId) {
        setTypingUserId(null);
        console.log('[ChatPage] Cleared typing indicator in chat');
      }
    }
    
    // Clear typing for conversation list
    setTypingConversations(prev => {
      const updated = { ...prev };
      if (updated[data.conversationId] === data.senderId) {
        delete updated[data.conversationId];
        console.log('[ChatPage] Cleared typing in conversation list:', data.conversationId);
      }
      return updated;
    });
  }, [selectedConversationId, typingUserId]);

  // Initialize Socket.io
  const { isConnected, emitTypingStart, emitTypingStop, joinConversation, leaveConversation } = useSocket(
    userId,
    handleNewMessage,
    handleTypingStart,
    handleTypingStop
  );

  // Initialize typing indicator controller with 3000ms re-emit interval
  const { handleTyping, stopTyping, cleanup } = useTypingIndicator(
    emitTypingStart,
    emitTypingStop,
    selectedConversationId,
    userId,
    3000 // Re-emit typing:start every 3 seconds
  );

  // Cleanup typing indicator when conversation changes
  useEffect(() => {
    return () => cleanup();
  }, [selectedConversationId, cleanup]);

  // Cleanup all typing timeouts on component unmount
  useEffect(() => {
    return () => {
      // Clear all typing timeouts
      Object.values(typingTimeoutsRef.current).forEach(timeout => {
        clearTimeout(timeout);
      });
      typingTimeoutsRef.current = {};
      console.log('[ChatPage] Cleared all typing timeouts on unmount');
    };
  }, []);

  // Join ALL conversation rooms when page loads (for conversation list typing indicators)
  useEffect(() => {
    if (conversations.length > 0 && isConnected) {
      // Join all conversation rooms
      conversations.forEach(conv => {
        if (conv.id && conv.id !== 'new') {
          joinConversation(conv.id);
          console.log('[ChatPage] Joined conversation room for list:', conv.id);
        }
      });
      
      // Leave all rooms on cleanup (page unmount)
      return () => {
        conversations.forEach(conv => {
          if (conv.id && conv.id !== 'new') {
            leaveConversation(conv.id);
            console.log('[ChatPage] Left conversation room on unmount:', conv.id);
          }
        });
      };
    }
  }, [conversations, isConnected, joinConversation, leaveConversation]);

  // Join selected conversation room (defensive - already joined above, but ensures connection)
  useEffect(() => {
    if (selectedConversationId && selectedConversationId !== 'new' && isConnected) {
      // Re-join the conversation room (in case it wasn't in the list yet)
      joinConversation(selectedConversationId);
      console.log('[ChatPage] Ensured joined for selected conversation:', selectedConversationId);
    }
  }, [selectedConversationId, isConnected, joinConversation]);

  // Debug log
  useEffect(() => {
    console.log('[ChatPage] User:', user);
    console.log('[ChatPage] User ID for Socket:', userId);
    console.log('[ChatPage] Socket connected:', isConnected);
  }, [user, userId, isConnected]);

  // Load conversations based on role
  useEffect(() => {
    loadConversations();
  }, [isDoctor]);

  // Fetch prediction history for patient view only
  useEffect(() => {
    // Skip for doctor view
    if (isDoctor) {
      return;
    }
    
    console.log('[ChatPage] Prediction history useEffect called with deps:', {
      isDoctor,
      selectedConversationId,
      conversationsLength: conversations.length,
      userId
    });
    
    const fetchPredictionHistory = async () => {
      // Skip if no conversation selected or conversations not loaded yet
      if (!selectedConversationId) {
        console.log('[ChatPage] Skipping - no conversation selected');
        setPatientHistory([]);
        return;
      }
      
      if (conversations.length === 0) {
        console.log('[ChatPage] Skipping - conversations not loaded yet');
        return;
      }
      
      // Get current selected conversation
      const currentConversation = conversations.find(c => c.id === selectedConversationId);
      
      console.log('[ChatPage] Prediction history effect triggered:', {
        isDoctor,
        userId,
        selectedConversationId,
        hasConversation: !!currentConversation,
        conversationsLength: conversations.length,
        currentConversation
      });
      
      if (!currentConversation) {
        console.log('[ChatPage] No conversation found for ID:', selectedConversationId);
        setPatientHistory([]);
        return;
      }

      let targetPatientId;
      
      // Patient viewing own history: use current user's ID
      targetPatientId = userId;
      console.log('[ChatPage] Patient view - own ID:', targetPatientId);
      
      if (!targetPatientId) {
        console.log('[ChatPage] No valid patientId found');
        setPatientHistory([]);
        return;
      }
      
      try {
        setIsLoadingHistory(true);
        console.log('[ChatPage] Fetching prediction history for patient:', targetPatientId);
        
        // Use getMyPredictions for patient view
        const response = await predictionAPI.getMyPredictions();
          
        console.log('[ChatPage] API response:', response);
        console.log('[ChatPage] API response.data:', response.data);
        console.log('[ChatPage] API response.data type:', Array.isArray(response.data), 'length:', response.data?.length);
        const predictions = response.data || [];
        
        // Transform predictions to history format
        const formattedHistory = predictions.map(pred => ({
          predictionId: pred._id,
          title: `Dự đoán nguy cơ tiểu đường - ${pred.result === 'positive' ? 'Nguy cơ cao' : 'Nguy cơ thấp'}`,
          date: new Date(pred.createdAt).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          })
        }));
        
        setPatientHistory(formattedHistory);
        console.log('[ChatPage] Loaded prediction history:', formattedHistory.length, 'items');
      } catch (err) {
        console.error('[ChatPage] Error loading prediction history:', err);
        setPatientHistory([]); // Clear on error
      } finally {
        setIsLoadingHistory(false);
      }
    };

    fetchPredictionHistory();
  }, [isDoctor, selectedConversationId, conversations, userId]); // Add back conversations as dependency

  const loadConversations = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (isDoctor) {
        // Load doctor's inbox
        const response = await chatAPI.getDoctorInbox();
        const inbox = response.data || [];
        
        // Transform to match UI structure
        const transformedConversations = inbox.map(conv => ({
          id: conv.conversationId.toString(),
          doctor: {
            id: conv.patientId.toString(),
            name: conv.patientName,
            avatar: conv.patientAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${conv.patientName}`,
            status: 'online', // Can be enhanced with real status later
            specialty: 'Bệnh nhân'
          },
          lastMessage: conv.lastMessage,
          lastMessageAt: conv.lastMessageAt, // Store for relative time calculation
          timestamp: formatTimestamp(conv.lastMessageAt),
          unread: conv.unreadCount || 0
        }));
        
        setConversations(transformedConversations);
      } else {
        // Load patient's conversation
        const response = await chatAPI.getPatientConversation();
        const conv = response.data;
        
        if (conv && conv.hasConversation) {
          const transformedConversation = {
            id: conv.conversationId.toString(),
            doctor: {
              id: conv.doctorId.toString(),
              name: conv.doctorName,
              avatar: conv.doctorAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${conv.doctorName}`,
              status: 'online',
              specialty: conv.doctorSpecialty || 'Bác sĩ'
            },
            lastMessage: conv.lastMessage,
            lastMessageAt: conv.lastMessageAt, // Store for relative time calculation
            timestamp: formatTimestamp(conv.lastMessageAt),
            unread: conv.unreadCount || 0
          };
          setConversations([transformedConversation]);
        } else if (conv && !conv.hasConversation) {
          // Doctor assigned but no messages yet
          const transformedConversation = {
            id: 'new',
            doctor: {
              id: conv.doctorId.toString(),
              name: conv.doctorName,
              avatar: conv.doctorAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${conv.doctorName}`,
              status: 'online',
              specialty: conv.doctorSpecialty || 'Bác sĩ'
            },
            lastMessage: 'Bắt đầu cuộc trò chuyện với bác sĩ',
            timestamp: 'Mới',
            unread: 0
          };
          setConversations([transformedConversation]);
        } else {
          // No assigned doctor
          setConversations([]);
          setError('Bạn chưa được phân công bác sĩ. Vui lòng liên hệ quản trị viên.');
        }
      }
    } catch (err) {
      console.error('Error loading conversations:', err);
      setError(err.message || 'Không thể tải danh sách cuộc trò chuyện');
      setConversations([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Format timestamp helper
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút`;
    if (hours < 24) return `${hours} giờ`;
    if (days === 1) return 'Hôm qua';
    return `${days} ngày`;
  };
  
  // Mark conversation as read (clear unread badge)
  const markConversationAsRead = async (conversationId) => {
    try {
      // Immediately update UI - don't wait for server
      setConversations(prev => prev.map(conv => 
        conv.id === conversationId ? { ...conv, unread: 0 } : conv
      ));
      
      // Send to server in background (fire and forget)
      await chatAPI.markAsRead(conversationId);
      console.log('[ChatPage] Marked conversation as read:', conversationId);
    } catch (err) {
      console.error('[ChatPage] Error marking as read:', err);
      // Don't revert UI - user experience is more important
    }
  };

  // Load messages when conversation changes
  useEffect(() => {
    if (selectedConversationId && selectedConversationId !== 'new') {
      loadMessages(selectedConversationId);
    } else {
      setMessages([]);
    }
  }, [selectedConversationId]);

  const loadMessages = async (conversationId, shouldScroll = false) => {
    try {
      const response = await chatAPI.getMessages(conversationId);
      const loadedMessages = response.data || [];
      setMessages(loadedMessages);
      
      // Only scroll if explicitly requested (e.g., after sending message)
      if (shouldScroll) {
        setTimeout(() => scrollToBottom(), 100);
      }
    } catch (err) {
      console.error('Error loading messages:', err);
      setMessages([]);
    }
  };

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  // Filter conversations
  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.doctor.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (selectedFilter === 'all') return matchesSearch;
    if (selectedFilter === 'doctors') return matchesSearch && !conv.isGroup;
    if (selectedFilter === 'groups') return matchesSearch && conv.isGroup;
    return matchesSearch;
  });

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);

  // Get display name for typing user
  const getTypingUserName = () => {
    if (!typingUserId) {
      console.log('[ChatPage] No typingUserId');
      return null;
    }
    
    console.log('[ChatPage] Computing typing user name:', {
      typingUserId,
      typingUserIdType: typeof typingUserId,
      selectedConversationDoctorId: selectedConversation?.doctor?.id,
      doctorIdType: typeof selectedConversation?.doctor?.id,
      selectedConversationDoctorName: selectedConversation?.doctor?.name,
      isDoctor,
      idsMatch: selectedConversation?.doctor?.id === typingUserId,
      idsMatchStrict: selectedConversation?.doctor?.id?.toString() === typingUserId?.toString()
    });
    
    // In doctor-patient chat, the typing user is the conversation partner
    // Convert both IDs to strings for comparison
    const doctorIdStr = selectedConversation?.doctor?.id?.toString();
    const typingUserIdStr = typingUserId?.toString();
    
    if (doctorIdStr === typingUserIdStr) {
      // Return actual name from database
      const name = selectedConversation.doctor.name;
      
      if (isDoctor) {
        // Doctor viewing patient - return patient name
        console.log('[ChatPage] Returning patient name:', name);
        return name;
      } else {
        // Patient viewing doctor - return "Bác sĩ <doctor name>"
        console.log('[ChatPage] Returning doctor name:', name);
        return `Bác sĩ ${name}`;
      }
    }
    
    console.log('[ChatPage] IDs do not match, returning null');
    return null;
  };

  const typingUserName = getTypingUserName();
  console.log('[ChatPage] Final typing user name:', typingUserName);

  const handleSendMessage = async (content) => {
    if (!content.trim()) return;
    
    try {
      // Stop typing indicator immediately when sending
      stopTyping();
      setIsLocalUserTyping(false); // Clear local typing state

      // Prepare message data
      const messageData = {
        content: content.trim()
      };

      // Doctor needs to provide conversationId
      if (isDoctor && selectedConversationId) {
        messageData.conversationId = selectedConversationId;
      }

      // Send message via API
      const response = await chatAPI.sendMessage(messageData);
      
      // Get the conversation ID (might be new for patient's first message)
      const currentConversationId = response.data.conversationId.toString();
      
      // If this was a new conversation for patient, update the conversation ID
      if (selectedConversationId === 'new') {
        setSelectedConversationId(currentConversationId);
      }

      // Reload messages to show the new message and scroll to bottom
      await loadMessages(currentConversationId, true);
      
      // Reload conversations list to update last message and timestamp
      loadConversations();
    } catch (error) {
      console.error('Error sending message:', error);
      alert(error.message || 'Không thể gửi tin nhắn. Vui lòng thử lại.');
    }
  };

  // Called from MessageComposer when input changes
  // inputLength: number of characters in input
  const handleTypingChange = (inputLength) => {
    if (!selectedConversationId || selectedConversationId === 'new') return;
    
    // Update local typing state IMMEDIATELY (for instant UI)
    const isTyping = inputLength > 0;
    setIsLocalUserTyping(isTyping);
    
    // Emit socket events with debounce (to reduce network traffic)
    if (isTyping) {
      handleTyping(); // Debounced typing:start
    } else {
      stopTyping(); // Immediate typing:stop when input is empty
    }
  };

  const handleConversationClick = (convId) => {
    setSelectedConversationId(convId);
    
    // Clear unread badge immediately when opening conversation
    if (convId && convId !== 'new') {
      markConversationAsRead(convId);
    }
  };

  // Handle prediction click - show detail modal
  const handlePredictionClick = async (predictionId) => {
    if (!predictionId) return;
    
    try {
      console.log('[ChatPage] Fetching prediction detail:', predictionId);
      const response = await predictionAPI.getById(predictionId);
      const prediction = response.data;
      
      setSelectedPrediction(prediction);
      setIsPredictionModalOpen(true);
      console.log('[ChatPage] Prediction detail loaded:', prediction);
    } catch (err) {
      console.error('[ChatPage] Error loading prediction detail:', err);
    }
  };

  const closePredictionModal = () => {
    setIsPredictionModalOpen(false);
    setSelectedPrediction(null);
  };

  return (
    <div className="h-[calc(100vh-64px)] flex bg-gray-50">
      {/* Left Sidebar - Conversation List */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            {isDoctor ? 'Tư vấn bệnh nhân' : 'Tư vấn y tế'}
          </h1>
          
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

          {/* Filters */}
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedFilter === 'all'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setSelectedFilter('doctors')}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedFilter === 'doctors'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {isDoctor ? 'Bệnh nhân' : 'Bác sĩ'}
            </button>
            <button
              onClick={() => setSelectedFilter('groups')}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedFilter === 'groups'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Nhóm
            </button>
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-6 text-center text-gray-500">
              <p className="text-sm">Đang tải...</p>
            </div>
          ) : error ? (
            <div className="p-6 text-center text-red-500">
              <p className="text-sm">{error}</p>
            </div>
          ) : filteredConversations.length > 0 ? (
            filteredConversations.map((conv) => (
              <ChatListItem
                key={conv.id}
                conversation={conv}
                isActive={selectedConversationId === conv.id}
                onClick={() => handleConversationClick(conv.id)}
                isTyping={!!typingConversations[conv.id]}
              />
            ))
          ) : (
            <div className="p-6 text-center text-gray-500">
              <p className="text-sm">
                {isDoctor 
                  ? 'Chưa có bệnh nhân nào gửi tin nhắn'
                  : 'Không tìm thấy cuộc trò chuyện'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversationId && selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={selectedConversation.doctor.avatar} />
                  <AvatarFallback className="bg-green-100 text-green-700">
                    {selectedConversation.doctor.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-semibold text-gray-800">{selectedConversation.doctor.name}</h2>
                  <p className={`text-sm ${selectedConversation.doctor.status === 'online' ? 'text-green-600' : 'text-gray-500'}`}>
                    {selectedConversation.doctor.status === 'online' ? '● Đang online' : '○ Offline'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Phone className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Video className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Messages Area */}
            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-6 bg-gray-50">
              {messages.length > 0 ? (
                <>
                  {messages.map((message) => (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      isOwn={message.isOwn}
                    />
                  ))}
                  {typingUserName && (
                    <TypingIndicator senderName={typingUserName} />
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <p className="text-sm">Chưa có tin nhắn nào</p>
                </div>
              )}
            </div>

            {/* Message Input */}
            <MessageComposer 
              onSendMessage={handleSendMessage}
              onTypingChange={handleTypingChange}
            />
          </>
        ) : (
          /* Empty State */
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <div className="text-6xl mb-4">💬</div>
              <p className="text-lg font-medium mb-2">Chọn một cuộc trò chuyện để bắt đầu</p>
              <p className="text-sm">
                {isDoctor 
                  ? 'Kết nối với bệnh nhân để tư vấn và hỗ trợ'
                  : 'Kết nối với bác sĩ để được tư vấn sức khỏe'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Right Sidebar - Info Panel (Only for patient view) */}
      {selectedConversationId && selectedConversation && !isDoctor && (
        <div className="w-80 flex-shrink-0">
          <ChatInfoPanel
            doctor={selectedConversation.doctor}
            patientHistory={patientHistory}
            isLoadingHistory={isLoadingHistory}
            isDoctor={isDoctor}
            onPredictionClick={handlePredictionClick}
          />
        </div>
      )}

      {/* Prediction Detail Modal */}
      {isPredictionModalOpen && selectedPrediction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={closePredictionModal}>
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-gray-800">Chi tiết dự đoán</h2>
              <button onClick={closePredictionModal} className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Kết quả</p>
                  <p className={`text-lg font-semibold ${selectedPrediction.result === 'positive' ? 'text-red-600' : 'text-green-600'}`}>
                    {selectedPrediction.result === 'positive' ? 'Nguy cơ cao' : 'Nguy cơ thấp'}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Xác suất</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {(selectedPrediction.probability * 100).toFixed(2)}%
                  </p>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Ngày dự đoán</p>
                <p className="text-base text-gray-800">
                  {new Date(selectedPrediction.createdAt).toLocaleString('vi-VN')}
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Thông tin đầu vào</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="font-medium">Tuổi:</span> {selectedPrediction.inputData?.age || 'N/A'}</div>
                  <div><span className="font-medium">Giới tính:</span> {selectedPrediction.inputData?.gender === 1 ? 'Nữ' : 'Nam'}</div>
                  <div><span className="font-medium">BMI:</span> {selectedPrediction.inputData?.bmi?.toFixed(1) || 'N/A'}</div>
                  <div><span className="font-medium">Đường huyết:</span> {selectedPrediction.inputData?.bloodGlucose || 'N/A'}</div>
                  <div><span className="font-medium">Huyết áp:</span> {selectedPrediction.inputData?.bloodPressure || 'N/A'}</div>
                  <div><span className="font-medium">Insulin:</span> {selectedPrediction.inputData?.insulin || 'N/A'}</div>
                </div>
              </div>
              
              {selectedPrediction.advice && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-600 font-medium mb-1">Khuyến nghị</p>
                  <p className="text-sm text-gray-700">{selectedPrediction.advice}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
