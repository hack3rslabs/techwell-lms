const express = require('express');
const {
  broadcastMessage,
  getConversations,
  getConversationMessages,
  replyToConversation,
  markConversationAsRead,
  getUnreadCount
} = require('../controllers/messages.controller');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Global unread count
router.get('/unread-count', getUnreadCount);

// List conversations
router.get('/conversations', getConversations);

// Broadcast a message (Admin only)
router.post('/broadcast', authorize('ADMIN', 'INSTRUCTOR', 'SUPER_ADMIN', 'STAFF'), broadcastMessage);

// Conversation specific operations
router.get('/conversations/:id', getConversationMessages);
router.post('/conversations/:id/reply', replyToConversation);
router.put('/conversations/:id/read', markConversationAsRead);

module.exports = router;
