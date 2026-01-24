import React, { useState, useEffect, useRef } from 'react'
import io from 'socket.io-client'
import styles from './ChatPage.module.css'

const ChatPage = () => {
  const [conversations, setConversations] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [messageInput, setMessageInput] = useState('')
  const [isTyping, setIsTyping] = useState({})
  const [unreadCounts, setUnreadCounts] = useState({})
  const [socket, setSocket] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('all') // all, doctor, ai, group
  const messagesEndRef = useRef(null)

  // Initialize Socket.IO
  useEffect(() => {
    const token = localStorage.getItem('token')
    const userId = localStorage.getItem('userId')

    const newSocket = io(import.meta.env.VITE_API_URL, {
      auth: { userId, token },
      transports: ['websocket', 'polling']
    })

    newSocket.on('connect', () => {
      console.log('Connected to chat server')
    })

    newSocket.on('message:new', (data) => {
      if (selectedConversation?._id === data.conversationId) {
        setMessages(prev => [...prev, data])
      }
    })

    newSocket.on('typing:indicator', (data) => {
      setIsTyping(prev => ({
        ...prev,
        [data.userId]: data.isTyping
      }))
    })

    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
    }
  }, [selectedConversation])

  // Fetch conversations
  useEffect(() => {
    fetchConversations()
  }, [activeTab])

  const fetchConversations = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const params = new URLSearchParams()
      if (activeTab !== 'all') params.append('type', activeTab)

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/chat/conversations?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      const data = await response.json()
      setConversations(data.data || [])
    } catch (error) {
      console.error('Error fetching conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (conversationId) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/chat/conversations/${conversationId}/messages?limit=50`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      const data = await response.json()
      setMessages(data.data || [])

      // Mark conversation as read
      await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/chat/conversations/${conversationId}/mark-read`,
        {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      // Join socket room
      if (socket) {
        socket.emit('conversation:join', { conversationId })
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation)
    fetchMessages(conversation._id)
  }

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/chat/conversations/${selectedConversation._id}/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            content: messageInput,
            type: 'text'
          })
        }
      )

      const data = await response.json()
      if (response.ok) {
        setMessageInput('')
        // Message will be added via socket event
      }
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const handleTyping = () => {
    if (socket && selectedConversation) {
      socket.emit('typing:start', { conversationId: selectedConversation._id })

      // Stop typing after 2 seconds
      setTimeout(() => {
        socket.emit('typing:stop', { conversationId: selectedConversation._id })
      }, 2000)
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className={styles.chatContainer}>
      <div className={styles.sidebar}>
        <div className={styles.tabs}>
          {['all', 'doctor', 'ai', 'group'].map(tab => (
            <button
              key={tab}
              className={`${styles.tab} ${activeTab === tab ? styles.active : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className={styles.conversationList}>
          {conversations.map(conversation => (
            <div
              key={conversation._id}
              className={`${styles.conversationItem} ${
                selectedConversation?._id === conversation._id ? styles.selected : ''
              }`}
              onClick={() => handleSelectConversation(conversation)}
            >
              <div className={styles.convHeader}>
                <h4>{conversation.name}</h4>
                {unreadCounts[conversation._id] > 0 && (
                  <span className={styles.badge}>{unreadCounts[conversation._id]}</span>
                )}
              </div>
              <p className={styles.lastMessage}>{conversation.lastMessage}</p>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.chatArea}>
        {selectedConversation ? (
          <>
            <div className={styles.chatHeader}>
              <h2>{selectedConversation.name}</h2>
              <div className={styles.participants}>
                {selectedConversation.participants?.slice(0, 3).map(p => (
                  <span key={p.userId} className={styles.participantBadge}>
                    {p.name}
                  </span>
                ))}
              </div>
            </div>

            <div className={styles.messagesContainer}>
              {messages.map(message => (
                <div
                  key={message._id}
                  className={`${styles.message} ${
                    message.senderId === localStorage.getItem('userId') ? styles.sent : styles.received
                  }`}
                >
                  <div className={styles.messageBubble}>
                    <p>{message.content}</p>
                    <span className={styles.timestamp}>
                      {new Date(message.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}

              {Object.entries(isTyping).map(
                ([userId, typing]) =>
                  typing && (
                    <div key={userId} className={styles.typingIndicator}>
                      <span>Đang nhập...</span>
                    </div>
                  )
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className={styles.inputArea}>
              <input
                type="text"
                value={messageInput}
                onChange={e => setMessageInput(e.target.value)}
                onKeyPress={e => {
                  if (e.key === 'Enter') handleSendMessage()
                  else handleTyping()
                }}
                placeholder="Nhập tin nhắn..."
              />
              <button onClick={handleSendMessage} disabled={!messageInput.trim()}>
                Gửi
              </button>
            </div>
          </>
        ) : (
          <div className={styles.emptyState}>
            <p>Chọn một cuộc trò chuyện để bắt đầu</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ChatPage
