"use client"

import * as React from 'react'
import Link from 'next/link'
import { Calendar, Clock, User, ArrowRight, Search, Tag, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import api from '@/lib/api'

export default function BlogPage() {
    interface BlogPost {
        id: string
        title: string
        slug: string
        summary?: string
        content: string
        coverImage?: string
        publishedAt?: string
        createdAt: string
        author?: { name: string }
        tags?: string[]
    }
    const [posts, setPosts] = React.useState<BlogPost[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [searchQuery, setSearchQuery] = React.useState('')
    const [debouncedSearch, setDebouncedSearch] = React.useState('')

    React.useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500)
        return () => clearTimeout(timer)
    }, [searchQuery])

    React.useEffect(() => {
        const fetchPosts = async () => {
            setIsLoading(true)
            try {
                const res = await api.get(`/blogs?status=PUBLISHED&search=${debouncedSearch}`)
                setPosts(res.data.blogs || [])
            } catch (error) {
                console.error(error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchPosts()
    }, [debouncedSearch])

    return (
        <div className="min-h-screen py-12">
            <div className="container">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-4">TechWell Blog</h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Insights, tutorials, and success stories to help you ace your tech career
                    </p>
                </div>

                {/* Search */}
                <div className="flex justify-center mb-12">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search articles..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="animate-spin h-8 w-8 text-primary" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {posts.length > 0 ? posts.map(post => (
                            <Card key={post.id} className="hover:shadow-lg transition-shadow group flex flex-col h-full">
                                {post.coverImage && (
                                    <div
                                        className="h-48 w-full bg-cover bg-center rounded-t-lg"
                                        style={{ backgroundImage: `url(${post.coverImage})` }}
                                    />
                                )}
                                {!post.coverImage && (
                                    <div className="h-48 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-t-lg" />
                                )}
                                <CardHeader>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                        <Tag className="h-3 w-3" />
                                        {post.tags?.[0] || 'Article'}
                                        <span className="mx-1">•</span>
                                        <Calendar className="h-3 w-3" />
                                        {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}
                                    </div>
                                    <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2">
                                        {post.title}
                                    </CardTitle>
                                    <CardDescription className="line-clamp-2">
                                        {post.summary || post.content.substring(0, 100)}...
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="mt-auto pt-0">
                                    <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t">
                                        <span className="flex items-center gap-1">
                                            <User className="h-3 w-3" />
                                            {post.author?.name || 'Admin'}
                                        </span>
                                        <Link href={`/blog/${post.slug || post.id}`}>
                                            <Button variant="ghost" size="sm">
                                                Read
                                                <ArrowRight className="h-4 w-4 ml-1" />
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        )) : (
                            <div className="col-span-full text-center py-12 text-muted-foreground">
                                No articles found.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
