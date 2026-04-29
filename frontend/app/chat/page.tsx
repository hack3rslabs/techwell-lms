"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Bot, Send, User, LogIn, Sparkles, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const GUEST_MESSAGE_LIMIT = 5;

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export default function TechWellGPTPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userMessageCount, setUserMessageCount] = useState(0);
    const [showLimitWarning, setShowLimitWarning] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const router = useRouter();

    useEffect(() => {
        // Check if user is logged in
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        // Auto-resize textarea
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [inputText]);

    const handleSendMessage = async () => {
        if (!inputText.trim() || isThinking) return;

        // Check message limit for guests
        if (!isLoggedIn && userMessageCount >= GUEST_MESSAGE_LIMIT) {
            setShowLimitWarning(true);
            return;
        }

        const userMessage: Message = { role: 'user', content: inputText.trim() };
        const newMessages = [...messages, userMessage];

        setMessages(newMessages);
        setInputText('');
        setIsThinking(true);
        setUserMessageCount(prev => prev + 1);

        try {
            // Fix: Ensure we don't double up on /api if it's already in the env var
            const baseUrl = API_URL.endsWith('/api') ? API_URL : `${API_URL}/api`;
            const endpoint = `${baseUrl}/chatgpt`;

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: newMessages.map(m => ({ role: m.role, content: m.content }))
                })
            });

            const data = await response.json();

            if (!response.ok) {
                // Handle Quota Exceeded (429) specially with a fallback mock response
                if (response.status === 429 || data.error?.includes('quota')) {
                    console.warn("OpenAI Quota Exceeded - Using Mock Fallback");

                    // Simple mock response logic since AI is down
                    let mockReply = "I'm currently operating in offline mode due to high traffic. ";
                    const lastUserMsg = userMessage.content.toLowerCase();

                    if (lastUserMsg.includes('sql') && lastUserMsg.includes('nosql')) {
                        mockReply += "SQL databases are relational, table-based (like MySQL), while NoSQL databases are non-relational, document or key-value based (like MongoDB). SQL is better for complex queries and transactions, while NoSQL scales better for large, unstructured data.";
                    } else if (lastUserMsg.includes('react') && lastUserMsg.includes('hook')) {
                        mockReply += "React Hooks allow function components to have state and lifecycle features. Common examples are useState (for state) and useEffect (for side effects).";
                    } else {
                        mockReply += "I can't access my full brain right now, but feel free to ask basic questions!";
                    }

                    setMessages([...newMessages, {
                        role: 'assistant',
                        content: mockReply
                    }]);
                    return;
                }

                throw new Error(data.error || 'Failed to get response');
            }

            if (data.error) {
                setMessages([...newMessages, {
                    role: 'assistant',
                    content: `Error: ${data.error}`
                }]);
            } else {
                setMessages([...newMessages, {
                    role: 'assistant',
                    content: data.message
                }]);
            }

            // Show warning when approaching limit
            if (!isLoggedIn && userMessageCount + 1 >= GUEST_MESSAGE_LIMIT - 1) {
                setShowLimitWarning(true);
            }
        } catch (error) {
            console.error("Chat Error:", error);
            setMessages([...newMessages, {
                role: 'assistant',
                content: "I'm having trouble connecting right now. Please check your internet connection or try again later."
            }]);
        } finally {
            setIsThinking(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const startNewChat = () => {
        setMessages([]);
        setInputText('');
        setUserMessageCount(0);
        setShowLimitWarning(false);
    };

    const handleLogin = () => {
        router.push('/login?redirect=/chat');
    };

    const messagesRemaining = GUEST_MESSAGE_LIMIT - userMessageCount;

    return (
        <div className="flex flex-col h-screen bg-[#343541]">
            {/* Header */}
            <div className="h-14 bg-[#343541] border-b border-white/10 flex items-center justify-between px-4">
                <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-purple-500 to-blue-500 p-1.5 rounded-md">
                        <Bot className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-white font-medium">Techwell GPT</span>
                </div>

                <div className="flex items-center gap-3">
                    {!isLoggedIn && (
                        <div className="text-xs text-white/60 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                            {messagesRemaining > 0 ? (
                                <>{messagesRemaining} messages remaining</>
                            ) : (
                                <>Limit reached</>
                            )}
                        </div>
                    )}

                    <Button
                        onClick={startNewChat}
                        size="sm"
                        variant="ghost"
                        className="text-white hover:bg-white/10"
                    >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        New Chat
                    </Button>

                    {isLoggedIn ? (
                        <Link href="/student">
                            <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                                <User className="h-4 w-4 mr-2" />
                                Dashboard
                            </Button>
                        </Link>
                    ) : (
                        <Button onClick={handleLogin} size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                            <LogIn className="h-4 w-4 mr-2" />
                            Login
                        </Button>
                    )}
                </div>
            </div>

            {/* Messages */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto"
            >
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-white/60 px-4">
                        <div className="bg-gradient-to-br from-purple-500 to-blue-500 p-4 rounded-2xl mb-6">
                            <Bot className="h-12 w-12 text-white" />
                        </div>
                        <h1 className="text-4xl font-semibold mb-2 text-white">Techwell GPT</h1>
                        <p className="text-lg mb-2">How can I help you today?</p>

                        {!isLoggedIn && (
                            <div className="mt-4 text-center">
                                <p className="text-sm text-white/40 mb-2">
                                    <Sparkles className="h-4 w-4 inline mr-1" />
                                    You have {GUEST_MESSAGE_LIMIT} free messages
                                </p>
                                <p className="text-xs text-white/30">
                                    Login for unlimited conversations
                                </p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-3xl w-full mt-8">
                            {[
                                "Explain React hooks with examples",
                                "Help me prepare for a JavaScript interview",
                                "What's the difference between SQL and NoSQL?",
                                "How do I improve my coding skills?"
                            ].map((prompt, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setInputText(prompt)}
                                    className="text-left p-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                                >
                                    <Sparkles className="h-4 w-4 mb-2 text-white/40" />
                                    <p className="text-sm text-white/80">{prompt}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="max-w-3xl mx-auto w-full">
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`py-6 px-4 ${msg.role === 'assistant' ? 'bg-[#444654]' : 'bg-[#343541]'}`}
                            >
                                <div className="max-w-3xl mx-auto flex gap-4">
                                    <div className="flex-shrink-0">
                                        {msg.role === 'user' ? (
                                            <div className="w-8 h-8 rounded-sm bg-purple-600 flex items-center justify-center">
                                                <User className="h-5 w-5 text-white" />
                                            </div>
                                        ) : (
                                            <div className="w-8 h-8 rounded-sm bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                                                <Bot className="h-5 w-5 text-white" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 text-white whitespace-pre-wrap leading-relaxed pt-1">
                                        {msg.content}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {isThinking && (
                            <div className="py-6 px-4 bg-[#444654]">
                                <div className="max-w-3xl mx-auto flex gap-4">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 rounded-sm bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                                            <Bot className="h-5 w-5 text-white" />
                                        </div>
                                    </div>
                                    <div className="flex-1 pt-1">
                                        <div className="flex gap-1">
                                            <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                            <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                            <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Limit Warning Banner */}
            {showLimitWarning && !isLoggedIn && (
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-3 border-t border-white/10">
                    <div className="max-w-3xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Sparkles className="h-5 w-5 text-white" />
                            <div>
                                <p className="text-white font-medium text-sm">
                                    {messagesRemaining > 0
                                        ? `Only ${messagesRemaining} message${messagesRemaining === 1 ? '' : 's'} left!`
                                        : 'Free message limit reached'}
                                </p>
                                <p className="text-white/80 text-xs">
                                    Login to continue unlimited conversations
                                </p>
                            </div>
                        </div>
                        <Button
                            onClick={handleLogin}
                            size="sm"
                            className="bg-white text-purple-600 hover:bg-white/90"
                        >
                            <LogIn className="h-4 w-4 mr-2" />
                            Login Now
                        </Button>
                    </div>
                </div>
            )}

            {/* Input Area */}
            <div className="bg-[#343541] border-t border-white/10 p-4">
                <div className="max-w-3xl mx-auto">
                    <div className="bg-[#40414f] rounded-lg shadow-lg border border-white/10">
                        <Textarea
                            ref={textareaRef}
                            placeholder={
                                !isLoggedIn && userMessageCount >= GUEST_MESSAGE_LIMIT
                                    ? "Please login to continue..."
                                    : "Message Techwell GPT..."
                            }
                            className="w-full bg-transparent border-none text-white placeholder:text-white/40 resize-none focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[52px] max-h-[200px] py-3 px-4"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={handleKeyPress}
                            rows={1}
                            disabled={!isLoggedIn && userMessageCount >= GUEST_MESSAGE_LIMIT}
                        />
                        <div className="flex items-center justify-between px-3 pb-2">
                            <div className="text-xs text-white/40">
                                {!isLoggedIn && userMessageCount >= GUEST_MESSAGE_LIMIT ? (
                                    <span className="text-yellow-400">Login required to continue</span>
                                ) : (
                                    <>Press Enter to send, Shift+Enter for new line</>
                                )}
                            </div>
                            <Button
                                size="sm"
                                className="bg-white/10 hover:bg-white/20 text-white border-0 h-8 w-8 p-0"
                                onClick={handleSendMessage}
                                disabled={isThinking || !inputText.trim() || (!isLoggedIn && userMessageCount >= GUEST_MESSAGE_LIMIT)}
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                    <p className="text-center text-xs text-white/40 mt-3">
                        Techwell GPT can make mistakes. Consider checking important information.
                    </p>
                </div>
            </div>
        </div>
    );
}
