"use client"

import React, { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import api from '@/lib/api'

export default function AiChatbot() {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hi there! I am the Techwell AI Assistant. How can I help you today?' }
    ])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        if (isOpen) {
            scrollToBottom()
        }
    }, [messages, isOpen])

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim()) return

        const userMsg = input.trim()
        setInput('')
        setMessages(prev => [...prev, { role: 'user', content: userMsg }])
        setIsLoading(true)

        try {
            // Use axios to hit the backend chat endpoint
            const res = await api.post('/ai/chat', { message: userMsg })
            setMessages(prev => [...prev, { role: 'assistant', content: res.data.message || res.data.reply }])
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: "I'm sorry, I am having trouble connecting to my brain right now. Please try again later." }])
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {isOpen && (
                <Card className="w-[350px] sm:w-[400px] h-[500px] mb-4 shadow-2xl border-white/20 glass flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
                    <CardHeader className="bg-primary text-primary-foreground py-3 px-4 flex flex-row items-center justify-between space-y-0">
                        <div className="flex items-center gap-2">
                            <Bot className="w-5 h-5" />
                            <CardTitle className="text-md font-medium">Techwell AI Assistant</CardTitle>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20 hover:text-white rounded-full" onClick={() => setIsOpen(false)}>
                            <X className="w-4 h-4" />
                        </Button>
                    </CardHeader>
                    
                    <CardContent className="flex-1 p-4 overflow-y-auto flex flex-col gap-4 bg-muted/10">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-primary/20 text-primary' : 'bg-primary text-primary-foreground'}`}>
                                    {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                </div>
                                <div className={`p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-background border border-border/50 rounded-tl-sm'}`}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex gap-3 max-w-[85%] self-start">
                                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                                    <Bot className="w-4 h-4" />
                                </div>
                                <div className="p-4 rounded-2xl bg-background border border-border/50 rounded-tl-sm flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                    <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                    <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce"></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </CardContent>

                    <div className="p-3 bg-background border-t border-border/50">
                        <form onSubmit={handleSend} className="flex gap-2 items-center">
                            <Input 
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                placeholder="Ask a question..."
                                className="flex-1 rounded-full bg-muted/50 border-transparent focus-visible:ring-1 focus-visible:ring-primary"
                            />
                            <Button type="submit" size="icon" disabled={!input.trim() || isLoading} className="rounded-full shrink-0 w-10 h-10 bg-primary hover:bg-primary/90">
                                <Send className="w-4 h-4" />
                            </Button>
                        </form>
                    </div>
                </Card>
            )}
            
            {!isOpen && (
                <Button 
                    onClick={() => setIsOpen(true)}
                    className="w-14 h-14 rounded-full shadow-2xl bg-primary hover:bg-primary/90 hover:scale-105 transition-transform flex items-center justify-center relative group"
                >
                    <MessageCircle className="w-6 h-6 text-white" />
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                    <div className="absolute right-16 px-3 py-1.5 bg-background text-foreground text-xs font-medium rounded-lg whitespace-nowrap shadow-xl border opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        Chat with us
                    </div>
                </Button>
            )}
        </div>
    )
}
