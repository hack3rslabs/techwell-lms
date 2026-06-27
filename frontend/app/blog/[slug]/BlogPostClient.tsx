"use client"

import * as React from 'react'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Calendar, User, ArrowLeft, Tag, Loader2, Clock, Heart, Share2, Star, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import api from '@/lib/api'
import DOMPurify from 'isomorphic-dompurify'
import { getFullImageUrl } from '@/lib/image-utils'
import { toast } from 'sonner'

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
    likesCount?: number
    sharesCount?: number
    ratingAvg?: number
    ratingCount?: number
}

export default function BlogPostClient() {
    const params = useParams()
    const _router = useRouter()
    const slug = params.slug as string

    const [post, setPost] = React.useState<BlogPost | null>(null)
    const [isLoading, setIsLoading] = React.useState(true)
    const [error, setError] = React.useState<string | null>(null)

    // Interactive states
    const [likesCount, setLikesCount] = React.useState(0)
    const [sharesCount, setSharesCount] = React.useState(0)
    const [ratingAvg, setRatingAvg] = React.useState(0)
    const [ratingCount, setRatingCount] = React.useState(0)
    const [comments, setComments] = React.useState<any[]>([])
    const [newComment, setNewComment] = React.useState("")
    const [submittingComment, setSubmittingComment] = React.useState(false)

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

    React.useEffect(() => {
        if (post) {
            setLikesCount(post.likesCount || 0)
            setSharesCount(post.sharesCount || 0)
            setRatingAvg(post.ratingAvg || 0)
            setRatingCount(post.ratingCount || 0)

            const fetchComments = async () => {
                try {
                    const res = await api.get(`/blogs/${post.id}/comments`)
                    setComments(res.data)
                } catch (err) {
                    console.error("Error loading comments:", err)
                }
            }
            fetchComments()
        }
    }, [post])

    const handleLike = async () => {
        try {
            const res = await api.post(`/blogs/${post?.id}/like`)
            setLikesCount(res.data.likesCount)
            toast.success("Article liked!")
        } catch {
            toast.error("Failed to like article")
        }
    }

    const handleShare = async () => {
        try {
            await api.post(`/blogs/${post?.id}/share`)
            setSharesCount(prev => prev + 1)
            if (typeof window !== "undefined") {
                await navigator.clipboard.writeText(window.location.href)
                toast.success("Link copied! Share it with your friends.")
            }
        } catch {
            toast.error("Failed to share article")
        }
    }

    const handleRate = async (rating: number) => {
        try {
            const res = await api.post(`/blogs/${post?.id}/rate`, { rating })
            setRatingAvg(res.data.ratingAvg)
            setRatingCount(res.data.ratingCount)
            toast.success(`You rated this article ${rating} stars!`)
        } catch {
            toast.error("Failed to submit rating")
        }
    }

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newComment.trim()) return
        setSubmittingComment(true)
        try {
            const res = await api.post(`/blogs/${post?.id}/comments`, { content: newComment })
            setComments(prev => [res.data, ...prev])
            setNewComment("")
            toast.success("Comment posted successfully!")
        } catch {
            toast.error("Please login to post a comment.")
        } finally {
            setSubmittingComment(false)
        }
    }

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

    const wordsPerMinute = 200
    const textLength = post.content.split(/\s+/).length
    const readingTime = Math.ceil(textLength / wordsPerMinute)

    const isHtml = /<[a-z][\s\S]*>/i.test(post.content)
    const sanitizedContent = isHtml 
        ? DOMPurify.sanitize(post.content)
        : DOMPurify.sanitize(post.content)
            .split(/\n+/)
            .map(paragraph => paragraph.trim())
            .filter(Boolean)
            .map(paragraph => `<p>${paragraph}</p>`)
            .join('')

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
                            src={getFullImageUrl(post.coverImage)}
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
                            <Badge key={tag} variant="secondary">{tag}</Badge>
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

                {/* Interaction Section (Likes, Shares, Rating) */}
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="sm" onClick={handleLike} className="flex items-center gap-2 hover:text-red-500 transition-colors">
                            <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                            <span>Like ({likesCount})</span>
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleShare} className="flex items-center gap-2 hover:text-blue-500 transition-colors">
                            <Share2 className="w-4 h-4 text-blue-500" />
                            <span>Share ({sharesCount})</span>
                        </Button>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-500">Rate Article:</span>
                        <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button 
                                    key={star} 
                                    onClick={() => handleRate(star)} 
                                    className="hover:scale-110 transition-transform"
                                >
                                    <Star className={`w-5 h-5 ${star <= Math.round(ratingAvg) ? 'text-amber-500 fill-amber-500' : 'text-slate-300'}`} />
                                </button>
                            ))}
                        </div>
                        <span className="text-xs text-slate-500 font-bold ml-1">
                            {ratingAvg.toFixed(1)} ({ratingCount} ratings)
                        </span>
                    </div>
                </div>

                {/* Comments Section */}
                <section className="space-y-6 mb-12 border-t pt-8">
                    <div className="flex items-center gap-2 text-slate-900 font-black text-lg">
                        <MessageSquare className="w-5 h-5 text-indigo-600" />
                        <span>Discussion ({comments.length})</span>
                    </div>

                    <form onSubmit={handleCommentSubmit} className="space-y-3">
                        <Textarea
                            placeholder="Add your thoughts or questions about this article..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            required
                            className="bg-white min-h-[100px]"
                        />
                        <div className="flex justify-end">
                            <Button type="submit" disabled={submittingComment}>
                                {submittingComment && <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />}
                                Post Comment
                            </Button>
                        </div>
                    </form>

                    <div className="space-y-4 pt-4">
                        {comments.length > 0 ? comments.map((comment) => (
                            <div key={comment.id} className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl flex items-start gap-3">
                                <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold overflow-hidden">
                                    {comment.user?.avatar ? (
                                        <Image src={comment.user.avatar} alt={comment.user.name} width={32} height={32} className="h-full w-full object-cover" />
                                    ) : (
                                        <User className="h-4 w-4 text-slate-500" />
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-xs font-bold text-slate-950">{comment.user?.name || "User"}</span>
                                        <span className="text-[10px] text-slate-400">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-xs text-slate-700 leading-normal">{comment.content}</p>
                                </div>
                            </div>
                        )) : (
                            <p className="text-sm text-slate-400 text-center py-6">No comments yet. Start the conversation!</p>
                        )}
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t pt-8">
                    <div className="flex justify-between items-center">
                        <div className="flex gap-2" />
                        <Link href="/blog">
                            <Button variant="outline">View all articles</Button>
                        </Link>
                    </div>
                </footer>
            </div>
        </article>
    )
}
