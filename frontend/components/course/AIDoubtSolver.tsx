"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Bot, Send, X, MessageSquare, Loader2 } from 'lucide-react'
import api from '@/lib/api'
import { cn } from '@/lib/utils'

interface AIDoubtSolverProps {
    courseTitle: string
    lessonTitle: string
    lessonContent?: string
}

interface ChatMessage {
    id: string
    role: 'user' | 'model'
    text: string
}

export function AIDoubtSolver({ courseTitle, lessonTitle, lessonContent }: AIDoubtSolverProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<ChatMessage[]>([
        { id: '1', role: 'model', text: `Hi! I'm your Techwell AI Tutor. I see you're currently studying "${lessonTitle}". Need any help understanding the concepts?` }
    ])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    // Reset when lesson changes
    useEffect(() => {
        if (isOpen) {
            setMessages([{ id: Date.now().toString(), role: 'model', text: `You've switched to "${lessonTitle}". How can I help with this topic?` }])
        }
    }, [lessonTitle])

    const handleSend = async () => {
        if (!input.trim() || isLoading) return

        const userMsg = input.trim()
        setInput('')
        
        const newMessages: ChatMessage[] = [
            ...messages,
            { id: Date.now().toString(), role: 'user', text: userMsg }
        ]
        setMessages(newMessages)
        setIsLoading(true)

        try {
            // Format history for Gemini
            const history = messages.map(m => ({
                role: m.role,
                parts: [{ text: m.text }]
            }))

            const res = await api.post('/ai/doubt-solver', {
                message: userMsg,
                history,
                courseTitle,
                lessonTitle,
                lessonContent
            })

            setMessages(prev => [
                ...prev,
                { id: Date.now().toString(), role: 'model', text: res.data.message }
            ])
        } catch (error) {
            console.error("Doubt Solver Error", error)
            setMessages(prev => [
                ...prev,
                { id: Date.now().toString(), role: 'model', text: "I'm having trouble connecting right now. Please try again later." }
            ])
        } finally {
            setIsLoading(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    return (
        <>
            {/* Floating Action Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 p-4 bg-primary text-primary-foreground rounded-full shadow-2xl hover:scale-105 transition-transform z-50 flex items-center justify-center animate-bounce-in ring-4 ring-primary/20"
                >
                    <Bot className="h-6 w-6" />
                </button>
            )}

            {/* Chat Panel */}
            <div className={cn(
                "fixed bottom-6 right-6 w-[350px] md:w-[400px] bg-background/95 backdrop-blur-xl border shadow-2xl rounded-2xl flex flex-col overflow-hidden z-50 transition-all duration-300 transform origin-bottom-right",
                isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0 pointer-events-none"
            )}>
                {/* Header */}
                <div className="p-4 bg-gradient-to-r from-indigo-600 to-primary text-white flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-1.5 rounded-lg">
                            <Bot className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm">Techwell Tutor</h3>
                            <p className="text-[10px] text-white/80 opacity-90 truncate max-w-[200px]">Context: {lessonTitle}</p>
                        </div>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 p-4 overflow-y-auto max-h-[400px] min-h-[300px] space-y-4 custom-scrollbar bg-slate-50/50 dark:bg-slate-900/50">
                    {messages.map(msg => (
                        <div key={msg.id} className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
                            <div className={cn(
                                "max-w-[85%] rounded-2xl p-3 text-sm shadow-sm",
                                msg.role === 'user' 
                                    ? "bg-primary text-primary-foreground rounded-tr-sm" 
                                    : "bg-white dark:bg-slate-800 border rounded-tl-sm text-foreground prose prose-sm dark:prose-invert prose-p:leading-snug"
                            )}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="max-w-[85%] rounded-2xl p-4 bg-white dark:bg-slate-800 border rounded-tl-sm shadow-sm">
                                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-3 bg-background border-t shrink-0">
                    <div className="relative">
                        <Input
                            placeholder="Ask a doubt..."
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="pr-12 py-6 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900"
                        />
                        <Button 
                            size="icon" 
                            className="absolute right-1.5 top-1.5 h-9 w-9 rounded-lg"
                            onClick={handleSend}
                            disabled={!input.trim() || isLoading}
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="text-center mt-2">
                        <span className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
                            <MessageSquare className="h-3 w-3" /> AI Tutor Context-Aware Response
                        </span>
                    </div>
                </div>
            </div>
        </>
    )
}
