const express = require('express');
const {
  sendMessageToStudents,
  sendMessageToBatch,
  sendMessageToStudent,
  getStudentMessages,
  markMessageAsRead,
  getUnreadCount,
  getAllMessages,
  deleteMessage
} = require('../controllers/messages.controller');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Student routes (allow all authenticated users)
router.get('/my-messages', getStudentMessages);
router.get('/unread-count', getUnreadCount);
router.put('/:messageId/read', markMessageAsRead);

// Admin routes (require admin/instructor role)
router.post('/send-to-all', authorize('ADMIN', 'INSTRUCTOR', 'SUPER_ADMIN', 'STAFF'), sendMessageToStudents);
router.post('/send-to-batch', authorize('ADMIN', 'INSTRUCTOR', 'SUPER_ADMIN', 'STAFF'), sendMessageToBatch);
router.post('/send-to-student', authorize('ADMIN', 'INSTRUCTOR', 'SUPER_ADMIN', 'STAFF'), sendMessageToStudent);
router.get('/', authorize('ADMIN', 'INSTRUCTOR', 'SUPER_ADMIN', 'STAFF'), getAllMessages);
router.delete('/:messageId', authorize('ADMIN', 'SUPER_ADMIN', 'STAFF'), deleteMessage);

module.exports = router;
