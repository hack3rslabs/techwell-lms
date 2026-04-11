# Admin-to-Student Messaging Feature - Implementation Guide

## Overview
This guide documents the complete implementation of an admin-to-student messaging system for the TechWell LMS platform.

## 🎯 Features Implemented

### Admin Panel (`/admin/messages`)
- **Send to All Students**: Broadcast messages to all active students
- **Send to Batch**: Send messages to students in a specific batch/course
- **Send to Individual Student**: Send personalized messages
- **Message History**: View all sent messages with read status statistics
- **Priority Levels**: Set message priority (LOW, NORMAL, HIGH, URGENT)
- **Message Management**: Delete sent messages

### Student Dashboard
- **Messages Widget**: View all messages in "My Learning" section
- **Unread Count Badge**: See number of unread messages at a glance
- **Mark as Read**: Mark messages as read with timestamp tracking
- **Message Filtering**: Filter between All and Unread messages
- **Expandable Content**: Click to expand and read full message content
- **Auto-refresh**: Messages refresh every 30 seconds automatically

## 🏗️ Architecture

### Database Schema Changes
Two new models added to Prisma schema:

**AdminMessage Model:**
- `id`: Unique identifier
- `title`: Message title
- `content`: Message content (supports multiline)
- `senderId`: Reference to User (admin)
- `priority`: Message priority (LOW, NORMAL, HIGH, URGENT)
- `isPublished`: Boolean flag
- `createdAt` / `updatedAt`: Timestamps

**AdminMessageRecipient Model:**
- `messageId`: Reference to AdminMessage
- `userId`: Reference to User (student)
- `isRead`: Boolean flag
- `readAt`: Timestamp when message was read
- Unique constraint on (messageId, userId) pair

### API Endpoints

#### Student Endpoints (Require Authentication)
```
GET  /api/messages/my-messages          - Fetch student's messages
GET  /api/messages/unread-count         - Get unread message count
PUT  /api/messages/{messageId}/read     - Mark message as read
```

#### Admin Endpoints (Require Authentication + ADMIN/INSTRUCTOR Role)
```
POST /api/messages/send-to-all          - Send message to all students
POST /api/messages/send-to-batch        - Send message to specific batch
POST /api/messages/send-to-student      - Send message to individual student
GET  /api/messages                      - View all sent messages (admin)
DELETE /api/messages/{messageId}        - Delete a message
```

## 📁 Files Created/Modified

### Backend
1. **`/backend/prisma/schema.prisma`**
   - Added `AdminMessage` model
   - Added `AdminMessageRecipient` model
   - Added relations to `User` model

2. **`/backend/src/routes/messages.routes.js`** (New)
   - Defines all 8 API endpoints
   - Applies authentication and authorization

3. **`/backend/src/controllers/messages.controller.js`** (New)
   - Implements all message operations
   - Error handling and validation
   - Support for sending to all, batch, or individual students

4. **`/backend/src/index.js`**
   - Added route registration: `app.use('/api/messages', require('./routes/messages.routes'))`

### Frontend
1. **`/frontend/app/admin/messages/page.tsx`** (New)
   - Admin dashboard for sending messages
   - 4 tabs: Send to All, Send to Batch, Send to Student, History
   - Message history table with read status
   - Forms with validation

2. **`/frontend/components/messages/StudentMessages.tsx`** (New)
   - Student message widget component
   - Displays newest messages first
   - Expandable message content
   - Mark as read functionality
   - Filter between All/Unread
   - Auto-refresh every 30 seconds

3. **`/frontend/app/dashboard/page.tsx`**
   - Imported StudentMessages component
   - Integrated into My Learning tab
   - Displays alongside enrolled courses

## 🚀 Deployment Checklist

### Database Migration
```bash
cd backend
npm run db:push      # Apply schema changes to database
npm run db:generate  # Regenerate Prisma client
```

### Backend Restart
```bash
npm install          # If needed
npm start            # Restart backend server
# or for development:
npm run dev          # With nodemon auto-reload
```

### Frontend Deployment
```bash
cd frontend
npm run build        # Build Next.js app
npm start            # Start production server
```

## 🔧 Configuration

### Environment Variables
Ensure these exist in `.env`:
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT tokens (already configured)

### CORS
The messaging API is already included in CORS whitelist through `/api` route.

## 📋 Usage Guide

### For Admins
1. Navigate to `/admin/messages`
2. Choose one of three options:
   - **Send to All**: Type title and content, set priority, click send
   - **Send to Batch**: Select batch from dropdown, enter message, send
   - **Send to Student**: Select student from dropdown, enter message, send
3. View message history in "History" tab
4. Monitor who has read messages

### For Students
1. Go to Dashboard → My Learning tab
2. View "Messages" section on the right
3. See unread count badge
4. Click eye icon to expand/collapse message
5. Click checkmark icon to mark as read
6. Filter between All and Unread messages

## 🧪 Testing Scenarios

### Test Case 1: Send Message to All Students
1. Admin logs in and goes to `/admin/messages`
2. Click "Send to All" tab
3. Enter title: "Important Announcement"
4. Enter content: "Test message content"
5. Set priority to "HIGH"
6. Click "Send to All Students"
7. Verify success message
8. Check Message History tab shows the message
9. Login as student, verify message appears in dashboard

### Test Case 2: Send Message to Specific Batch
1. Admin selects batch from dropdown
2. Enter message details
3. Send
4. Only students enrolled in that batch should receive it

### Test Case 3: Mark Message as Read
1. Student views unread message
2. Click checkmark icon
3. Message moves to read section
4. Admin can see read status in history

### Test Case 4: Message Refresh
1. Student has messages page open
2. Admin sends new message to that student
3. Within 30 seconds, new message appears in student's list

## 🐛 Troubleshooting

### Issue: Messages not appearing in admin page
**Solution**: 
- Check database connection
- Verify Prisma migrations ran successfully
- Check browser console for API errors

### Issue: 403 Forbidden error when sending message
**Solution**:
- Ensure user has ADMIN or INSTRUCTOR role
- Check JWT token is valid
- Verify Authorization header is sent with Bearer token

### Issue: Student not receiving messages
**Solution**:
- Check student's role is "STUDENT" in database
- Verify user.isActive = true
- Check message was actually created in AdminMessageRecipient table

## 🔐 Security Considerations

1. **Authentication**: All endpoints require valid JWT token from logged-in user
2. **Authorization**: Send endpoints limited to ADMIN/INSTRUCTOR roles only
3. **Data Validation**: All inputs validated before database operations
4. **SQL Injection**: Prisma ORM prevents SQL injection
5. **Owner Verification**: Students can only see their own messages and mark their own as read

## 📊 Performance Considerations

1. **Pagination**: Get endpoints support `skip` and `take` parameters
2. **Query Optimization**: 
   - Student get messages includes only necessary fields for sender
   - Unread count is a simple count query
3. **Database Indexes**: Consider adding index on (userId, isRead) for faster queries

## 🔄 Next Steps / Enhancements

Potential future improvements:
1. Email notifications when student receives message
2. Rich text editor for message content
3. File attachment support
4. Message scheduling (send at specific time)
5. Grouping/categories for messages
6. Search/filter messages by keyword
7. Message templating system
8. Reply functionality (2-way messaging)
9. Message expiration/auto-delete
10. Analytics dashboard for message engagement

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review the console logs for error messages
3. Verify all files were created correctly
4. Ensure database is accessible and migrations ran
5. Test API endpoints using Postman/curl
