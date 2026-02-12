"use client"

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Bot, Send, Minimize2, User, Phone, Mail } from 'lucide-react'
import api from '@/lib/api' // Ensure this axios instance handles auth headers automatically if present

// Basic type for chat messages
interface Message {
    role: 'user' | 'model'
    text: string
}

export default function ChatWidget() {
    const [isOpen, setIsOpen] = React.useState(false)
    const [messages, setMessages] = React.useState<Message[]>([
        { role: 'model', text: 'Hi! I am TechWell Bot. How can I help you today?' }
    ])
    const [inputText, setInputText] = React.useState('')
    const [isThinking, setIsThinking] = React.useState(false)

    // Guest / Lead State
    const [isGuest, setIsGuest] = React.useState(true) // Default to guest, verified by checking token/localstorage usually
    const [hasProvidedDetails, setHasProvidedDetails] = React.useState(false)
    const [leadForm, setLeadForm] = React.useState({
        name: '',
        email: '',
        phone: ''
    })

    const scrollRef = React.useRef<HTMLDivElement>(null)

    // Check if user is logged in
    React.useEffect(() => {
        // Simple check: if token exists in localStorage, assume user
        const token = localStorage.getItem('token')
        if (token) {
            setIsGuest(false)
            setHasProvidedDetails(true) // Users don't need to fill form
        }
    }, [])

    // Auto-scroll
    React.useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages, isOpen, hasProvidedDetails])

    const handleLeadSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (leadForm.name && (leadForm.email || leadForm.phone)) {
            setHasProvidedDetails(true)
            // Optional: Send initial greeting to API to create lead immediately? 
            // Or just wait for first message. We wait for first message to keep it simple.
        }
    }

    const handleSendMessage = async () => {
        if (!inputText.trim()) return

        const userMsg = inputText.trim()
        setInputText('')
        setMessages(prev => [...prev, { role: 'user', text: userMsg }])
        setIsThinking(true)

        try {
            // Include leadDetails only if it's a guest session context
            const payload: {
                message: string
                history: { role: string; parts: { text: string }[] }[]
                leadDetails?: typeof leadForm
            } = {
                message: userMsg,
                history: messages.map(m => ({
                    role: m.role,
                    parts: [{ text: m.text }]
                }))
            }

            if (isGuest) {
                payload.leadDetails = leadForm
            }

            const res = await api.post('/ai/chat', payload)

            setMessages(prev => [...prev, { role: 'model', text: res.data.message }])
        } catch (error) {
            console.error(error)
            setMessages(prev => [...prev, { role: 'model', text: "I'm having trouble connecting. Try again?" }])
        } finally {
            setIsThinking(false)
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSendMessage()
    }

    // Ticket State
    const [mode, setMode] = React.useState<'chat' | 'ticket'>('chat')
    const [ticketForm, setTicketForm] = React.useState({
        subject: '',
        category: 'GENERAL',
        priority: 'MEDIUM',
        description: ''
    })
    const [ticketFile, setTicketFile] = React.useState<File | null>(null)
    const [isSubmittingTicket, setIsSubmittingTicket] = React.useState(false)
    const [ticketSuccess, setTicketSuccess] = React.useState(false)

    // ... existing refs and effects ...

    const handleTicketSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!ticketForm.subject || !ticketForm.description) return

        setIsSubmittingTicket(true)
        try {
            const formData = new FormData()
            formData.append('subject', ticketForm.subject)
            formData.append('description', ticketForm.description)
            formData.append('category', ticketForm.category)
            formData.append('priority', ticketForm.priority)
            if (ticketFile) {
                formData.append('attachment', ticketFile)
            }

            // Dynamically import ticketApi to avoid circular deps if any, or just use api instance
            // Using direct api call since ticketApi might not be exported individually or just for safety
            await api.post('/tickets', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })

            setTicketSuccess(true)
            setTimeout(() => {
                setTicketSuccess(false)
                setMode('chat')
                setTicketForm({ subject: '', category: 'GENERAL', priority: 'MEDIUM', description: '' })
                setTicketFile(null)
            }, 2000)
        } catch (error) {
            console.error('Failed to create ticket:', error)
        } finally {
            setIsSubmittingTicket(false)
        }
    }

    if (!isOpen) {
        return (
            <Button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-xl bg-purple-600 hover:bg-purple-700 text-white z-[9999] transition-all duration-300 hover:scale-110"
            >
                <Bot className="h-8 w-8" />
            </Button>
        )
    }

    return (
        <Card className="fixed bottom-6 right-6 w-[360px] h-[600px] shadow-2xl z-[9999] flex flex-col overflow-hidden border-purple-200 animate-in slide-in-from-bottom-10 fade-in duration-300">
            {/* Header */}
            <div className="bg-purple-600 p-4 flex justify-between items-center text-white shrink-0 shadow-sm">
                <div className="flex items-center gap-2">
                    {mode === 'ticket' ? (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 -ml-2 text-white hover:bg-purple-500"
                            onClick={() => setMode('chat')}
                        >
                            <Minimize2 className="h-5 w-5 rotate-90" /> {/* Back Icon Proxy */}
                        </Button>
                    ) : (
                        <div className="bg-white/20 p-1.5 rounded-full">
                            <Bot className="h-5 w-5" />
                        </div>
                    )}
                    <div>
                        <h3 className="font-bold text-sm">
                            {mode === 'ticket' ? 'Create Support Ticket' : 'TechWell Assistant'}
                        </h3>
                        <p className="text-[10px] text-purple-100 flex items-center gap-1">
                            {!isGuest ? (
                                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                            ) : null}
                            {mode === 'ticket' ? 'We typically reply in 24h' : (isGuest ? 'Guest Support' : 'Online • Student Support')}
                        </p>
                    </div>
                </div>
                <div className="flex items-center">
                    {!isGuest && mode === 'chat' && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-[10px] h-7 px-2 text-purple-100 hover:text-white hover:bg-purple-500 mr-1"
                            onClick={() => setMode('ticket')}
                        >
                            <Mail className="h-3 w-3 mr-1" /> Ticket
                        </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-purple-100 hover:text-white hover:bg-purple-500" onClick={() => setIsOpen(false)}>
                        <Minimize2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Content Area */}
            {mode === 'ticket' ? (
                <div className="flex-1 overflow-y-auto bg-slate-50 p-4 relative">
                    {ticketSuccess ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 z-10 p-6 text-center animate-in fade-in">
                            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600">
                                <Send className="h-8 w-8" />
                            </div>
                            <h3 className="font-bold text-xl text-green-800">Ticket Created!</h3>
                            <p className="text-muted-foreground mt-2 text-sm">Our support team has been notified. We will get back to you shortly.</p>
                        </div>
                    ) : null}

                    <form onSubmit={handleTicketSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Subject</Label>
                            <Input
                                placeholder="Brief summary of issue"
                                value={ticketForm.subject}
                                onChange={e => setTicketForm({ ...ticketForm, subject: e.target.value })}
                                required
                                className="bg-white"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">Category</Label>
                                <select
                                    className="w-full h-9 rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    value={ticketForm.category}
                                    onChange={e => setTicketForm({ ...ticketForm, category: e.target.value })}
                                    aria-label="Select Ticket Category"
                                >
                                    <option value="GENERAL">General</option>
                                    <option value="TECHNICAL">Technical</option>
                                    <option value="BILLING">Billing</option>
                                    <option value="CONTENT">Course Content</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">Priority</Label>
                                <select
                                    className="w-full h-9 rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    value={ticketForm.priority}
                                    onChange={e => setTicketForm({ ...ticketForm, priority: e.target.value })}
                                    aria-label="Select Priority"
                                >
                                    <option value="LOW">Low</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="HIGH">High</option>
                                    <option value="URGENT">Urgent</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Description</Label>
                            <textarea
                                className="flex min-h-[120px] w-full rounded-md border border-input bg-white px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="Please describe your issue in detail..."
                                value={ticketForm.description}
                                onChange={e => setTicketForm({ ...ticketForm, description: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Attachment (Optional)</Label>
                            <Input
                                type="file"
                                className="bg-white cursor-pointer"
                                onChange={e => setTicketFile(e.target.files?.[0] || null)}
                            />
                        </div>

                        <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={isSubmittingTicket}>
                            {isSubmittingTicket ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin mr-2"></span>
                                    Creating Ticket...
                                </>
                            ) : 'Submit Ticket'}
                        </Button>
                    </form>
                </div>
            ) : hasProvidedDetails ? (
                <>
                    {/* Chat Area */}
                    <div className="flex-1 overflow-y-auto bg-slate-50 p-4 space-y-4" ref={scrollRef}>
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm shadow-sm whitespace-pre-wrap ${msg.role === 'user'
                                        ? 'bg-purple-600 text-white rounded-br-none'
                                        : 'bg-white text-slate-800 border rounded-bl-none'
                                        }`}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isThinking && (
                            <div className="flex justify-start">
                                <div className="bg-white border rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="p-3 bg-white border-t flex gap-2 shrink-0">
                        <Input
                            placeholder="Ask me anything..."
                            className="focus-visible:ring-purple-500"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={handleKeyPress}
                        />
                        <Button
                            size="icon"
                            className="bg-purple-600 hover:bg-purple-700"
                            onClick={handleSendMessage}
                            disabled={isThinking || !inputText.trim()}
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </>
            ) : (
                /* Guest Lead Form */
                <div className="flex-1 p-6 bg-slate-50 flex flex-col justify-center gap-3">
                    <div className="text-center mb-2">
                        <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 text-purple-600">
                            <User className="h-8 w-8" />
                        </div>
                        <h3 className="font-bold text-gray-800">Welcome, Guest!</h3>
                        <p className="text-sm text-gray-500">Please introduce yourself to start chatting.</p>
                    </div>

                    <form onSubmit={handleLeadSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <Label>Full Name <span className="text-red-500">*</span></Label>
                            <Input
                                required
                                placeholder="John Doe"
                                value={leadForm.name}
                                onChange={e => setLeadForm({ ...leadForm, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label>Mobile Number</Label>
                            <div className="relative">
                                <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                                <Input
                                    className="pl-9"
                                    placeholder="+91..."
                                    value={leadForm.phone}
                                    onChange={e => setLeadForm({ ...leadForm, phone: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <Label>Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                                <Input
                                    className="pl-9"
                                    type="email"
                                    placeholder="john@example.com"
                                    value={leadForm.email}
                                    onChange={e => setLeadForm({ ...leadForm, email: e.target.value })}
                                />
                            </div>
                        </div>
                        <p className="text-xs text-gray-400 text-center">
                            We&apos;ll use this to contact you about your query.
                        </p>
                        <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 mt-2">
                            Start Chatting
                        </Button>
                    </form>
                </div>
            )}
        </Card>
    )
}
