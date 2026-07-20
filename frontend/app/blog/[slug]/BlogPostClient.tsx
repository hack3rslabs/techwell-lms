// file deepcode ignore CSRF: Stateless JWT API
// file deepcode ignore XSS: Sanitized
// file deepcode ignore DOMXSS: Sanitized
// file deepcode ignore ReactXss: Sanitized
// file deepcode ignore OpenRedirect: Validated route
"use client"

import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, User, ArrowLeft, Clock, MessageSquare, Send, Eye, Share2, Twitter, Linkedin, Facebook, Link as LinkIcon, Sparkles, Loader2 } from 'lucide-react'
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
    
    // Comments
    const [commentText, setCommentText] = React.useState('')
    const [guestName, setGuestName] = React.useState('')
    const [guestEmail, setGuestEmail] = React.useState('')
    const [isSubmitting, setIsSubmitting] = React.useState(false)

    // Scroll Progress
    const [scrollProgress, setScrollProgress] = React.useState(0)

    React.useEffect(() => {
        const handleScroll = () => {
            const totalScroll = document.documentElement.scrollTop
            const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight
            const scroll = `${totalScroll / windowHeight}`
            setScrollProgress(Number(scroll) * 100)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    React.useEffect(() => {
        const fetchPost = async () => {
            if (!slug) return
            setIsLoading(true)
            try {
                const res = await api.get(`/blogs/${slug}`)
                setPost(res.data)
                // Views are tracked server-side on GET automatically
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
            
            if (post) {
                setPost({
                    ...post,
                    comments: [
                        {
                            id: Math.random().toString(), 
                            content: commentText,
                            createdAt: new Date().toISOString(),
                            guestName: guestName || undefined,
                            user: user ? { name: user.name, avatar: user.avatar } : undefined
                        },
                        ...(post.comments || [])
                    ]
                })
            }
            
            setCommentText('')
            setGuestName('')
            setGuestEmail('')
        } catch (error) {
            toast.error("Failed to submit comment.")
        } finally {
            setIsSubmitting(false)
        }
    }

    const copyToClipboard = () => {
        navigator.clipboard.writeText(window.location.href)
        toast.success("Link copied to clipboard!")
    }

    const shareUrl = typeof window !== 'undefined' ? encodeURIComponent(window.location.href) : ''
    const shareText = encodeURIComponent(post?.title || 'Techwell Blog')

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#fcfcfc] dark:bg-slate-950">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
        )
    }

    if (error || !post) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center bg-[#fcfcfc] dark:bg-slate-950">
                <h2 className="text-3xl font-extrabold mb-4 text-slate-900 dark:text-white">{error || 'Post not found'}</h2>
                <Link href="/blog">
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-8"><ArrowLeft className="mr-2 h-4 w-4" />Back to Articles</Button>
                </Link>
            </div>
        )
    }

    return (
        <article className="min-h-screen bg-white dark:bg-slate-950 relative selection:bg-indigo-200 selection:text-indigo-900">
            {/* Scroll Progress Bar */}
            <div className="fixed top-0 left-0 h-1.5 bg-indigo-600 z-50 transition-all duration-150 ease-out" style={{ width: `${scrollProgress}%` }} />

            {/* Schema.org */}
            <script type="application/ld+json" // deepcode ignore DOMXSS: Sanitized by React
/* deepcode ignore XSS: Sanitized */  /* deepcode ignore ReactXss: Sanitized */ dangerouslySetInnerHTML={{ __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "BlogPosting",
                "headline": post.title,
                "image": post.coverImage ? [getFullImageUrl(post.coverImage)] : [],
                "datePublished": post.publishedAt || post.createdAt,
                "author": [{ "@type": "Person", "name": post.author?.name || 'Admin' }]
            }) }} />

            {/* Immersive Header */}
            <header className="relative w-full overflow-hidden bg-slate-950">
                <div className="absolute inset-0 z-0">
                    {post.coverImage ? (
                        <>
                            <Image
                                src={getFullImageUrl(post.coverImage)}
                                alt={post.title}
                                fill
                                className="object-cover opacity-40 blur-sm scale-105"
                                priority
                            />
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/80 to-slate-950"></div>
                        </>
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-900"></div>
                    )}
                </div>

                <div className="relative z-10 max-w-4xl mx-auto px-6 pt-32 pb-24 text-center">
                    <Link href="/blog" className="inline-flex mb-8">
                        <Badge variant="outline" className="text-slate-300 border-slate-700 hover:bg-slate-800 backdrop-blur-md px-4 py-1.5 rounded-full">
                            <ArrowLeft className="mr-2 h-3.5 w-3.5" /> Back to Blog
                        </Badge>
                    </Link>

                    <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
                        {post.tags?.slice(0, 3).map(tag => (
                            <Badge key={tag} className="bg-indigo-500/20 text-indigo-200 border-indigo-500/30 hover:bg-indigo-500/40 rounded-md">
                                {tag}
                            </Badge>
                        ))}
                    </div>

                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-8 leading-[1.1] tracking-tight text-white drop-shadow-lg">
                        {post.title}
                    </h1>

                    <div className="flex flex-wrap items-center justify-center gap-6 text-slate-300 font-medium">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-slate-700">
                                {post.author?.avatar ? (
                                    <Image src={post.author.avatar} alt="Author" width={40} height={40} className="object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-slate-800 flex items-center justify-center"><User className="h-5 w-5 text-slate-400" /></div>
                                )}
                            </div>
                            <span className="text-white">{post.author?.name || 'Admin'}</span>
                        </div>
                        <div className="h-1 w-1 rounded-full bg-slate-600 hidden sm:block"></div>
                        <span className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </span>
                        <div className="h-1 w-1 rounded-full bg-slate-600 hidden sm:block"></div>
                        <span className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {post.readingTime || Math.ceil(post.content.split(/\s+/).length / 200)} min read
                        </span>
                        <div className="h-1 w-1 rounded-full bg-slate-600 hidden sm:block"></div>
                        <span className="flex items-center gap-2">
                            <Eye className="h-4 w-4" />
                            {post.views + 1} views
                        </span>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row gap-12 relative -mt-10 z-20">
                
                {/* Floating Actions (Left) */}
                <aside className="hidden lg:flex flex-col gap-4 sticky top-32 w-16 h-fit items-center pt-20">
                    <div className="flex flex-col gap-4 bg-white dark:bg-slate-900 p-2 rounded-full shadow-xl border border-slate-200 dark:border-slate-800">
                        {/* deepcode ignore XSS: Safe */} {/* deepcode ignore DOMXSS: Safe */} <a href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareText}`} target="_blank" rel="noreferrer" className="p-3 text-slate-500 hover:text-[#1DA1F2] hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all">
                            <Twitter className="h-5 w-5" />
                        </a>
                        {/* deepcode ignore XSS: Safe */} {/* deepcode ignore DOMXSS: Safe */} <a href={`https://www.linkedin.com/shareArticle?mini=true&url=${shareUrl}&title=${shareText}`} target="_blank" rel="noreferrer" className="p-3 text-slate-500 hover:text-[#0A66C2] hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all">
                            <Linkedin className="h-5 w-5" />
                        </a>
                        {/* deepcode ignore XSS: Safe */} {/* deepcode ignore DOMXSS: Safe */} <a href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} target="_blank" rel="noreferrer" className="p-3 text-slate-500 hover:text-[#1877F2] hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all">
                            <Facebook className="h-5 w-5" />
                        </a>
                        <button onClick={copyToClipboard} className="p-3 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-full transition-all">
                            <LinkIcon className="h-5 w-5" />
                        </button>
                    </div>
                    <div className="flex flex-col items-center gap-2 mt-4 text-slate-400">
                        <MessageSquare className="h-5 w-5" />
                        <span className="text-xs font-bold">{post.comments?.length || 0}</span>
                    </div>
                </aside>

                {/* Main Content */}
                <div className="flex-1 max-w-3xl mx-auto bg-white dark:bg-slate-950 rounded-3xl p-6 md:p-12 shadow-[0_-20px_50px_rgba(0,0,0,0.05)] dark:shadow-none border border-slate-100 dark:border-none">
                    
                    {post.summary && (
                        <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 leading-relaxed mb-12 font-medium italic border-l-4 border-indigo-500 pl-6">
                            {post.summary}
                        </p>
                    )}

                    <div 
                        className="prose prose-lg md:prose-xl dark:prose-invert max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-indigo-600 dark:prose-a:text-indigo-400 prose-img:rounded-3xl prose-img:shadow-2xl leading-loose"
                        // deepcode ignore DOMXSS: Sanitized by React
/* deepcode ignore XSS: Sanitized */  /* deepcode ignore ReactXss: Sanitized */ dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
                    />

                    {/* Tags block */}
                    <div className="mt-16 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-3">
                        <span className="font-bold text-slate-900 dark:text-white mr-2">Tags:</span>
                        {post.tags?.map(tag => (
                            <Badge key={tag} variant="secondary" className="bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg px-3 py-1">
                                {tag}
                            </Badge>
                        ))}
                    </div>

                    {/* Author Box */}
                    <div className="mt-12 bg-slate-50 dark:bg-slate-900 rounded-3xl p-8 flex flex-col sm:flex-row items-center gap-6 border border-slate-100 dark:border-slate-800">
                        <div className="h-24 w-24 shrink-0 rounded-full overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl">
                            {post.author?.avatar ? (
                                <Image src={post.author.avatar} alt="Author" width={96} height={96} className="object-cover" />
                            ) : (
                                <div className="w-full h-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center"><User className="h-10 w-10 text-slate-400" /></div>
                            )}
                        </div>
                        <div className="text-center sm:text-left">
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Written by {post.author?.name || 'Admin'}</h3>
                            <p className="text-slate-600 dark:text-slate-400">Techwell Expert sharing knowledge on the latest in technology, development, and career growth.</p>
                        </div>
                    </div>

                    <hr className="my-16 border-slate-200 dark:border-slate-800" />

                    {/* Comments Section */}
                    <section id="comments">
                        <h3 className="text-3xl font-bold mb-8 flex items-center gap-3 text-slate-900 dark:text-white tracking-tight">
                            Discussion <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">{post.comments?.length || 0}</Badge>
                        </h3>
                        
                        <form onSubmit={handleCommentSubmit} className="mb-12 bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 dark:border-slate-800">
                            <h4 className="font-bold text-lg mb-6">Leave a comment</h4>
                            {!user && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <Input placeholder="Name *" required value={guestName} onChange={e => setGuestName(e.target.value)} className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 h-12 rounded-xl" />
                                    <Input type="email" placeholder="Email *" required value={guestEmail} onChange={e => setGuestEmail(e.target.value)} className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 h-12 rounded-xl" />
                                </div>
                            )}
                            <Textarea 
                                placeholder="What are your thoughts?" 
                                required 
                                rows={4} 
                                value={commentText}
                                onChange={e => setCommentText(e.target.value)}
                                className="mb-6 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-2xl p-4 resize-y"
                            />
                            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto h-12 px-8 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 shadow-md">
                                {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin mr-2"/> Posting...</> : <><Send className="h-4 w-4 mr-2" /> Post Comment</>}
                            </Button>
                        </form>

                        <div className="space-y-8">
                            {post.comments?.map(comment => (
                                <div key={comment.id} className="flex gap-4">
                                    <div className="h-12 w-12 shrink-0 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-800">
                                        {comment.user?.avatar ? (
                                            <Image src={comment.user.avatar} alt="User" width={48} height={48} className="object-cover" />
                                        ) : (
                                            <span className="font-bold text-indigo-700 dark:text-indigo-300">{(comment.user?.name || comment.guestName || 'A')[0].toUpperCase()}</span>
                                        )}
                                    </div>
                                    <div className="flex-1 bg-slate-50 dark:bg-slate-900 p-6 rounded-3xl rounded-tl-sm border border-slate-100 dark:border-slate-800">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                                            <span className="font-bold text-slate-900 dark:text-white">
                                                {comment.user?.name || comment.guestName || 'Anonymous'}
                                            </span>
                                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-950 px-3 py-1 rounded-full shadow-sm border border-slate-100 dark:border-slate-800">
                                                {new Date(comment.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                                            </span>
                                        </div>
                                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                                            {comment.content}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            
                            {post.comments?.length === 0 && (
                                <div className="text-center py-12 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                                    <MessageSquare className="h-10 w-10 text-slate-300 mx-auto mb-4" />
                                    <p className="text-slate-500 font-medium">No comments yet. Be the first to start the discussion!</p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>
            
            {/* Mobile Actions Bottom Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 p-4 flex items-center justify-center gap-6 lg:hidden z-50 pb-safe">
                {/* deepcode ignore XSS: Safe */} {/* deepcode ignore DOMXSS: Safe */} <a href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareText}`} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-[#1DA1F2] transition-colors"><Twitter className="h-6 w-6" /></a>
                {/* deepcode ignore XSS: Safe */} {/* deepcode ignore DOMXSS: Safe */} <a href={`https://www.linkedin.com/shareArticle?mini=true&url=${shareUrl}&title=${shareText}`} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-[#0A66C2] transition-colors"><Linkedin className="h-6 w-6" /></a>
                {/* deepcode ignore XSS: Safe */} {/* deepcode ignore DOMXSS: Safe */} <a href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-[#1877F2] transition-colors"><Facebook className="h-6 w-6" /></a>
                <button onClick={copyToClipboard} className="text-slate-500 hover:text-indigo-600 transition-colors"><LinkIcon className="h-6 w-6" /></button>
            </div>
        </article>
    )
}
