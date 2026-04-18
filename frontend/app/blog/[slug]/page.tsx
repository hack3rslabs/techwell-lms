"use client"

import * as React from 'react'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Calendar, User, ArrowLeft, Tag, Loader2, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import api from '@/lib/api'
import DOMPurify from 'isomorphic-dompurify'

interface BlogPost {
    id: string
    title: string
    slug: string
    summary?: string
    content: string
    coverImage?: string
    publishedAt?: string
    createdAt: string
    author?: { name: string, avatar?: string }
    tags?: string[]
}

export default function BlogPostPage() {
    const params = useParams()
    const _router = useRouter()
    const slug = params.slug as string
    
    const [post, setPost] = React.useState<BlogPost | null>(null)
    const [isLoading, setIsLoading] = React.useState(true)
    const [error, setError] = React.useState<string | null>(null)

    React.useEffect(() => {
        const fetchPost = async () => {
            if (!slug) return
            setIsLoading(true)
            try {
                const res = await api.get(`/blogs/${slug}`)
                setPost(res.data)
            } catch (err: any) {
                console.error(err)
                setError(err.response?.data?.error || 'Failed to load blog post')
            } finally {
                setIsLoading(false)
            }
        }
        fetchPost()
    }, [slug])

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin h-12 w-12 text-primary" />
            </div>
        )
    }

    if (error || !post) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
                <h2 className="text-2xl font-bold mb-4">{error || 'Post not found'}</h2>
                <Link href="/blog">
                    <Button>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Blog
                    </Button>
                </Link>
            </div>
        )
    }

    // Estimate reading time
    const wordsPerMinute = 200
    const textLength = post.content.split(/\s+/).length
    const readingTime = Math.ceil(textLength / wordsPerMinute)

    const sanitizedContent = DOMPurify.sanitize(post.content)

    return (
        <article className="min-h-screen py-12">
            <div className="container max-w-4xl">
                {/* Back Button */}
                <div className="mb-8">
                    <Link href="/blog">
                        <Button variant="ghost" size="sm" className="pl-0 hover:bg-transparent hover:text-primary">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Blog
                        </Button>
                    </Link>
                </div>

                {/* Cover Image */}
                {post.coverImage && (
                    <div className="relative aspect-video w-full mb-8 overflow-hidden rounded-xl border">
                        <Image
                            src={post.coverImage}
                            alt={post.title}
                            width={800}
                            height={450}
                            className="object-cover w-full h-full"
                        />
                    </div>
                )}

                {/* Blog Header */}
                <header className="mb-12">
                    <div className="flex flex-wrap items-center gap-4 mb-4">
                        {post.tags?.map(tag => (
                            <Badge key={tag} variant="secondary">
                                {tag}
                            </Badge>
                        )) || <Badge variant="secondary">Article</Badge>}
                        
                        <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="mr-1 h-4 w-4" />
                            {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}
                        </div>
                        
                        <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="mr-1 h-4 w-4" />
                            {readingTime} min read
                        </div>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                        {post.title}
                    </h1>

                    <div className="flex items-center gap-4 pt-4 border-t">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border">
                            {post.author?.avatar ? (
                                <Image src={post.author.avatar} alt={post.author.name} width={40} height={40} className="h-full w-full object-cover" />
                            ) : (
                                <User className="h-5 w-5 text-primary" />
                            )}
                        </div>
                        <div>
                            <p className="font-medium">{post.author?.name || 'Admin'}</p>
                            <p className="text-xs text-muted-foreground">Author</p>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div 
                    className="prose prose-lg dark:prose-invert max-w-none mb-12"
                    dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                />

                {/* Footer */}
                <footer className="border-t pt-8">
                    <div className="flex justify-between items-center">
                        <div className="flex gap-2">
                           {/* Social share placeholder if needed */}
                        </div>
                        <Link href="/blog">
                            <Button variant="outline">
                                View all articles
                            </Button>
                        </Link>
                    </div>
                </footer>
            </div>
        </article>
    )
}
