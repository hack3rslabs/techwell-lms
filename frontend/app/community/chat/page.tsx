"use client"

import * as React from "react"
import { useSocket } from "@/lib/socket"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, Loader2, Wifi, WifiOff } from "lucide-react"

interface Message {
    id: string
    content: string
    senderId: string
    senderName: string
    timestamp: Date
}

export default function ChatPage() {
    const { socket, isConnected } = useSocket()
    const { user } = useAuth()

    const [messages, setMessages] = React.useState<Message[]>([])
    const [input, setInput] = React.useState("")
    const [room, setRoom] = React.useState("general") // Default room

    const scrollRef = React.useRef<HTMLDivElement>(null)

    React.useEffect(() => {
        if (socket && isConnected) {
            socket.emit("join_room", room)

            socket.on("receive_message", (message: Message) => {
                setMessages((prev) => [...prev, message])
            })

            return () => {
                socket.off("receive_message")
            }
        } else {
            socket.connect()
        }
    }, [socket, isConnected, room])

    React.useEffect(() => {
        // Auto-scroll to bottom
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim() || !user) return

        const messageData: Message = {
            id: Date.now().toString(),
            content: input,
            senderId: user.id,
            senderName: user.name,
            timestamp: new Date(),
        }

        await socket.emit("send_message", {
            room,
            ...messageData
        })

        setMessages((prev) => [...prev, messageData])
        setInput("")
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[calc(100vh-12rem)] min-h-[500px]">
            {/* Sidebar: Chat Rooms/Users */}
            <div className="md:col-span-1 bg-card border rounded-lg p-4 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Channels</h3>
                    {isConnected ? (
                        <Wifi className="h-4 w-4 text-green-500" />
                    ) : (
                        <WifiOff className="h-4 w-4 text-red-500" />
                    )}
                </div>
                <ScrollArea className="flex-1">
                    <div className="space-y-1">
                        {['general', 'react-help', 'random', 'introductions'].map((r) => (
                            <Button
                                key={r}
                                variant={room === r ? "secondary" : "ghost"}
                                className="w-full justify-start text-sm"
                                onClick={() => setRoom(r)}
                            >
                                # {r}
                            </Button>
                        ))}
                    </div>
                </ScrollArea>
            </div>

            {/* Main Chat Area */}
            <div className="md:col-span-3 bg-card border rounded-lg flex flex-col overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b flex items-center justify-between bg-muted/30">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-lg"># {room}</span>
                        <span className="text-xs text-muted-foreground">{messages.length} messages</span>
                    </div>

                    {!isConnected && <span className="text-xs text-red-500 flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Connecting...</span>}
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                    <div className="space-y-4">
                        {messages.length === 0 && (
                            <div className="text-center text-muted-foreground py-10">
                                No messages yet. Be the first to say help!
                            </div>
                        )}
                        {messages.map((msg) => {
                            const isMe = msg.senderId === user?.id
                            return (
                                <div
                                    key={msg.id}
                                    className={cn(
                                        "flex gap-3 max-w-[80%]",
                                        isMe ? "ml-auto flex-row-reverse" : ""
                                    )}
                                >
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback>{msg.senderName[0]}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className={cn(
                                            "flex items-baseline gap-2 mb-1",
                                            isMe ? "flex-row-reverse" : ""
                                        )}>
                                            <span className="text-xs font-medium text-muted-foreground">{msg.senderName}</span>
                                            <span className="text-[10px] text-muted-foreground/60">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <div className={cn(
                                            "p-3 rounded-lg text-sm",
                                            isMe ? "bg-primary text-primary-foreground" : "bg-muted"
                                        )}>
                                            {msg.content}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </ScrollArea>

                {/* Input */}
                <div className="p-4 border-t bg-background">
                    <form onSubmit={sendMessage} className="flex gap-2">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={`Message #${room}...`}
                            className="flex-1"
                            disabled={!isConnected}
                        />
                        <Button type="submit" size="icon" disabled={!input.trim() || !isConnected}>
                            <Send className="h-4 w-4" />
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    )
}
