import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Mail,
    Bell,
    Clock,
    Loader2,
    AlertCircle,
    CheckCircle2,
    Trash2,
    Eye,
} from 'lucide-react'
import api from '@/lib/api'

interface AdminMessage {
    id: string
    message: {
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
        createdAt: string
    }
    isRead: boolean
    readAt?: string
}

export function StudentMessages() {
    const [messages, setMessages] = useState<AdminMessage[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [loading, setLoading] = useState(true)
    const [expandedId, setExpandedId] = useState<string | null>(null)
    const [filterRead, setFilterRead] = useState<'all' | 'unread'>('all')
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchMessages()
        fetchUnreadCount()

        // Set up polling to refresh messages every 30 seconds
        const interval = setInterval(() => {
            fetchMessages()
            fetchUnreadCount()
        }, 30000)

        return () => clearInterval(interval)
    }, [])

    const fetchMessages = async () => {
        try {
            setError(null)
            const response = await api.get('/messages/my-messages?skip=0&take=20')
            setMessages(response.data.data || [])
        } catch (err) {
            setError('Failed to load messages. Please try again later.')
            setMessages([])
        } finally {
            setLoading(false)
        }
    }

    const fetchUnreadCount = async () => {
        try {
            const response = await api.get('/messages/unread-count')
            setUnreadCount(response.data.unreadCount || 0)
        } catch (error) {
            console.error('Error fetching unread count:', error)
        }
    }

    const handleMarkAsRead = async (messageId: string) => {
        try {
            await api.put(`/messages/${messageId}/read`)
            fetchMessages()
            fetchUnreadCount()
        } catch (error) {
            console.error('Error marking message as read:', error)
        }
    }

    const filteredMessages = filterRead === 'unread' 
        ? messages.filter(m => !m.isRead)
        : messages

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'URGENT':
                return 'bg-red-100 text-red-800 hover:bg-red-200'
            case 'HIGH':
                return 'bg-orange-100 text-orange-800 hover:bg-orange-200'
            case 'NORMAL':
                return 'bg-blue-100 text-blue-800 hover:bg-blue-200'
            case 'LOW':
                return 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            default:
                return 'bg-slate-100 text-slate-800'
        }
    }

    return (
        <Card className="col-span-1 md:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                        <Bell className="w-5 h-5 text-blue-600" />
                        Messages
                    </CardTitle>
                    <CardDescription>
                        Instructions and announcements from your instructors
                    </CardDescription>
                </div>
                {unreadCount > 0 && (
                    <Badge variant="destructive" className="rounded-full px-3 py-1">
                        {unreadCount} New
                    </Badge>
                )}
            </CardHeader>

            <CardContent>
                {error ? (
                    <div className="text-center py-8">
                        <AlertCircle className="mx-auto h-12 w-12 text-red-400 mb-3" />
                        <p className="text-red-500 font-medium">{error}</p>
                    </div>
                ) : loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                    </div>
                ) : filteredMessages.length === 0 ? (
                    <div className="text-center py-8">
                        <Mail className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                        <p className="text-gray-500 font-medium">
                            {filterRead === 'unread' ? 'No unread messages' : 'No messages yet'}
                        </p>
                        <p className="text-gray-400 text-sm">
                            {filterRead === 'unread'
                                ? 'All caught up! Check back soon.'
                                : "You don't have any messages yet."}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Filter Buttons */}
                        <div className="flex gap-2 mb-4">
                            <Button
                                variant={filterRead === 'all' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setFilterRead('all')}
                            >
                                All ({messages.length})
                            </Button>
                            <Button
                                variant={filterRead === 'unread' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setFilterRead('unread')}
                            >
                                Unread ({unreadCount})
                            </Button>
                        </div>

                        {/* Messages List */}
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {filteredMessages.map((messageItem) => {
                                const msg = messageItem.message
                                const isExpanded = expandedId === msg.id
                                const isUnread = !messageItem.isRead

                                return (
                                    <div
                                        key={msg.id}
                                        className={`border rounded-lg p-4 transition-all ${
                                            isUnread
                                                ? 'bg-blue-50 border-blue-200'
                                                : 'bg-white border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        {/* Message Header */}
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    {isUnread && (
                                                        <div className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0" />
                                                    )}
                                                    <h3 className="font-semibold text-slate-900 truncate">
                                                        {msg.title}
                                                    </h3>
                                                    <Badge className={`flex-shrink-0 ${getPriorityColor(msg.priority)}`}>
                                                        {msg.priority}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                                    <span className="font-medium">{msg.sender.name}</span>
                                                    <span>•</span>
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {new Date(msg.createdAt).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex gap-1 flex-shrink-0">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setExpandedId(isExpanded ? null : msg.id)}
                                                    className="text-gray-600"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                                {isUnread && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleMarkAsRead(msg.id)}
                                                        className="text-green-600 hover:text-green-700"
                                                    >
                                                        <CheckCircle2 className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Expanded Content */}
                                        {isExpanded && (
                                            <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
                                                <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap">
                                                    {msg.content}
                                                </div>
                                                {messageItem.readAt && (
                                                    <div className="text-xs text-slate-500">
                                                        Read on {new Date(messageItem.readAt).toLocaleString()}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
