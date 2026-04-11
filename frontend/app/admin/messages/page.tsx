"use client"

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
    Send,
    Loader2,
    CheckCircle,
    AlertCircle,
    MessageSquare,
    Users,
    BookOpen,
    Trash2,
    Eye,
} from 'lucide-react'
import api from '@/lib/api'

interface Message {
    id: string
    title: string
    content: string
    priority: string
    sender: {
        id: string
        name: string
        email: string
        avatar?: string
    }
    recipients: Array<{
        userId: string
        isRead: boolean
        readAt?: string
    }>
    createdAt: string
    updatedAt: string
}

interface Batch {
    id: string
    name: string
    courseId: string
    course: {
        title: string
    }
}

interface Student {
    id: string
    name: string
    email: string
    avatar?: string
}

export default function AdminMessagesPage() {
    const [activeTab, setActiveTab] = useState('send-all')
    const [messages, setMessages] = useState<Message[]>([])
    const [batches, setBatches] = useState<Batch[]>([])
    const [students, setStudents] = useState<Student[]>([])
    const [loading, setLoading] = useState(false)
    const [messageLoading, setMessageLoading] = useState(false)
    const [successMessage, setSuccessMessage] = useState('')
    const [errorMessage, setErrorMessage] = useState('')

    // Form states
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [priority, setPriority] = useState('NORMAL')
    const [selectedBatch, setSelectedBatch] = useState('')
    const [selectedStudent, setSelectedStudent] = useState('')

    // Fetch sent messages
    useEffect(() => {
        fetchMessages()
        fetchBatches()
        fetchStudents()
    }, [])

    const fetchMessages = async () => {
        try {
            setLoading(true)
            const response = await api.get('/messages')
            setMessages(response.data.data || [])
        } catch (error) {
            console.error('Error fetching messages:', error)
            setErrorMessage('Failed to fetch messages')
        } finally {
            setLoading(false)
        }
    }

    const fetchBatches = async () => {
        try {
            // Try to fetch batches from courses API
            const response = await api.get('/courses?skip=0&take=100')
            const coursesList = response.data.courses || []
            // If we have course data, you could derive batches from it
            setBatches(coursesList.map((course: any) => ({
                id: course.id,
                name: course.title,
                courseId: course.id,
                course: { title: course.title }
            })) || [])
        } catch (error) {
            console.error('Error fetching batches/courses:', error)
            setBatches([])
        }
    }

    const fetchStudents = async () => {
        try {
            // Try to fetch students from users API
            const response = await api.get('/users?role=STUDENT&skip=0&take=100')
            setStudents(response.data.users || response.data.data || [])
        } catch (error) {
            console.error('Error fetching students:', error)
            setStudents([])
        }
    }

    const resetForm = () => {
        setTitle('')
        setContent('')
        setPriority('NORMAL')
        setSelectedBatch('')
        setSelectedStudent('')
    }

    const handleSendToAll = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title.trim() || !content.trim()) {
            setErrorMessage('Title and content are required')
            return
        }

        try {
            setMessageLoading(true)
            const response = await api.post('/messages/send-to-all', {
                title,
                content,
                priority
            })
            setSuccessMessage(`Message sent successfully to ${response.data.recipientsCount || 0} students`)
            resetForm()
            fetchMessages()
            setTimeout(() => setSuccessMessage(''), 3000)
        } catch (error) {
            setErrorMessage('Failed to send message')
            console.error(error)
        } finally {
            setMessageLoading(false)
        }
    }

    const handleSendToBatch = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title.trim() || !content.trim() || !selectedBatch) {
            setErrorMessage('Title, content, and batch are required')
            return
        }

        try {
            setMessageLoading(true)
            const response = await api.post('/messages/send-to-batch', {
                title,
                content,
                batchId: selectedBatch,
                priority
            })
            setSuccessMessage(`Message sent successfully to ${response.data.recipientsCount || 0} students in batch`)
            resetForm()
            fetchMessages()
            setTimeout(() => setSuccessMessage(''), 3000)
        } catch (error) {
            setErrorMessage('Failed to send message')
            console.error(error)
        } finally {
            setMessageLoading(false)
        }
    }

    const handleSendToStudent = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title.trim() || !content.trim() || !selectedStudent) {
            setErrorMessage('Title, content, and student are required')
            return
        }

        try {
            setMessageLoading(true)
            await api.post('/messages/send-to-student', {
                title,
                content,
                studentId: selectedStudent,
                priority
            })
            setSuccessMessage('Message sent successfully to student')
            resetForm()
            fetchMessages()
            setTimeout(() => setSuccessMessage(''), 3000)
        } catch (error) {
            setErrorMessage('Failed to send message')
            console.error(error)
        } finally {
            setMessageLoading(false)
        }
    }

    const handleDeleteMessage = async (messageId: string) => {
        if (confirm('Are you sure you want to delete this message?')) {
            try {
                await api.delete(`/messages/${messageId}`)
                setSuccessMessage('Message deleted successfully')
                fetchMessages()
                setTimeout(() => setSuccessMessage(''), 3000)
            } catch (error) {
                setErrorMessage('Failed to delete message')
                console.error(error)
            }
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <MessageSquare className="w-8 h-8 text-blue-600" />
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Student Messages</h1>
                        <p className="text-sl text-slate-600">Send instructions and announcements to students</p>
                    </div>
                </div>

                {/* Alerts */}
                {successMessage && (
                    <Card className="border-green-200 bg-green-50">
                        <CardContent className="pt-6 flex items-center gap-3 text-green-700">
                            <CheckCircle className="w-5 h-5" />
                            <span>{successMessage}</span>
                        </CardContent>
                    </Card>
                )}

                {errorMessage && (
                    <Card className="border-red-200 bg-red-50">
                        <CardContent className="pt-6 flex items-center gap-3 text-red-700">
                            <AlertCircle className="w-5 h-5" />
                            <span>{errorMessage}</span>
                        </CardContent>
                    </Card>
                )}

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="send-all" className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <span className="hidden sm:inline">Send to All</span>
                        </TabsTrigger>
                        <TabsTrigger value="send-batch" className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4" />
                            <span className="hidden sm:inline">Send to Batch</span>
                        </TabsTrigger>
                        <TabsTrigger value="send-student" className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4" />
                            <span className="hidden sm:inline">Send to Student</span>
                        </TabsTrigger>
                        <TabsTrigger value="history" className="flex items-center gap-2">
                            <Eye className="w-4 h-4" />
                            <span className="hidden sm:inline">History</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Send to All Tab */}
                    <TabsContent value="send-all" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Send Message to All Students</CardTitle>
                                <CardDescription>This message will be sent to all active students</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSendToAll} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Title
                                        </label>
                                        <Input
                                            placeholder="Message title"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Message Content
                                        </label>
                                        <Textarea
                                            placeholder="Enter your message..."
                                            value={content}
                                            onChange={(e) => setContent(e.target.value)}
                                            rows={6}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Priority
                                        </label>
                                        <Select value={priority} onValueChange={setPriority}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="LOW">Low</SelectItem>
                                                <SelectItem value="NORMAL">Normal</SelectItem>
                                                <SelectItem value="HIGH">High</SelectItem>
                                                <SelectItem value="URGENT">Urgent</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={messageLoading}
                                        className="w-full"
                                    >
                                        {messageLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="mr-2 h-4 w-4" />
                                                Send to All Students
                                            </>
                                        )}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Send to Batch Tab */}
                    <TabsContent value="send-batch" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Send Message to Batch</CardTitle>
                                <CardDescription>Send a message to all students in a specific batch</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSendToBatch} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Select Batch
                                        </label>
                                        <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Choose a batch" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {batches.map((batch) => (
                                                    <SelectItem key={batch.id} value={batch.id}>
                                                        {batch.name} - {batch.course?.title}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Title
                                        </label>
                                        <Input
                                            placeholder="Message title"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Message Content
                                        </label>
                                        <Textarea
                                            placeholder="Enter your message..."
                                            value={content}
                                            onChange={(e) => setContent(e.target.value)}
                                            rows={6}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Priority
                                        </label>
                                        <Select value={priority} onValueChange={setPriority}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="LOW">Low</SelectItem>
                                                <SelectItem value="NORMAL">Normal</SelectItem>
                                                <SelectItem value="HIGH">High</SelectItem>
                                                <SelectItem value="URGENT">Urgent</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={messageLoading || !selectedBatch}
                                        className="w-full"
                                    >
                                        {messageLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="mr-2 h-4 w-4" />
                                                Send to Batch
                                            </>
                                        )}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Send to Individual Student Tab */}
                    <TabsContent value="send-student" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Send Message to Individual Student</CardTitle>
                                <CardDescription>Send a personal message to a specific student</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSendToStudent} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Select Student
                                        </label>
                                        <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Choose a student" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {students.map((student) => (
                                                    <SelectItem key={student.id} value={student.id}>
                                                        {student.name} - {student.email}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Title
                                        </label>
                                        <Input
                                            placeholder="Message title"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Message Content
                                        </label>
                                        <Textarea
                                            placeholder="Enter your message..."
                                            value={content}
                                            onChange={(e) => setContent(e.target.value)}
                                            rows={6}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Priority
                                        </label>
                                        <Select value={priority} onValueChange={setPriority}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="LOW">Low</SelectItem>
                                                <SelectItem value="NORMAL">Normal</SelectItem>
                                                <SelectItem value="HIGH">High</SelectItem>
                                                <SelectItem value="URGENT">Urgent</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={messageLoading || !selectedStudent}
                                        className="w-full"
                                    >
                                        {messageLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="mr-2 h-4 w-4" />
                                                Send to Student
                                            </>
                                        )}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Message History Tab */}
                    <TabsContent value="history" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Message History</CardTitle>
                                <CardDescription>View and manage sent messages</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div className="flex items-center justify-center py-8">
                                        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                                    </div>
                                ) : messages.length === 0 ? (
                                    <p className="text-center text-slate-500 py-8">No messages sent yet</p>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Title</TableCell>
                                                    <TableCell>Sent By</TableCell>
                                                    <TableCell>Recipients</TableCell>
                                                    <TableCell>Read</TableCell>
                                                    <TableCell>Priority</TableCell>
                                                    <TableCell>Date</TableCell>
                                                    <TableCell>Action</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {messages.map((message) => {
                                                    const totalRecipients = message.recipients.length
                                                    const readCount = message.recipients.filter(r => r.isRead).length
                                                    return (
                                                        <TableRow key={message.id}>
                                                            <TableCell className="font-medium">{message.title}</TableCell>
                                                            <TableCell>{message.sender.name}</TableCell>
                                                            <TableCell>{totalRecipients}</TableCell>
                                                            <TableCell>
                                                                <Badge variant="outline">
                                                                    {readCount}/{totalRecipients}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge
                                                                    variant={
                                                                        message.priority === 'URGENT'
                                                                            ? 'destructive'
                                                                            : message.priority === 'HIGH'
                                                                            ? 'secondary'
                                                                            : 'outline'
                                                                    }
                                                                >
                                                                    {message.priority}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell>
                                                                {new Date(message.createdAt).toLocaleDateString()}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleDeleteMessage(message.id)}
                                                                    className="text-red-600 hover:text-red-700"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    )
                                                })}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
