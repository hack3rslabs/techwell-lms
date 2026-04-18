"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Search,
    Plus,
    Users,
    Clock,
    ThumbsUp,
    MessageCircle
} from "lucide-react"

// Mock Data for Forum
const categories = [
    { id: '1', name: 'General Discussion', count: 120, description: 'Talk about anything related to tech.' },
    { id: '2', name: 'Course Help', count: 85, description: 'Get help with course material.' },
    { id: '3', name: 'Career Advice', count: 56, description: 'Resume reviews and interview tips.' },
    { id: '4', name: 'Showcase', count: 32, description: 'Show off your projects.' },
]

const discussions = [
    {
        id: '1',
        title: 'How to handle state in Next.js 14?',
        category: 'Course Help',
        author: 'Sarah Smith',
        replies: 12,
        likes: 45,
        time: '2 hours ago',
        isSolved: true,
    },
    {
        id: '2',
        title: 'Best resources for System Design?',
        category: 'Career Advice',
        author: 'Mike Johnson',
        replies: 8,
        likes: 23,
        time: '5 hours ago',
        isSolved: false,
    },
    {
        id: '3',
        title: 'My portoflio built with the new curriculum',
        category: 'Showcase',
        author: 'Emily Chen',
        replies: 24,
        likes: 89,
        time: '1 day ago',
        isSolved: false,
    }
]

export default function ForumPage() {
    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Forum</h1>
                    <p className="text-muted-foreground">Join the conversation and learn together.</p>
                </div>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    New Discussion
                </Button>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search discussions..." className="pl-10" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {categories.map((cat) => (
                    <Card key={cat.id} className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardHeader className="p-4">
                            <CardTitle className="text-base flex items-center justify-between">
                                {cat.name}
                                <span className="text-xs font-normal text-muted-foreground bg-secondary px-2 py-1 rounded-full">
                                    {cat.count}
                                </span>
                            </CardTitle>
                            <CardDescription className="text-xs line-clamp-1">
                                {cat.description}
                            </CardDescription>
                        </CardHeader>
                    </Card>
                ))}
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Recent Discussions</h3>
                {discussions.map((item) => (
                    <Card key={item.id} className="hover:border-primary/50 transition-colors cursor-pointer">
                        <CardContent className="p-4 flex items-start gap-4">
                            <div className="flex flex-col items-center gap-1 min-w-[3rem] text-muted-foreground">
                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-green-600">
                                    <ThumbsUp className="h-4 w-4" />
                                </Button>
                                <span className="text-sm font-medium">{item.likes}</span>
                            </div>

                            <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-2">
                                    <h4 className="font-semibold text-lg line-clamp-1 hover:text-primary hover:underline">
                                        {item.title}
                                    </h4>
                                    {item.isSolved && (
                                        <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium border border-green-200">
                                            SOLVED
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                    <span className="bg-muted px-2 py-0.5 rounded text-xs">{item.category}</span>
                                    <span className="flex items-center gap-1">
                                        <Users className="h-3 w-3" /> {item.author}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" /> {item.time}
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-1">
                                <div className="flex items-center gap-1 text-muted-foreground">
                                    <MessageCircle className="h-4 w-4" />
                                    <span className="text-sm">{item.replies}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
