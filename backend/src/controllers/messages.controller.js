const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

/**
 * Helper to get or create a 1-on-1 conversation between two users
 */
async function getOrCreateOneOnOneConversation(adminId, studentId, subject) {
    // Look for existing 1-on-1 conversation
    const existing = await prisma.conversation.findFirst({
        where: {
            isGroup: false,
            participants: {
                every: {
                    id: { in: [adminId, studentId] }
                }
            }
        },
        include: { participants: true }
    });

    // We must ensure the conversation has exactly these two participants
    if (existing && existing.participants.length === 2) {
        return existing;
    }

    // Create new conversation
    return prisma.conversation.create({
        data: {
            isGroup: false,
            subject: subject || 'Chat',
            participants: {
                connect: [{ id: adminId }, { id: studentId }]
            }
        }
    });
}

// Broadcast message (ALL, BATCH, STUDENT)
exports.broadcastMessage = async (req, res) => {
    try {
        const { targetType, targetIds, subject, content, attachments } = req.body;
        const senderId = req.user.id;

        if (!content) {
            return res.status(400).json({ success: false, message: 'Content is required' });
        }

        let studentIds = [];

        if (targetType === 'ALL') {
            const students = await prisma.user.findMany({
                where: { role: 'STUDENT', isActive: true },
                select: { id: true }
            });
            studentIds = students.map(s => s.id);
        } else if (targetType === 'BATCH') {
            if (!targetIds || !targetIds.length) {
                return res.status(400).json({ success: false, message: 'Batch IDs are required' });
            }
            
            // Get students mapped explicitly in BatchStudent OR via Enrollment
            const batchStudents = await prisma.batchStudent.findMany({
                where: { batchId: { in: targetIds } },
                select: { userId: true }
            });
            
            const enrolledStudents = await prisma.enrollment.findMany({
                where: { batchId: { in: targetIds }, status: 'ACTIVE' },
                select: { userId: true }
            });

            const uniqueIds = new Set([
                ...batchStudents.map(b => b.userId),
                ...enrolledStudents.map(e => e.userId)
            ]);
            studentIds = Array.from(uniqueIds);
        } else if (targetType === 'STUDENT') {
            if (!targetIds || !targetIds.length) {
                return res.status(400).json({ success: false, message: 'Student IDs are required' });
            }
            studentIds = targetIds;
        } else {
            return res.status(400).json({ success: false, message: 'Invalid targetType' });
        }

        if (studentIds.length === 0) {
            return res.status(404).json({ success: false, message: 'No students found for the selected target' });
        }

        // Prepare message content (prepend subject if provided)
        const finalContent = subject ? `**${subject}**\n\n${content}` : content;

        let messagesCreated = 0;
        // Process sequentially or in chunks to avoid overwhelming the DB
        for (const studentId of studentIds) {
            if (studentId === senderId) continue;
            
            const conversation = await getOrCreateOneOnOneConversation(senderId, studentId, subject);
            
            await prisma.message.create({
                data: {
                    conversationId: conversation.id,
                    senderId,
                    content: finalContent,
                    attachments: attachments || null,
                    readBy: [senderId] // sender has automatically read it
                }
            });
            
            messagesCreated++;
            
            // Update conversation updatedAt
            await prisma.conversation.update({
                where: { id: conversation.id },
                data: { updatedAt: new Date() }
            });
        }

        res.status(201).json({
            success: true,
            message: `Message sent to ${messagesCreated} students`,
            recipientsCount: messagesCreated
        });

    } catch (error) {
        console.error('Error broadcasting message:', error);
        res.status(500).json({ success: false, message: 'Failed to send message', error: error.message });
    }
};

// Get list of conversations for the logged in user
exports.getConversations = async (req, res) => {
    try {
        const userId = req.user.id;
        const { search } = req.query;

        const conversations = await prisma.conversation.findMany({
            where: {
                participants: {
                    some: { id: userId }
                }
            },
            include: {
                participants: {
                    select: { id: true, name: true, email: true, avatar: true, role: true }
                },
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            },
            orderBy: { updatedAt: 'desc' }
        });

        // Calculate unread count per conversation and format data
        const formatted = conversations.map(conv => {
            const otherParticipant = conv.participants.find(p => p.id !== userId) || conv.participants[0];
            const lastMessage = conv.messages.length > 0 ? conv.messages[0] : null;
            
            let unreadCount = 0;
            // Since we can't easily query JSON readBy array in Prisma findMany, we'd normally just count 
            // the messages where readBy array does not contain userId. We will do a separate count query or estimate based on last message.
            // For now, if the last message is not read by this user, we mark unreadCount = 1 (simplification)
            if (lastMessage && (!lastMessage.readBy || !lastMessage.readBy.includes(userId))) {
                unreadCount = 1;
            }

            return {
                id: conv.id,
                name: conv.name || otherParticipant.name,
                subject: conv.subject,
                isGroup: conv.isGroup,
                updatedAt: conv.updatedAt,
                otherParticipant,
                lastMessage,
                unreadCount
            };
        });

        // Filter by search if provided
        let result = formatted;
        if (search) {
            const s = search.toLowerCase();
            result = formatted.filter(c => 
                c.name.toLowerCase().includes(s) || 
                (c.otherParticipant && c.otherParticipant.email.toLowerCase().includes(s))
            );
        }

        res.json({ success: true, data: result });
    } catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch conversations', error: error.message });
    }
};

// Get messages for a specific conversation
exports.getConversationMessages = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { skip = 0, take = 50 } = req.query;

        // Verify user is part of the conversation
        const conversation = await prisma.conversation.findFirst({
            where: {
                id,
                participants: { some: { id: userId } }
            }
        });

        if (!conversation) {
            return res.status(404).json({ success: false, message: 'Conversation not found' });
        }

        const messages = await prisma.message.findMany({
            where: { conversationId: id },
            include: {
                sender: { select: { id: true, name: true, avatar: true } }
            },
            orderBy: { createdAt: 'asc' }, // Chat usually shows oldest at top
            skip: parseInt(skip),
            take: parseInt(take)
        });

        res.json({ success: true, data: messages });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch messages', error: error.message });
    }
};

// Send a reply in a conversation
exports.replyToConversation = async (req, res) => {
    try {
        const { id } = req.params;
        const { content, attachments } = req.body;
        const senderId = req.user.id;

        if (!content) {
            return res.status(400).json({ success: false, message: 'Content is required' });
        }

        // Verify user is part of the conversation
        const conversation = await prisma.conversation.findFirst({
            where: {
                id,
                participants: { some: { id: senderId } }
            }
        });

        if (!conversation) {
            return res.status(404).json({ success: false, message: 'Conversation not found' });
        }

        const message = await prisma.message.create({
            data: {
                conversationId: id,
                senderId,
                content,
                attachments: attachments || null,
                readBy: [senderId]
            },
            include: {
                sender: { select: { id: true, name: true, avatar: true } }
            }
        });

        // Update conversation timestamp
        await prisma.conversation.update({
            where: { id },
            data: { updatedAt: new Date() }
        });

        res.status(201).json({ success: true, message: 'Message sent', data: message });
    } catch (error) {
        console.error('Error sending reply:', error);
        res.status(500).json({ success: false, message: 'Failed to send reply', error: error.message });
    }
};

// Mark conversation as read
exports.markConversationAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Fetch messages where readBy does not contain userId
        // (Prisma JSON filtering is tricky, so we fetch all unread for this user in code for small scales)
        const messages = await prisma.message.findMany({
            where: { conversationId: id }
        });

        const unreadMessages = messages.filter(m => !m.readBy || !m.readBy.includes(userId));

        for (const msg of unreadMessages) {
            const currentReadBy = msg.readBy || [];
            await prisma.message.update({
                where: { id: msg.id },
                data: { readBy: [...currentReadBy, userId] }
            });
        }

        res.json({ success: true, message: 'Conversation marked as read' });
    } catch (error) {
        console.error('Error marking conversation read:', error);
        res.status(500).json({ success: false, message: 'Failed to mark as read', error: error.message });
    }
};

// Get total unread conversations count
exports.getUnreadCount = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Count conversations where the last message is not read by this user
        const conversations = await prisma.conversation.findMany({
            where: { participants: { some: { id: userId } } },
            include: { messages: { orderBy: { createdAt: 'desc' }, take: 1 } }
        });

        let unreadCount = 0;
        for (const conv of conversations) {
            if (conv.messages.length > 0) {
                const lastMsg = conv.messages[0];
                if (!lastMsg.readBy || !lastMsg.readBy.includes(userId)) {
                    unreadCount++;
                }
            }
        }

        res.json({ success: true, unreadCount });
    } catch (error) {
        console.error('Error getting unread count:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch unread count', error: error.message });
    }
};
