import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Send,
    Loader2,
    MessageSquare,
    CheckCheck,
    Check
} from 'lucide-react'
import { messagesApi, userApi } from '@/lib/api'

interface Participant {
    id: string
    name: string
    email: string
    avatar?: string
}

interface Message {
    id: string
    content: string
    senderId: string
    readBy: string[]
    createdAt: string
    sender?: Participant
}

interface Conversation {
    id: string
    name: string
    subject: string
    isGroup: boolean
    updatedAt: string
    otherParticipant: Participant
    lastMessage: Message | null
    unreadCount: number
}

export function StudentMessages() {
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [activeConversation, setActiveConversation] = useState<Conversation | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [loadingConversations, setLoadingConversations] = useState(true)
    const [loadingMessages, setLoadingMessages] = useState(false)
    const [replyContent, setReplyContent] = useState('')
    const [replying, setReplying] = useState(false)
    
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const [me, setMe] = useState<any>(null)

    useEffect(() => {
        userApi.getMe().then(res => setMe(res.data.user)).catch(console.error)
        fetchConversations()
        
        // Polling
        const interval = setInterval(() => {
            fetchConversations(false)
            if (activeConversation) {
                fetchMessages(activeConversation.id, false)
            }
        }, 10000)
        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        if (activeConversation) {
            fetchMessages(activeConversation.id)
            messagesApi.markAsRead(activeConversation.id).catch(console.error)
            setConversations(prev => prev.map(c => c.id === activeConversation.id ? { ...c, unreadCount: 0 } : c))
        }
    }, [activeConversation])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    const fetchConversations = async (showLoading = true) => {
        if (showLoading) setLoadingConversations(true)
        try {
            const res = await messagesApi.getConversations()
            setConversations(res.data.data)
        } catch (error) {
            console.error('Failed to fetch conversations', error)
        } finally {
            if (showLoading) setLoadingConversations(false)
        }
    }

    const fetchMessages = async (conversationId: string, showLoading = true) => {
        if (showLoading) setLoadingMessages(true)
        try {
            const res = await messagesApi.getConversationMessages(conversationId, { take: 100 })
            setMessages(res.data.data)
        } catch (error) {
            console.error('Failed to fetch messages', error)
        } finally {
            if (showLoading) setLoadingMessages(false)
        }
    }

    const handleSendReply = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!replyContent.trim() || !activeConversation) return
        
        setReplying(true)
        try {
            const res = await messagesApi.reply(activeConversation.id, { content: replyContent })
            setMessages(prev => [...prev, res.data.data])
            setReplyContent('')
            fetchConversations(false)
        } catch (error) {
            console.error('Failed to send reply', error)
        } finally {
            setReplying(false)
        }
    }

    return (
        <div className="h-[600px] flex gap-4 w-full">
            {/* Left Sidebar - Conversations */}
            <Card className="w-1/3 flex flex-col min-h-0 bg-white dark:bg-slate-950">
                <div className="p-4 border-b">
                    <h2 className="font-semibold text-lg flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-blue-600" />
                        Inbox
                    </h2>
                </div>
                <div className="flex-1 overflow-y-auto p-2">
                    {loadingConversations ? (
                        <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>
                    ) : conversations.length === 0 ? (
                        <div className="text-center p-8 text-slate-500 text-sm">No messages yet</div>
                    ) : (
                        conversations.map(conv => (
                            <div
                                key={conv.id}
                                onClick={() => setActiveConversation(conv)}
                                className={`p-3 mb-1 rounded-lg cursor-pointer flex items-center gap-3 transition-colors ${
                                    activeConversation?.id === conv.id ? 'bg-blue-50 dark:bg-blue-900/30' : 'hover:bg-slate-50 dark:hover:bg-slate-900'
                                }`}
                            >
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0 font-medium">
                                    {conv.name?.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline">
                                        <h3 className="font-medium text-sm truncate dark:text-white">{conv.name}</h3>
                                        <span className="text-xs text-slate-500 shrink-0">
                                            {new Date(conv.updatedAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className={`text-xs truncate ${conv.unreadCount > 0 ? 'font-semibold text-slate-900 dark:text-white' : 'text-slate-500'}`}>
                                        {conv.lastMessage?.content || 'No messages yet'}
                                    </p>
                                </div>
                                {conv.unreadCount > 0 && (
                                    <div className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                                        {conv.unreadCount}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </Card>

            {/* Right Pane - Chat */}
            <Card className="flex-1 flex flex-col min-h-0 bg-slate-50/50 dark:bg-black/20">
                {activeConversation ? (
                    <>
                        <div className="p-4 border-b bg-white dark:bg-slate-950 flex items-center gap-3 shrink-0">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                                {activeConversation.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h3 className="font-semibold dark:text-white">{activeConversation.name}</h3>
                                {activeConversation.subject && (
                                    <p className="text-xs text-slate-500 font-medium">{activeConversation.subject}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {loadingMessages ? (
                                <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>
                            ) : (
                                messages.map((msg, idx) => {
                                    const isMe = msg.senderId === me?.id
                                    const showAvatar = idx === 0 || messages[idx - 1].senderId !== msg.senderId
                                    return (
                                        <div key={msg.id} className={`flex gap-2 max-w-[80%] ${isMe ? 'ml-auto flex-row-reverse' : ''}`}>
                                            {showAvatar ? (
                                                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0 text-xs font-medium">
                                                    {msg.sender?.name?.charAt(0).toUpperCase()}
                                                </div>
                                            ) : (
                                                <div className="w-8 h-8 shrink-0" />
                                            )}
                                            <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                                <div className={`px-4 py-2 rounded-2xl ${
                                                    isMe ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-white dark:bg-slate-900 border rounded-tl-sm dark:text-white'
                                                }`}>
                                                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                                </div>
                                                <div className="flex items-center gap-1 mt-1">
                                                    <span className="text-[10px] text-slate-400">
                                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                    {isMe && (
                                                        msg.readBy?.includes(activeConversation.otherParticipant.id) 
                                                            ? <CheckCheck className="w-3 h-3 text-blue-500" /> 
                                                            : <Check className="w-3 h-3 text-slate-400" />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="p-4 bg-white dark:bg-slate-950 border-t shrink-0">
                            <form onSubmit={handleSendReply} className="flex gap-2">
                                <Input
                                    value={replyContent}
                                    onChange={e => setReplyContent(e.target.value)}
                                    placeholder="Type your reply..."
                                    className="flex-1"
                                />
                                <Button type="submit" disabled={replying || !replyContent.trim()}>
                                    {replying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                </Button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8">
                        <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
                        <p>Select a conversation to start messaging</p>
                    </div>
                )}
            </Card>
        </div>
    )
}
