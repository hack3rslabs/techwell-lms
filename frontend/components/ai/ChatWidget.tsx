"use client"

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Bot, Send, X, User, Phone, MessageSquare,
    Sparkles, Shield, Zap, Mail, ChevronRight, Minimize2
} from 'lucide-react'
import api from '@/lib/api'

// ─── Types ────────────────────────────────────────────────────────────────────
interface Message {
    role: 'user' | 'model'
    text: string
}

interface LeadForm {
    name: string
    phone: string
    message: string
}

interface LeadErrors {
    name?: string
    phone?: string
    message?: string
}

// ─── Quick Reply Chips ────────────────────────────────────────────────────────
const QUICK_REPLIES = [
    { label: '📚 Explore Courses',     text: 'Tell me about your courses and learning paths.' },
    { label: '🎯 Mock Interviews',     text: 'How does your AI interview practice work?' },
    { label: '🏢 Corporate Training',  text: 'I need corporate training for my team.' },
    { label: '💼 Placement Support',   text: 'What placement services do you offer?' },
    { label: '💰 Pricing',             text: 'What does it cost to enroll?' },
]

// ─── Markdown-lite bold renderer ──────────────────────────────────────────────
function renderBotText(text: string) {
    const parts = text.split(/(\*\*[^*]+\*\*)/g)
    return parts.map((part, i) =>
        part.startsWith('**') && part.endsWith('**')
            ? <strong key={i}>{part.slice(2, -2)}</strong>
            : <React.Fragment key={i}>{part}</React.Fragment>
    )
}

// ─── Ticket defaults ──────────────────────────────────────────────────────────
const DEFAULT_TICKET = { subject: '', category: 'GENERAL', priority: 'MEDIUM', description: '' }

// ─────────────────────────────────────────────────────────────────────────────
export default function ChatWidget() {
    const [isOpen, setIsOpen] = React.useState(false)

    // Chat state
    const [messages, setMessages] = React.useState<Message[]>([])
    const [inputText, setInputText]   = React.useState('')
    const [isThinking, setIsThinking] = React.useState(false)
    const [showQuickReplies, setShowQuickReplies] = React.useState(true)

    // Auth / Lead
    const [isGuest,           setIsGuest]           = React.useState(true)
    const [hasProvidedDetails, setHasProvidedDetails] = React.useState(false)
    const [isSubmittingLead,  setIsSubmittingLead]  = React.useState(false)
    const [leadForm,          setLeadForm]          = React.useState<LeadForm>({ name: '', phone: '', message: '' })
    const [leadErrors,        setLeadErrors]        = React.useState<LeadErrors>({})

    // Stored lead details for guest context
    const leadRef = React.useRef<LeadForm>({ name: '', phone: '', message: '' })

    // Ticket
    const [mode,               setMode]               = React.useState<'chat' | 'ticket'>('chat')
    const [ticketForm,         setTicketForm]         = React.useState(DEFAULT_TICKET)
    const [ticketFile,         setTicketFile]         = React.useState<File | null>(null)
    const [isSubmittingTicket, setIsSubmittingTicket] = React.useState(false)
    const [ticketSuccess,      setTicketSuccess]      = React.useState(false)

    const scrollRef = React.useRef<HTMLDivElement>(null)
    const inputRef  = React.useRef<HTMLInputElement>(null)

    // ── Check if logged-in user ─────────────────────────────────────────────
    React.useEffect(() => {
        const token = localStorage.getItem('token')
        if (token) {
            setIsGuest(false)
            setHasProvidedDetails(true)
            setMessages([{
                role: 'model',
                text: "Welcome back! I'm your TechWell AI Assistant. How can I help with your learning journey today?"
            }])
        }
    }, [])

    // ── Auto-scroll ─────────────────────────────────────────────────────────
    React.useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages, isOpen, hasProvidedDetails])

    // ── Auto-focus input ────────────────────────────────────────────────────
    React.useEffect(() => {
        if (isOpen && hasProvidedDetails && mode === 'chat') {
            setTimeout(() => inputRef.current?.focus(), 150)
        }
    }, [isOpen, hasProvidedDetails, mode])

    // ── Validate lead form ──────────────────────────────────────────────────
    const validateLead = (): LeadErrors => {
        const errs: LeadErrors = {}
        if (!leadForm.name.trim())    errs.name    = 'Please enter your name'
        if (!leadForm.phone.trim())   errs.phone   = 'Please enter your phone number'
        if (!leadForm.message.trim()) errs.message = 'Please describe how we can help you'
        return errs
    }

    // ── Submit lead form → create lead → start chat with their message ──────
    const handleLeadSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const errs = validateLead()
        if (Object.keys(errs).length) { setLeadErrors(errs); return }
        setLeadErrors({})
        setIsSubmittingLead(true)

        // Store details for subsequent API calls
        leadRef.current = { ...leadForm }

        try {
            // Create lead immediately
            await api.post('/ai/chat', {
                message: leadForm.message,
                history: [],
                leadDetails: {
                    name:    leadForm.name,
                    phone:   leadForm.phone,
                    email:   null,
                    organization: null,
                }
            }).then(res => {
                // Transition to chat and seed with user message + AI response
                setMessages([
                    { role: 'user',  text: leadForm.message },
                    { role: 'model', text: res.data.message },
                ])
                setShowQuickReplies(false)
                setHasProvidedDetails(true)
            })
        } catch {
            // Even if API fails, still open chat with their message
            setMessages([
                { role: 'user', text: leadForm.message },
                { role: 'model', text: "Thank you for reaching out! Our team has received your inquiry and will follow up shortly. In the meantime, feel free to ask me anything." }
            ])
            setShowQuickReplies(false)
            setHasProvidedDetails(true)
        } finally {
            setIsSubmittingLead(false)
        }
    }

    // ── Send follow-up message ──────────────────────────────────────────────
    const handleSendMessage = async (overrideText?: string) => {
        const userMsg = (overrideText ?? inputText).trim()
        if (!userMsg) return

        setInputText('')
        setShowQuickReplies(false)
        setMessages(prev => [...prev, { role: 'user', text: userMsg }])
        setIsThinking(true)

        try {
            const payload: {
                message: string
                history: { role: string; parts: { text: string }[] }[]
                leadDetails?: {
                    name: string; phone: string; email: null; organization: null;
                }
            } = {
                message: userMsg,
                history: messages.map(m => ({ role: m.role, parts: [{ text: m.text }] }))
            }

            if (isGuest) {
                payload.leadDetails = {
                    name:         leadRef.current.name,
                    phone:        leadRef.current.phone,
                    email:        null,
                    organization: null,
                }
            }

            const res = await api.post('/ai/chat', payload)
            setMessages(prev => [...prev, { role: 'model', text: res.data.message }])
        } catch {
            setMessages(prev => [...prev, {
                role: 'model',
                text: "I'm having trouble connecting right now. Please try again or reach us at support@techwell.co.in."
            }])
        } finally {
            setIsThinking(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage() }
    }

    // ── Ticket submit ───────────────────────────────────────────────────────
    const handleTicketSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!ticketForm.subject || !ticketForm.description) return
        setIsSubmittingTicket(true)
        try {
            const fd = new FormData()
            fd.append('subject',     ticketForm.subject)
            fd.append('description', ticketForm.description)
            fd.append('category',    ticketForm.category)
            fd.append('priority',    ticketForm.priority)
            if (ticketFile) fd.append('attachment', ticketFile)
            await api.post('/tickets', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
            setTicketSuccess(true)
            setTimeout(() => {
                setTicketSuccess(false); setMode('chat')
                setTicketForm(DEFAULT_TICKET); setTicketFile(null)
            }, 2500)
        } catch { /* silent */ } finally { setIsSubmittingTicket(false) }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // FAB — collapsed state
    // ═══════════════════════════════════════════════════════════════════════════
    if (!isOpen) {
        return (
            <div className="fixed bottom-6 right-6 z-[9999] group">
                <span className="absolute inset-0 rounded-full bg-violet-500 opacity-25 animate-ping" />
                <Button
                    id="chat-widget-open-btn"
                    onClick={() => setIsOpen(true)}
                    className="relative h-14 w-14 rounded-full shadow-2xl bg-gradient-to-br from-violet-600 to-indigo-700 hover:from-violet-500 hover:to-indigo-600 text-white transition-all duration-300 hover:scale-110 border border-white/10"
                    aria-label="Open TechWell AI Assistant"
                >
                    <Bot className="h-7 w-7" />
                </Button>
                {/* Hover tooltip */}
                <div className="absolute bottom-[4.5rem] right-0 bg-gray-900 text-white text-xs rounded-xl px-3 py-2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-2xl pointer-events-none border border-white/10">
                    <p className="font-semibold text-violet-300">TechWell AI</p>
                    <p className="text-slate-400 text-[10px]">Chat with us now</p>
                    <div className="absolute -bottom-1.5 right-5 w-3 h-3 bg-gray-900 rotate-45 border-r border-b border-white/10" />
                </div>
            </div>
        )
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Main Widget
    // ═══════════════════════════════════════════════════════════════════════════
    return (
        <div
            id="chat-widget-panel"
            className="fixed bottom-6 right-6 w-[380px] z-[9999] flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-white/10 animate-in slide-in-from-bottom-8 fade-in duration-300"
            style={{
                background:     'rgba(13, 13, 23, 0.97)',
                backdropFilter: 'blur(24px)',
                maxHeight:      '92vh',
            }}
        >
            {/* ── Header ─────────────────────────────────────────────────── */}
            <div className="shrink-0 bg-gradient-to-r from-violet-700 via-indigo-700 to-purple-800 px-4 py-3 flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-3">
                    {mode === 'ticket' ? (
                        <Button
                            variant="ghost" size="icon"
                            className="h-8 w-8 -ml-1 text-white/80 hover:text-white hover:bg-white/10"
                            onClick={() => setMode('chat')}
                            aria-label="Back to chat"
                        >
                            <ChevronRight className="h-5 w-5 rotate-180" />
                        </Button>
                    ) : (
                        <div className="relative shrink-0">
                            <div className="h-9 w-9 rounded-full bg-white/15 flex items-center justify-center border border-white/20 shadow-inner">
                                <Bot className="h-5 w-5 text-white" />
                            </div>
                            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 bg-emerald-400 rounded-full border-2 border-indigo-800 animate-pulse" />
                        </div>
                    )}
                    <div>
                        <h3 className="font-bold text-white text-sm leading-tight">
                            {mode === 'ticket' ? 'Create Support Ticket' : 'TechWell AI Receptionist'}
                        </h3>
                        <p className="text-[10px] text-violet-200 flex items-center gap-1 mt-0.5">
                            <Sparkles className="h-2.5 w-2.5" />
                            {mode === 'ticket'
                                ? 'We reply within 24 hours'
                                : isGuest
                                    ? 'AI Front Desk · techwell.co.in'
                                    : 'Online · Student Assistant'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    {!isGuest && mode === 'chat' && (
                        <Button
                            variant="ghost" size="sm"
                            className="text-[10px] h-7 px-2.5 text-violet-200 hover:text-white hover:bg-white/10 rounded-md"
                            onClick={() => setMode('ticket')}
                        >
                            <Mail className="h-3 w-3 mr-1" /> Ticket
                        </Button>
                    )}
                    <Button
                        variant="ghost" size="icon"
                        id="chat-widget-close-btn"
                        className="h-8 w-8 text-violet-200 hover:text-white hover:bg-white/10 rounded-full"
                        onClick={() => setIsOpen(false)}
                        aria-label="Close chat"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* ── Trust bar (shown once chat is active) ─────────────────── */}
            {mode === 'chat' && hasProvidedDetails && (
                <div className="shrink-0 border-b border-white/5 px-4 py-1.5 flex items-center gap-3 text-[10px] text-indigo-300"
                    style={{ background: 'rgba(30,20,60,0.5)' }}>
                    <span className="flex items-center gap-1"><Shield className="h-2.5 w-2.5 text-emerald-400" /> Confidential</span>
                    <span className="text-white/20">|</span>
                    <span className="flex items-center gap-1"><Zap className="h-2.5 w-2.5 text-amber-400" /> Gemini AI</span>
                    <span className="text-white/20">|</span>
                    <span>Replies in seconds</span>
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════════
                TICKET MODE
            ══════════════════════════════════════════════════════════════ */}
            {mode === 'ticket' ? (
                <div className="flex-1 overflow-y-auto p-4 relative" style={{ background: 'rgba(10,10,20,0.8)' }}>
                    {ticketSuccess && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-6 text-center animate-in fade-in"
                            style={{ background: 'rgba(10,10,20,0.97)' }}>
                            <div className="h-16 w-16 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center justify-center mb-4">
                                <Send className="h-7 w-7 text-emerald-400" />
                            </div>
                            <h3 className="font-bold text-xl text-white">Ticket Created!</h3>
                            <p className="text-slate-400 mt-2 text-sm">Our team will respond within 24 hours.</p>
                        </div>
                    )}
                    <form onSubmit={handleTicketSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-slate-300">Subject</Label>
                            <Input
                                placeholder="Brief summary of your issue"
                                value={ticketForm.subject}
                                required
                                onChange={e => setTicketForm({ ...ticketForm, subject: e.target.value })}
                                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-violet-500 text-sm"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { label: 'Category', key: 'category', opts: [['GENERAL','General'],['TECHNICAL','Technical'],['BILLING','Billing'],['CONTENT','Content']] },
                                { label: 'Priority',  key: 'priority',  opts: [['LOW','Low'],['MEDIUM','Medium'],['HIGH','High'],['URGENT','Urgent']] },
                            ].map(s => (
                                <div key={s.key} className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-slate-300">{s.label}</Label>
                                    <select
                                        aria-label={`Select ${s.label}`}
                                        className="w-full h-9 rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-violet-500"
                                        value={(ticketForm as Record<string, string>)[s.key]}
                                        onChange={e => setTicketForm({ ...ticketForm, [s.key]: e.target.value })}
                                    >
                                        {s.opts.map(([v, l]) => <option key={v} value={v} className="bg-gray-900">{l}</option>)}
                                    </select>
                                </div>
                            ))}
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-slate-300">Description</Label>
                            <textarea
                                className="flex min-h-[110px] w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                                placeholder="Describe your issue in detail..."
                                value={ticketForm.description}
                                onChange={e => setTicketForm({ ...ticketForm, description: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-slate-300">Attachment (Optional)</Label>
                            <Input
                                type="file"
                                className="bg-white/5 border-white/10 text-slate-300 text-xs cursor-pointer file:text-violet-300 file:bg-transparent file:border-0 file:text-xs"
                                onChange={e => setTicketFile(e.target.files?.[0] || null)}
                            />
                        </div>
                        <Button
                            type="submit" disabled={isSubmittingTicket}
                            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold shadow-lg"
                        >
                            {isSubmittingTicket
                                ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin mr-2" />Submitting…</>
                                : 'Submit Ticket'}
                        </Button>
                    </form>
                </div>

            /* ══════════════════════════════════════════════════════════════
               LEAD CAPTURE FORM (3-field: Name + Phone + Message)
            ══════════════════════════════════════════════════════════════ */
            ) : !hasProvidedDetails ? (
                <div className="flex-1 p-5 flex flex-col justify-center gap-4 overflow-y-auto"
                    style={{ background: 'rgba(10,10,20,0.85)' }}>
                    {/* Hero */}
                    <div className="text-center">
                        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center mx-auto mb-3 shadow-xl shadow-violet-900/40">
                            <Bot className="h-7 w-7 text-white" />
                        </div>
                        <h3 className="font-bold text-white text-base">How can we help you?</h3>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                            Tell us a bit about yourself and your inquiry.<br />
                            We&apos;ll respond instantly via AI and follow up personally.
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleLeadSubmit} className="space-y-3" noValidate>

                        {/* Name */}
                        <div className="space-y-1">
                            <Label className="text-xs text-slate-300 font-semibold flex items-center gap-1">
                                <User className="h-3 w-3 text-violet-400" />
                                Your Name <span className="text-red-400 ml-0.5">*</span>
                            </Label>
                            <Input
                                id="lead-name"
                                required
                                autoFocus
                                placeholder="e.g. Rahul Sharma"
                                value={leadForm.name}
                                onChange={e => setLeadForm({ ...leadForm, name: e.target.value })}
                                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-violet-500 text-sm"
                                aria-label="Your Name"
                            />
                            {leadErrors.name && (
                                <p className="text-[10px] text-red-400 flex items-center gap-1 mt-0.5">
                                    <span className="w-1 h-1 rounded-full bg-red-400 inline-block" />
                                    {leadErrors.name}
                                </p>
                            )}
                        </div>

                        {/* Phone */}
                        <div className="space-y-1">
                            <Label className="text-xs text-slate-300 font-semibold flex items-center gap-1">
                                <Phone className="h-3 w-3 text-violet-400" />
                                Phone Number <span className="text-red-400 ml-0.5">*</span>
                            </Label>
                            <Input
                                id="lead-phone"
                                required
                                placeholder="e.g. +91 9876543210"
                                value={leadForm.phone}
                                onChange={e => setLeadForm({ ...leadForm, phone: e.target.value })}
                                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-violet-500 text-sm"
                                aria-label="Phone Number"
                                inputMode="tel"
                            />
                            {leadErrors.phone && (
                                <p className="text-[10px] text-red-400 flex items-center gap-1 mt-0.5">
                                    <span className="w-1 h-1 rounded-full bg-red-400 inline-block" />
                                    {leadErrors.phone}
                                </p>
                            )}
                        </div>

                        {/* Message / Inquiry */}
                        <div className="space-y-1">
                            <Label className="text-xs text-slate-300 font-semibold flex items-center gap-1">
                                <MessageSquare className="h-3 w-3 text-violet-400" />
                                Your Inquiry <span className="text-red-400 ml-0.5">*</span>
                            </Label>
                            <textarea
                                id="lead-message"
                                required
                                rows={3}
                                placeholder="e.g. I want to learn Data Science and get placed in MNCs…"
                                value={leadForm.message}
                                onChange={e => setLeadForm({ ...leadForm, message: e.target.value })}
                                className="flex w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none"
                                aria-label="Your Inquiry"
                            />
                            {leadErrors.message && (
                                <p className="text-[10px] text-red-400 flex items-center gap-1 mt-0.5">
                                    <span className="w-1 h-1 rounded-full bg-red-400 inline-block" />
                                    {leadErrors.message}
                                </p>
                            )}
                        </div>

                        {/* Privacy note */}
                        <p className="text-[10px] text-slate-500 text-center">
                            Your details are kept confidential and used only to assist with your inquiry.
                        </p>

                        {/* Submit */}
                        <Button
                            type="submit"
                            id="chat-lead-start-btn"
                            disabled={isSubmittingLead}
                            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-violet-900/30 py-5 text-sm"
                        >
                            {isSubmittingLead ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin mr-2" />
                                    Sending your request…
                                </>
                            ) : (
                                <>
                                    <Send className="h-4 w-4 mr-2" />
                                    Send &amp; Start Conversation
                                </>
                            )}
                        </Button>
                    </form>
                </div>

            /* ══════════════════════════════════════════════════════════════
               CHAT MODE
            ══════════════════════════════════════════════════════════════ */
            ) : (
                <>
                    {/* Messages */}
                    <div
                        ref={scrollRef}
                        className="flex-1 overflow-y-auto p-4 space-y-3"
                        style={{ background: 'rgba(10,10,20,0.85)', minHeight: '320px', maxHeight: '420px' }}
                    >
                        {/* Lead context badge (guests only) */}
                        {isGuest && leadRef.current.name && (
                            <div className="flex justify-center mb-1">
                                <span className="text-[10px] px-3 py-1 rounded-full border border-violet-500/30 text-violet-300 bg-violet-900/20">
                                    🎫 Lead created · {leadRef.current.name}
                                </span>
                            </div>
                        )}

                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-2 items-end`}>
                                {msg.role === 'model' && (
                                    <div className="h-7 w-7 rounded-full bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center shrink-0 shadow-md mb-0.5">
                                        <Bot className="h-3.5 w-3.5 text-white" />
                                    </div>
                                )}
                                <div
                                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-md whitespace-pre-wrap ${
                                        msg.role === 'user'
                                            ? 'bg-gradient-to-br from-violet-600 to-indigo-700 text-white rounded-br-sm'
                                            : 'border border-white/10 text-slate-200 rounded-bl-sm'
                                    }`}
                                    style={msg.role === 'model' ? { background: 'rgba(255,255,255,0.07)' } : {}}
                                >
                                    {msg.role === 'model' ? renderBotText(msg.text) : msg.text}
                                </div>
                                {msg.role === 'user' && (
                                    <div className="h-7 w-7 rounded-full bg-slate-700 flex items-center justify-center shrink-0 mb-0.5">
                                        <User className="h-3.5 w-3.5 text-slate-300" />
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Typing indicator */}
                        {isThinking && (
                            <div className="flex justify-start gap-2 items-end">
                                <div className="h-7 w-7 rounded-full bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center shrink-0 shadow-md">
                                    <Bot className="h-3.5 w-3.5 text-white" />
                                </div>
                                <div className="rounded-2xl rounded-bl-sm px-4 py-3 shadow-md flex items-center gap-1.5 border border-white/10"
                                    style={{ background: 'rgba(255,255,255,0.07)' }}>
                                    {['-0.4s', '-0.2s', '0s'].map((d, i) => (
                                        <span key={i} className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce"
                                            style={{ animationDelay: d }} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quick reply chips — shown only at very start for logged-in users */}
                        {showQuickReplies && !isThinking && messages.length === 1 && !isGuest && (
                            <div className="flex flex-wrap gap-2 pt-1">
                                {QUICK_REPLIES.map(qr => (
                                    <button
                                        key={qr.label}
                                        onClick={() => handleSendMessage(qr.text)}
                                        className="text-[11px] px-3 py-1.5 rounded-full border border-violet-500/40 text-violet-300 hover:bg-violet-600/20 hover:border-violet-400 transition-all duration-150 bg-violet-900/20"
                                    >
                                        {qr.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Input bar */}
                    <div className="shrink-0 p-3 border-t border-white/8 flex gap-2"
                        style={{ background: 'rgba(8,8,18,0.97)' }}>
                        <Input
                            ref={inputRef}
                            id="chat-widget-input"
                            placeholder="Type your message…"
                            value={inputText}
                            onChange={e => setInputText(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={isThinking}
                            className="flex-1 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-violet-500 text-sm"
                            style={{ background: 'rgba(255,255,255,0.05)' }}
                        />
                        <Button
                            id="chat-widget-send-btn"
                            size="icon"
                            onClick={() => handleSendMessage()}
                            disabled={isThinking || !inputText.trim()}
                            className="bg-gradient-to-br from-violet-600 to-indigo-700 hover:from-violet-500 hover:to-indigo-600 text-white shadow-md disabled:opacity-40 shrink-0"
                            aria-label="Send message"
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </>
            )}

            {/* Footer */}
            <div className="shrink-0 py-1.5 text-center text-[9px] text-slate-600 border-t border-white/5"
                style={{ background: 'rgba(8,8,18,0.97)' }}>
                Powered by <span className="text-violet-400 font-semibold">TechWell AI</span> · techwell.co.in
            </div>
        </div>
    )
}
