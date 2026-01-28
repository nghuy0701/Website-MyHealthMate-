import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { FloatingChatButton } from './FloatingChatButton.jsx';
import { MiniChatWindow } from './MiniChatWindow.jsx';
import { DoctorSelectModal } from './DoctorSelectModal.jsx';
import { useAuth } from '../../lib/auth-context';
import { chatAPI } from '../../lib/api';
import {
  AI_NAME,
  AI_AVATAR,
  DOCTOR_SUPPORT_START_HOUR,
  DOCTOR_SUPPORT_END_HOUR,
  initialAiMessage,
  initialQuickReplies,
  aiResponses,
  mockDoctors,
} from '../../lib/ai-chat-data';

// Debounce function to limit how often a function is called
const debounce = (func, delay) => {
  let timeout;
  return function (...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), delay);
  };
};

export function AiMedicalAssistantMiniChat() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [currentQuickReplies, setCurrentQuickReplies] = useState(initialQuickReplies);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDoctorSelectModalOpen, setIsDoctorSelectModalOpen] = useState(false);
  const [availableDoctors, setAvailableDoctors] = useState([]);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(false);
  const [consultationRequestStatus, setConsultationRequestStatus] = useState('idle'); // idle, pending, success, error

  const conversationHistoryRef = useRef([]); // To store full conversation for AI context
  const isUserTypingRef = useRef(false); // Track user typing state for debounce

  // Function to add a message to the chat
  const addMessage = useCallback((newMessage) => {
    setMessages((prevMessages) => {
      const updatedMessages = [...prevMessages, newMessage];
      conversationHistoryRef.current = updatedMessages; // Update ref
      return updatedMessages;
    });
    if (!isOpen && (newMessage.senderType === 'AI' || newMessage.senderType === 'SYSTEM')) {
      setUnreadCount((prev) => prev + 1);
    }
  }, [isOpen]);

  const handleConnectDoctor = useCallback(async () => {
    const currentHour = new Date().getHours();
    const isSupportHours = currentHour >= DOCTOR_SUPPORT_START_HOUR && currentHour < DOCTOR_SUPPORT_END_HOUR;

    if (!isSupportHours) {
      addMessage({
        id: `system-out-of-hours-${Date.now()}`,
        senderType: 'SYSTEM',
        content: aiResponses.OUT_OF_HOURS_MESSAGE,
        createdAt: new Date().toISOString(),
      });
      setCurrentQuickReplies(initialQuickReplies); // Go back to main menu
      return;
    }

    if (!user) {
      addMessage({
        id: `system-login-required-${Date.now()}`,
        senderType: 'SYSTEM',
        content: `Để kết nối với bác sĩ, bạn cần đăng nhập vào tài khoản của mình. Vui lòng đăng nhập để tiếp tục.`,
        createdAt: new Date().toISOString(),
      });
      setCurrentQuickReplies(initialQuickReplies);
      return;
    }

    // Fetch available doctors
    setIsLoadingDoctors(true);
    setIsDoctorSelectModalOpen(true);
    try {
      const response = await chatAPI.getAvailableDoctors();
      const onlineDoctors = response.data.filter(doc => doc.isOnline);
      setAvailableDoctors(onlineDoctors);
    } catch (error) {
      console.error('Error fetching available doctors:', error);
      addMessage({
        id: `system-doctor-fetch-error-${Date.now()}`,
        senderType: 'SYSTEM',
        content: `Rất tiếc, không thể tải danh sách bác sĩ lúc này. Vui lòng thử lại sau.`,
        createdAt: new Date().toISOString(),
      });
      setCurrentQuickReplies(initialQuickReplies);
      setIsDoctorSelectModalOpen(false);
    } finally {
      setIsLoadingDoctors(false);
    }
  }, [addMessage, user]);

  // Simulate AI response
  const getAiResponse = useCallback(async (userMessageContent) => {
    setIsAiTyping(true);
    setCurrentQuickReplies([]); // Clear quick replies while AI is typing
    await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate AI processing time

    let response = aiResponses.DEFAULT_RESPONSE;
    // Determine if the input is a payload or free text
    const isPayload = Object.keys(aiResponses).includes(userMessageContent);
    const payload = isPayload ? userMessageContent : userMessageContent.toUpperCase().replace(/\s/g, '_');

    // Check for quick reply payloads first
    const matchedQuickReply = initialQuickReplies.find(qr => qr.payload === payload);
    if (matchedQuickReply) {
      response = aiResponses[matchedQuickReply.payload] || aiResponses.DEFAULT_RESPONSE;
    } else {
      // Basic keyword matching for free text input
      if (userMessageContent.toLowerCase().includes('dự đoán')) {
        response = aiResponses.START_PREDICTION;
      } else if (userMessageContent.toLowerCase().includes('kết quả')) {
        response = aiResponses.EXPLAIN_RESULT;
      } else if (userMessageContent.toLowerCase().includes('tiểu đường là gì')) {
        response = aiResponses.WHAT_IS_DIABETES;
      } else if (userMessageContent.toLowerCase().includes('kết nối bác sĩ')) {
        response = aiResponses.CONNECT_DOCTOR;
      }
    }

    addMessage({
      id: `ai-${Date.now()}`,
      senderType: 'AI',
      content: response.content,
      createdAt: new Date().toISOString(),
    });

    if (response === aiResponses.CONNECT_DOCTOR) {
      handleConnectDoctor();
    } else {
      setCurrentQuickReplies(response.quickReplies || []);
    }

    setIsAiTyping(false);
  }, [addMessage, handleConnectDoctor]);

  // Initial AI greeting when chat opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setTimeout(() => {
        addMessage(initialAiMessage);
        setCurrentQuickReplies(initialQuickReplies);
      }, 500);
      setUnreadCount(0);
    }
  }, [isOpen, messages.length, addMessage]);

  // Handle sending a message from user
  const handleSendMessage = useCallback(async (content) => {
    const userMessage = {
      id: `user-${Date.now()}`,
      senderType: 'USER',
      content: content,
      createdAt: new Date().toISOString(),
    };
    addMessage(userMessage);
    setUnreadCount(0); // User sent message, so they've seen previous messages

    // Process AI response
    await getAiResponse(content);
  }, [addMessage, getAiResponse]);

  // Handle quick reply clicks
  const handleQuickReply = useCallback(async (payload) => {
    const quickReply = initialQuickReplies.find(qr => qr.payload === payload) || aiResponses[payload]?.quickReplies?.find(qr => qr.payload === payload);
    const quickReplyText = quickReply?.text || payload;
    const userMessage = {
      id: `user-qr-${Date.now()}`,
      senderType: 'USER',
      content: quickReplyText,
      createdAt: new Date().toISOString(),
    };
    addMessage(userMessage);
    setUnreadCount(0);

    await getAiResponse(payload);
  }, [addMessage, getAiResponse]);

  const handleSelectDoctor = useCallback(async (doctor) => {
    setIsDoctorSelectModalOpen(false);
    setConsultationRequestStatus('pending');
    addMessage({
      id: `system-request-pending-${Date.now()}`,
      senderType: 'SYSTEM',
      content: `Đang gửi yêu cầu tư vấn đến ${doctor.name}...`,
      createdAt: new Date().toISOString(),
    });
    setCurrentQuickReplies([]);

    try {
      await chatAPI.createConsultationRequest({
        doctorId: doctor.id,
        userId: user._id,
        initialMessage: conversationHistoryRef.current.map(msg => `${msg.senderType}: ${msg.content}`).join('\n')
      });

      setConsultationRequestStatus('success');
      addMessage({
        id: `system-request-success-${Date.now()}`,
        senderType: 'SYSTEM',
        content: `Yêu cầu của bạn đã được gửi thành công đến ${doctor.name}. Bạn sẽ được chuyển hướng đến cuộc trò chuyện với bác sĩ trong giây lát.`,
        createdAt: new Date().toISOString(),
      });

      setTimeout(() => {
        setIsOpen(false);
        setMessages([]);
        setCurrentQuickReplies(initialQuickReplies);
        setConsultationRequestStatus('idle');
        navigate('/chat');
      }, 3000);

    } catch (error) {
      console.error('Error creating consultation request:', error);
      setConsultationRequestStatus('error');
      addMessage({
        id: `system-request-error-${Date.now()}`,
        senderType: 'SYSTEM',
        content: `Rất tiếc, không thể gửi yêu cầu tư vấn đến ${doctor.name}. Vui lòng thử lại sau.`,
        createdAt: new Date().toISOString(),
      });
      setCurrentQuickReplies(initialQuickReplies);
    }
  }, [addMessage, user, navigate]);

  const debouncedTypingStart = useCallback(debounce(() => {
    isUserTypingRef.current = true;
  }, 500), []);

  const debouncedTypingStop = useCallback(debounce(() => {
    isUserTypingRef.current = false;
  }, 1000), []);

  const handleTypingChange = useCallback((inputLength) => {
    if (inputLength > 0 && !isUserTypingRef.current) {
      debouncedTypingStart();
    } else if (inputLength === 0 && isUserTypingRef.current) {
      debouncedTypingStop();
    }
  }, [debouncedTypingStart, debouncedTypingStop]);

  // Using a portal to render the chat UI at the end of `document.body`.
  // This is the most robust way to avoid CSS stacking context issues,
  // ensuring the fixed-position chat window is not affected by parent transforms.
  return createPortal(
    <>
      <FloatingChatButton
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) setUnreadCount(0);
        }}
        unreadCount={unreadCount}
      />
      <MiniChatWindow
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        messages={messages}
        onSendMessage={handleSendMessage}
        onQuickReply={handleQuickReply}
        quickReplies={currentQuickReplies}
        isAiTyping={isAiTyping}
        aiAvatar={AI_AVATAR}
        aiName={AI_NAME}
        onTypingChange={handleTypingChange}
        isSendingMessage={isAiTyping || consultationRequestStatus === 'pending'}
      />
      <DoctorSelectModal
        isOpen={isDoctorSelectModalOpen}
        onClose={() => setIsDoctorSelectModalOpen(false)}
        doctors={availableDoctors}
        onSelectDoctor={handleSelectDoctor}
        isLoading={isLoadingDoctors}
      />
    </>,
    document.body
  );
}