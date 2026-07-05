"use client"

import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, User, ArrowLeft, Clock, MessageSquare, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import api from '@/lib/api'
import DOMPurify from 'isomorphic-dompurify'
import { getFullImageUrl } from '@/lib/image-utils'
import { toast } from 'sonner'
import { useAuth } from '@/lib/auth-context'

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
    views: number
    readingTime: number
    ctaSettings?: any
    comments?: Array<{
        id: string
        content: string
        createdAt: string
        user?: { name: string, avatar?: string }
        guestName?: string
    }>
}

export default function BlogPostClient({ slug }: { slug: string }) {
    const { user } = useAuth()
    const [post, setPost] = React.useState<BlogPost | null>(null)
    const [isLoading, setIsLoading] = React.useState(true)
    const [error, setError] = React.useState<string | null>(null)
    const [commentText, setCommentText] = React.useState('')
    const [guestName, setGuestName] = React.useState('')
    const [guestEmail, setGuestEmail] = React.useState('')
    const [isSubmitting, setIsSubmitting] = React.useState(false)

    React.useEffect(() => {
        const fetchPost = async () => {
            if (!slug) return
            setIsLoading(true)
            try {
                const res = await api.get(`/blogs/${slug}`)
                setPost(res.data)
                // Track view
                if (res.data?.id) {
                    api.post(`/blogs/${res.data.id}/view`).catch(console.error)
                }
            } catch (err: any) {
                console.error(err)
                setError(err.response?.data?.error || 'Failed to load blog post')
            } finally {
                setIsLoading(false)
            }
        }
        fetchPost()
    }, [slug])

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!commentText.trim()) return
        if (!user && (!guestName || !guestEmail)) {
            toast.error("Please enter your name and email to comment.")
            return
        }

        setIsSubmitting(true)
        try {
            await api.post(`/blogs/${post?.id}/comments`, {
                content: commentText,
                guestName,
                guestEmail
            })
            toast.success("Comment submitted for moderation!")
            setCommentText('')
        } catch (error) {
            toast.error("Failed to submit comment.")
        } finally {
            setIsSubmitting(false)
        }
    }

    const trackCtaClick = () => {
        if (post?.id) {
            api.post(`/blogs/${post.id}/click-cta`).catch(console.error)
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (error || !post) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
                <h2 className="text-2xl font-bold mb-4">{error || 'Post not found'}</h2>
                <Link href="/blog">
                    <Button><ArrowLeft className="mr-2 h-4 w-4" />Back to Blog</Button>
                </Link>
            </div>
        )
    }

    return (
        <article className="min-h-screen py-12 bg-white dark:bg-slate-950">
            {/* Schema.org Article JSON-LD */}
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "BlogPosting",
                "headline": post.title,
                "image": post.coverImage ? [getFullImageUrl(post.coverImage)] : [],
                "datePublished": post.publishedAt || post.createdAt,
                "author": [{ "@type": "Person", "name": post.author?.name || 'Admin' }]
            }) }} />

            <div className="container max-w-4xl px-4 md:px-6">
                <div className="mb-8">
                    <Link href="/blog">
                        <Button variant="ghost" size="sm" className="pl-0 hover:bg-transparent text-muted-foreground hover:text-primary transition-colors">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Blog
                        </Button>
                    </Link>
                </div>

                {post.coverImage && (
                    <div className="relative aspect-video w-full mb-8 overflow-hidden rounded-2xl shadow-lg border">
                        <Image
                            src={getFullImageUrl(post.coverImage)}
                            alt={post.title}
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>
                )}

                <header className="mb-10 text-center md:text-left">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-6">
                        {post.tags?.map(tag => (
                            <Badge key={tag} variant="secondary" className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                {tag}
                            </Badge>
                        ))}
                        
                        <div className="flex items-center text-sm text-muted-foreground font-medium">
                            <Calendar className="mr-1.5 h-4 w-4" />
                            {new Date(post.publishedAt || post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        
                        <div className="flex items-center text-sm text-muted-foreground font-medium">
                            <Clock className="mr-1.5 h-4 w-4" />
                            {post.readingTime || Math.ceil(post.content.split(/\s+/).length / 200)} min read
                        </div>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight tracking-tight text-slate-900 dark:text-white">
                        {post.title}
                    </h1>

                    <div className="flex items-center justify-center md:justify-start gap-4 pt-6 border-t dark:border-slate-800">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border">
                            {post.author?.avatar ? (
                                <Image src={post.author.avatar} alt={post.author.name} width={48} height={48} className="h-full w-full object-cover" />
                            ) : (
                                <User className="h-6 w-6 text-primary" />
                            )}
                        </div>
                        <div className="text-left">
                            <p className="font-semibold text-slate-900 dark:text-slate-100">{post.author?.name || 'Admin'}</p>
                            <p className="text-sm text-muted-foreground">Techwell Expert</p>
                        </div>
                    </div>
                </header>

                <div 
                    className="prose prose-lg dark:prose-invert max-w-none mb-12 prose-headings:font-bold prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-img:rounded-xl"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
                />

                {/* CTA Block Injection */}
                {post.ctaSettings && post.ctaSettings.url && (
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl p-8 mb-12 text-center shadow-xl">
                        <h3 className="text-2xl font-bold mb-3">{post.ctaSettings.headline || "Ready to take the next step?"}</h3>
                        <p className="mb-6 opacity-90">{post.ctaSettings.subheadline || "Join our community and boost your career."}</p>
                        <Link href={post.ctaSettings.url} onClick={trackCtaClick} target="_blank">
                            <Button size="lg" className="bg-white text-blue-600 hover:bg-slate-100 font-bold px-8">
                                {post.ctaSettings.buttonText || "Learn More"}
                            </Button>
                        </Link>
                    </div>
                )}

                <hr className="my-10 border-slate-200 dark:border-slate-800" />

                {/* Comments Section */}
                <section className="mb-12">
                    <h3 className="text-2xl font-bold mb-6 flex items-center gap-2 text-slate-900 dark:text-white">
                        <MessageSquare className="h-6 w-6 text-primary" /> 
                        Comments ({post.comments?.length || 0})
                    </h3>
                    
                    <form onSubmit={handleCommentSubmit} className="mb-10 bg-slate-50 dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
                        <h4 className="font-semibold mb-4">Leave a Reply</h4>
                        {!user && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <Input placeholder="Name *" required value={guestName} onChange={e => setGuestName(e.target.value)} />
                                <Input type="email" placeholder="Email *" required value={guestEmail} onChange={e => setGuestEmail(e.target.value)} />
                            </div>
                        )}
                        <Textarea 
                            placeholder="Write your comment..." 
                            required 
                            rows={4} 
                            value={commentText}
                            onChange={e => setCommentText(e.target.value)}
                            className="mb-4 bg-white dark:bg-slate-950"
                        />
                        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                            {isSubmitting ? 'Submitting...' : <><Send className="h-4 w-4 mr-2" /> Post Comment</>}
                        </Button>
                    </form>

                    <div className="space-y-6">
                        {post.comments?.map(comment => (
                            <div key={comment.id} className="flex gap-4">
                                <div className="h-10 w-10 shrink-0 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                                    {comment.user?.avatar ? (
                                        <Image src={comment.user.avatar} alt="User" width={40} height={40} className="object-cover" />
                                    ) : (
                                        <User className="h-5 w-5 text-slate-500" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                                            {comment.user?.name || comment.guestName || 'Anonymous'}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(comment.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                                        {comment.content}
                                    </p>
                                </div>
                            </div>
                        ))}
                        
                        {post.comments?.length === 0 && (
                            <p className="text-center text-muted-foreground py-4">No comments yet. Be the first to share your thoughts!</p>
                        )}
                    </div>
                </section>
            </div>
        </article>
    )
}
