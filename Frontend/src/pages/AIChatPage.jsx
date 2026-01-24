import React, { useState, useEffect, useRef } from 'react'
import io from 'socket.io-client'
import styles from './AIChatPage.module.css'

const AIChatPage = () => {
  const [messages, setMessages] = useState([])
  const [messageInput, setMessageInput] = useState('')
  const [quickReplies, setQuickReplies] = useState([])
  const [conversationId, setConversationId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [socket, setSocket] = useState(null)
  const messagesEndRef = useRef(null)

  // Initialize Socket.IO and load AI session
  useEffect(() => {
    const initializeAIChat = async () => {
      try {
        const token = localStorage.getItem('token')
        const userId = localStorage.getItem('userId')

        // Get AI session
        const sessionResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/api/v1/chat/ai/session`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        )
        const sessionData = await sessionResponse.json()
        setConversationId(sessionData.data.conversationId)
        setMessages([
          {
            _id: Date.now().toString(),
            content: sessionData.data.welcomeMessage,
            senderId: 'ai-system',
            createdAt: Date.now()
          }
        ])
        setQuickReplies(sessionData.data.quickReplies)

        // Initialize Socket.IO
        const newSocket = io(import.meta.env.VITE_API_URL, {
          auth: { userId, token },
          transports: ['websocket', 'polling']
        })

        newSocket.on('message:new', (data) => {
          if (data.conversationId === conversationId) {
            setMessages(prev => [...prev, data])
          }
        })

        setSocket(newSocket)
      } catch (error) {
        console.error('Error initializing AI chat:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeAIChat()

    return () => {
      if (socket) socket.disconnect()
    }
  }, [])

  const sendMessage = async (content) => {
    if (!content.trim() || !conversationId) return

    try {
      const token = localStorage.getItem('token')

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/chat/ai/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          conversationId,
          message: content
        })
      })

      const data = await response.json()
      if (response.ok) {
        // Add user message
        setMessages(prev => [
          ...prev,
          {
            _id: Date.now().toString(),
            content,
            senderId: localStorage.getItem('userId'),
            createdAt: Date.now()
          }
        ])

        // Add AI response
        if (data.data.aiMessage) {
          setMessages(prev => [
            ...prev,
            {
              _id: Date.now().toString() + '1',
              content: data.data.aiMessage.content,
              senderId: 'ai-system',
              createdAt: Date.now()
            }
          ])
        }

        setQuickReplies(data.data.quickReplies)
        setMessageInput('')
      }
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const handleSendMessage = () => {
    sendMessage(messageInput)
  }

  const handleQuickReply = (reply) => {
    sendMessage(reply.value)
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (loading) {
    return <div className={styles.loading}>Đang tải...</div>
  }

  return (
    <div className={styles.aiChatContainer}>
      <div className={styles.header}>
        <h1>🤖 AI Tư vấn sức khỏe</h1>
        <p>Hỗ trợ 24/7</p>
      </div>

      <div className={styles.messagesContainer}>
        {messages.map(message => (
          <div
            key={message._id}
            className={`${styles.message} ${
              message.senderId === 'ai-system' ? styles.aiMessage : styles.userMessage
            }`}
          >
            {message.senderId === 'ai-system' && <div className={styles.aiAvatar}>🤖</div>}
            <div className={styles.messageBubble}>
              <p>{message.content}</p>
              <span className={styles.timestamp}>
                {new Date(message.createdAt).toLocaleTimeString('vi-VN')}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {quickReplies.length > 0 && (
        <div className={styles.quickReplies}>
          {quickReplies.map((reply, index) => (
            <button
              key={index}
              className={styles.quickReplyBtn}
              onClick={() => handleQuickReply(reply)}
            >
              {reply.label}
            </button>
          ))}
        </div>
      )}

      <div className={styles.inputArea}>
        <input
          type="text"
          value={messageInput}
          onChange={e => setMessageInput(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
          placeholder="Hỏi tôi bất cứ điều gì..."
        />
        <button onClick={handleSendMessage} disabled={!messageInput.trim()}>
          Gửi
        </button>
      </div>
    </div>
  )
}

export default AIChatPage
