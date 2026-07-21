"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Users, Clock, ThumbsUp, MessageCircle, Loader2 } from "lucide-react"
import api from "@/lib/api"
import { toast } from "react-hot-toast"
import { useAuth } from "@/lib/auth-context"

export default function ForumPostPage() {
    const params = useParams()
    const router = useRouter()
    const { user } = useAuth()
    const [post, setPost] = React.useState<any>(null)
    const [isLoading, setIsLoading] = React.useState(true)
    const [isLiking, setIsLiking] = React.useState(false)
    const [newComment, setNewComment] = React.useState("")
    const [isSubmitting, setIsSubmitting] = React.useState(false)

    const fetchPost = async () => {
        try {
            const res = await api.get(`/forum/posts/${params.slug}`)
            setPost(res.data)
        } catch (error: any) {
            console.error(error)
            toast.error(error.response?.data?.message || "Post not found")
            router.push('/community/forum')
        } finally {
            setIsLoading(false)
        }
    }

    React.useEffect(() => {
        fetchPost()
    }, [params.slug])

    const handleLike = async () => {
        if (!user) {
            toast.error("Please login to like this post")
            return
        }
        setIsLiking(true)
        try {
            const res = await api.post(`/forum/posts/${post.id}/like`)
            setPost({ ...post, likes: res.data.likes })
        } catch (error) {
            toast.error("Failed to like post")
        } finally {
            setIsLiking(false)
        }
    }

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) {
            toast.error("Please login to comment")
            return
        }
        if (!newComment.trim()) return

        setIsSubmitting(true)
        try {
            const res = await api.post(`/forum/posts/${post.id}/comments`, {
                content: newComment
            })
            toast.success("Comment added!")
            setNewComment("")
            setPost({
                ...post,
                comments: [...(post.comments || []), res.data]
            })
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to add comment")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (!post) return null

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
            <Button variant="ghost" onClick={() => router.back()} className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Forum
            </Button>

            {/* Main Post */}
            <Card className="border-t-4 border-t-primary shadow-sm">
                <CardHeader className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                            <span className="bg-primary/10 text-primary text-xs font-semibold px-2.5 py-0.5 rounded">
                                {post.category?.name}
                            </span>
                            <CardTitle className="text-2xl md:text-3xl font-bold mt-2">
                                {post.title}
                            </CardTitle>
                        </div>
                        {post.isSolved && (
                            <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-bold border border-green-200 shrink-0">
                                SOLVED
                            </span>
                        )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2">
                        <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                                <AvatarImage src={post.author?.avatar} />
                                <AvatarFallback>{post.author?.name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-foreground">{post.author?.name || 'Unknown'}</span>
                        </div>
                        <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                        <span>Views: {post.views}</span>
                    </div>
                </CardHeader>
                
                <CardContent className="pt-4">
                    <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap">
                        {post.content}
                    </div>
                </CardContent>

                <CardFooter className="bg-muted/30 border-t py-3">
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className={`gap-2 ${post.likes > 0 ? 'text-primary' : 'text-muted-foreground'}`}
                        onClick={handleLike}
                        disabled={isLiking}
                    >
                        {isLiking ? <Loader2 className="h-4 w-4 animate-spin" /> : <ThumbsUp className="h-4 w-4" />}
                        {post.likes} Likes
                    </Button>
                </CardFooter>
            </Card>

            {/* Comments Section */}
            <div className="space-y-6 pt-6">
                <div className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-muted-foreground" />
                    <h3 className="text-xl font-semibold">Replies ({post.comments?.length || 0})</h3>
                </div>
                
                <Separator />

                {/* Add Comment Form */}
                <form onSubmit={handleCommentSubmit} className="space-y-3">
                    <Textarea 
                        placeholder={user ? "Write a reply..." : "Please login to reply"}
                        className="min-h-[100px] resize-y"
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                        disabled={!user || isSubmitting}
                    />
                    <div className="flex justify-end">
                        <Button type="submit" disabled={!user || isSubmitting || !newComment.trim()}>
                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Post Reply
                        </Button>
                    </div>
                </form>

                {/* Comment List */}
                <div className="space-y-4 pt-4">
                    {post.comments?.map((comment: any) => (
                        <Card key={comment.id} className={`shadow-sm ${comment.isSolution ? 'border-green-200 bg-green-50/30 dark:bg-green-950/20' : ''}`}>
                            <CardHeader className="p-4 pb-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={comment.author?.avatar} />
                                            <AvatarFallback>{comment.author?.name?.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-semibold text-sm">{comment.author?.name || 'Unknown'}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {new Date(comment.createdAt).toLocaleDateString()} at {new Date(comment.createdAt).toLocaleTimeString()}
                                            </div>
                                        </div>
                                    </div>
                                    {comment.isSolution && (
                                        <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded">
                                            SOLUTION
                                        </span>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 pt-2">
                                <div className="whitespace-pre-wrap text-sm">
                                    {comment.content}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    
                    {(!post.comments || post.comments.length === 0) && (
                        <div className="text-center py-10 text-muted-foreground border border-dashed rounded-lg">
                            No replies yet. Be the first to answer!
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
