const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

// Create and send message to students
exports.sendMessageToStudents = async (req, res) => {
  try {
    const { title, content, priority = 'NORMAL' } = req.body;
    const senderId = req.user.id;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required'
      });
    }

    // Create the admin message
    const adminMessage = await prisma.adminMessage.create({
      data: {
        title,
        content,
        priority,
        senderId,
        isPublished: true
      }
    });

    // Get all students (users with role STUDENT)
    const students = await prisma.user.findMany({
      where: {
        role: 'STUDENT',
        isActive: true
      },
      select: { id: true }
    });

    // Create recipients for each student
    const recipients = students.map(student => ({
      messageId: adminMessage.id,
      userId: student.id,
      isRead: false
    }));

    if (recipients.length > 0) {
      await prisma.adminMessageRecipient.createMany({
        data: recipients,
        skipDuplicates: true
      });
    }

    res.status(201).json({
      success: true,
      message: 'Message sent to all students',
      data: adminMessage,
      recipientsCount: recipients.length
    });
  } catch (error) {
    console.error('Error sending message to all students:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
};

// Send message to specific batch
exports.sendMessageToBatch = async (req, res) => {
  try {
    const { title, content, batchId, priority = 'NORMAL' } = req.body;
    const senderId = req.user.id;

    if (!title || !content || !batchId) {
      return res.status(400).json({
        success: false,
        message: 'Title, content, and batchId are required'
      });
    }

    // Verify batch exists
    const batch = await prisma.batch.findUnique({
      where: { id: batchId }
    });

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }

    // Create the admin message
    const adminMessage = await prisma.adminMessage.create({
      data: {
        title,
        content: `[Batch: ${batch.name}]\n${content}`,
        priority,
        senderId,
        isPublished: true
      }
    });

    // Get all enrolled students in this batch
    const batchStudents = await prisma.enrollment.findMany({
      where: {
        batchId: batchId,
        status: 'ACTIVE'
      },
      select: { userId: true }
    });

    // Create recipients for each student
    const recipients = batchStudents.map(enrollment => ({
      messageId: adminMessage.id,
      userId: enrollment.userId,
      isRead: false
    }));

    if (recipients.length > 0) {
      await prisma.adminMessageRecipient.createMany({
        data: recipients,
        skipDuplicates: true
      });
    }

    res.status(201).json({
      success: true,
      message: 'Message sent to batch students',
      data: adminMessage,
      recipientsCount: recipients.length
    });
  } catch (error) {
    console.error('Error sending message to batch:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
};

// Send message to specific student
exports.sendMessageToStudent = async (req, res) => {
  try {
    const { studentId, title, content, priority = 'NORMAL' } = req.body;
    const senderId = req.user.id;

    if (!studentId || !title || !content) {
      return res.status(400).json({
        success: false,
        message: 'StudentId, title, and content are required'
      });
    }

    // Verify student exists
    const student = await prisma.user.findUnique({
      where: { id: studentId }
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Create the admin message
    const adminMessage = await prisma.adminMessage.create({
      data: {
        title,
        content,
        priority,
        senderId,
        isPublished: true
      }
    });

    // Create recipient
    await prisma.adminMessageRecipient.create({
      data: {
        messageId: adminMessage.id,
        userId: studentId,
        isRead: false
      }
    });

    res.status(201).json({
      success: true,
      message: 'Message sent to student',
      data: adminMessage
    });
  } catch (error) {
    console.error('Error sending message to student:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
};

// Get messages for a student
exports.getStudentMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { skip = 0, take = 10 } = req.query;

    const messages = await prisma.adminMessageRecipient.findMany({
      where: { userId },
      include: {
        message: {
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: parseInt(skip),
      take: parseInt(take)
    });

    const total = await prisma.adminMessageRecipient.count({
      where: { userId }
    });

    res.json({
      success: true,
      data: messages,
      pagination: {
        total,
        skip: parseInt(skip),
        take: parseInt(take),
        hasMore: parseInt(skip) + parseInt(take) < total
      }
    });
  } catch (error) {
    console.error('Error fetching student messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
      error: error.message
    });
  }
};

// Mark message as read
exports.markMessageAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    // Check if recipient exists
    const recipient = await prisma.adminMessageRecipient.findUnique({
      where: {
        messageId_userId: {
          messageId,
          userId
        }
      }
    });

    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Mark as read
    const updated = await prisma.adminMessageRecipient.update({
      where: {
        messageId_userId: {
          messageId,
          userId
        }
      },
      data: {
        isRead: true,
        readAt: new Date()
      },
      include: {
        message: {
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true
              }
            }
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Message marked as read',
      data: updated
    });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark message as read',
      error: error.message
    });
  }
};

// Get unread message count
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const unreadCount = await prisma.adminMessageRecipient.count({
      where: {
        userId,
        isRead: false
      }
    });

    res.json({
      success: true,
      unreadCount
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch unread count',
      error: error.message
    });
  }
};

// Get all messages (admin only - for viewing sent messages)
exports.getAllMessages = async (req, res) => {
  try {
    const { skip = 0, take = 10 } = req.query;

    const messages = await prisma.adminMessage.findMany({
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        },
        recipients: {
          select: {
            userId: true,
            isRead: true,
            readAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: parseInt(skip),
      take: parseInt(take)
    });

    const total = await prisma.adminMessage.count();

    res.json({
      success: true,
      data: messages,
      pagination: {
        total,
        skip: parseInt(skip),
        take: parseInt(take),
        hasMore: parseInt(skip) + parseInt(take) < total
      }
    });
  } catch (error) {
    console.error('Error fetching all messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
      error: error.message
    });
  }
};

// Delete a message (admin only)
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    await prisma.adminMessage.delete({
      where: { id: messageId }
    });

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message',
      error: error.message
    });
  }
};
