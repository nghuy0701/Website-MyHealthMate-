import express from 'express'
import { chatController } from '~/controllers'
import { isAuthenticated, isDoctor } from '~/middlewares/authMiddleware'

const Router = express.Router()

/**
 * Chat Routes - Medical Consultation Messaging
 * Base: /api/v1/chat
 */

// Create group conversation (doctor only)
// POST /api/v1/chat/conversations/group
// Auth: doctor only
// Body: { groupName, patientIds[] }
Router.post('/conversations/group', isAuthenticated, isDoctor, chatController.createGroupConversation)

// Send message (patient or doctor)
// POST /api/v1/chat/messages
// Patient: Creates conversation if first message (if no conversationId)
// Doctor/Patient: Sends to existing conversation (if conversationId provided)
Router.post('/messages', isAuthenticated, chatController.sendMessage)

// Get doctor's inbox (conversations with patients who messaged)
// GET /api/v1/chat/conversations/doctor
// Auth: doctor only
Router.get('/conversations/doctor', isAuthenticated, isDoctor, chatController.getDoctorInbox)

// Get patient's conversation info (assigned doctor + conversation status)
// GET /api/v1/chat/conversations/patient
// Auth: patient only
Router.get('/conversations/patient', isAuthenticated, chatController.getPatientConversation)

// Get messages in a conversation
// GET /api/v1/chat/messages/:conversationId
// Auth: patient or doctor (must belong to conversation)
Router.get('/messages/:conversationId', isAuthenticated, chatController.getMessages)

// Mark messages as read
// PUT /api/v1/chat/messages/:conversationId/read
// Auth: patient or doctor (must belong to conversation)
Router.put('/messages/:conversationId/read', isAuthenticated, chatController.markAsRead)

// Leave group conversation
// POST /api/v1/chat/conversations/:conversationId/leave
// Auth: patient or doctor (must belong to conversation)
Router.post('/conversations/:conversationId/leave', isAuthenticated, chatController.leaveGroup)

export const chatRoute = Router
