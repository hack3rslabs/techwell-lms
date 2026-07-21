"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
    Search,
    Plus,
    Users,
    Clock,
    ThumbsUp,
    MessageCircle,
    Loader2
} from "lucide-react"
import api from "@/lib/api"
import { toast } from "react-hot-toast"
import { useRouter } from "next/navigation"

export default function ForumPage() {
    const router = useRouter()
    const [categories, setCategories] = React.useState<any[]>([])
    const [discussions, setDiscussions] = React.useState<any[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [search, setSearch] = React.useState("")
    const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null)

    // New Post State
    const [isNewPostOpen, setIsNewPostOpen] = React.useState(false)
    const [newPost, setNewPost] = React.useState({ title: '', content: '', categoryId: '' })
    const [isSubmitting, setIsSubmitting] = React.useState(false)

    const fetchData = async () => {
        setIsLoading(true)
        try {
            const [catRes, postRes] = await Promise.all([
                api.get('/forum/categories'),
                api.get('/forum/posts', {
                    params: {
                        search: search || undefined,
                        category: selectedCategory || undefined
                    }
                })
            ])
            setCategories(catRes.data)
            setDiscussions(postRes.data.posts)
        } catch (error) {
            console.error("Failed to fetch forum data", error)
            toast.error("Failed to load forum")
        } finally {
            setIsLoading(false)
        }
    }

    React.useEffect(() => {
        fetchData()
    }, [search, selectedCategory])

    const handleCreatePost = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newPost.title || !newPost.content || !newPost.categoryId) {
            toast.error("Please fill in all fields")
            return
        }
        setIsSubmitting(true)
        try {
            const res = await api.post('/forum/posts', newPost)
            toast.success("Discussion created!")
            setIsNewPostOpen(false)
            setNewPost({ title: '', content: '', categoryId: '' })
            router.push(`/community/forum/${res.data.slug}`)
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to create discussion")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Forum</h1>
                    <p className="text-muted-foreground">Join the conversation and learn together.</p>
                </div>
                
                <Dialog open={isNewPostOpen} onOpenChange={setIsNewPostOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            New Discussion
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>Start a New Discussion</DialogTitle>
                            <DialogDescription>
                                Ask a question, share an idea, or start a conversation.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreatePost} className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Category</label>
                                <Select value={newPost.categoryId} onValueChange={v => setNewPost({...newPost, categoryId: v})}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map(c => (
                                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Title</label>
                                <Input 
                                    placeholder="Discussion title..." 
                                    value={newPost.title}
                                    onChange={e => setNewPost({...newPost, title: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Content</label>
                                <Textarea 
                                    placeholder="Write your discussion details here..." 
                                    className="min-h-[200px]"
                                    value={newPost.content}
                                    onChange={e => setNewPost({...newPost, content: e.target.value})}
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <Button type="button" variant="outline" onClick={() => setIsNewPostOpen(false)}>Cancel</Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Post Discussion"}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Search discussions..." 
                    className="pl-10" 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card 
                    className={`hover:shadow-md transition-shadow cursor-pointer ${!selectedCategory ? 'border-primary' : ''}`}
                    onClick={() => setSelectedCategory(null)}
                >
                    <CardHeader className="p-4">
                        <CardTitle className="text-base flex items-center justify-between">
                            All Categories
                        </CardTitle>
                    </CardHeader>
                </Card>
                {categories.map((cat) => (
                    <Card 
                        key={cat.id} 
                        className={`hover:shadow-md transition-shadow cursor-pointer ${selectedCategory === cat.slug ? 'border-primary' : ''}`}
                        onClick={() => setSelectedCategory(cat.slug)}
                    >
                        <CardHeader className="p-4">
                            <CardTitle className="text-base flex items-center justify-between">
                                {cat.name}
                                <span className="text-xs font-normal text-muted-foreground bg-secondary px-2 py-1 rounded-full">
                                    {cat._count?.posts || 0}
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
                <h3 className="text-lg font-semibold">
                    {selectedCategory ? `Discussions in ${categories.find(c => c.slug === selectedCategory)?.name}` : 'Recent Discussions'}
                </h3>
                
                {isLoading ? (
                    <div className="flex items-center justify-center py-10">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : discussions.length === 0 ? (
                    <div className="text-center py-10 border rounded-lg border-dashed">
                        <p className="text-muted-foreground">No discussions found.</p>
                        <Button variant="link" onClick={() => setIsNewPostOpen(true)}>Start a discussion</Button>
                    </div>
                ) : (
                    discussions.map((item) => (
                        <Card 
                            key={item.id} 
                            className="hover:border-primary/50 transition-colors cursor-pointer"
                            onClick={() => router.push(`/community/forum/${item.slug}`)}
                        >
                            <CardContent className="p-4 flex items-start gap-4">
                                <div className="flex flex-col items-center gap-1 min-w-[3rem] text-muted-foreground">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 pointer-events-none text-green-600">
                                        <ThumbsUp className="h-4 w-4" />
                                    </Button>
                                    <span className="text-sm font-medium">{item.likes}</span>
                                </div>

                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-semibold text-lg line-clamp-1 hover:text-primary hover:underline">
                                            {item.title}
                                        </h4>
                                        {item.isPinned && (
                                            <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium border border-amber-200">
                                                PINNED
                                            </span>
                                        )}
                                        {item.isSolved && (
                                            <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium border border-green-200">
                                                SOLVED
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                        <span className="bg-muted px-2 py-0.5 rounded text-xs">{item.category?.name}</span>
                                        <span className="flex items-center gap-1">
                                            <Users className="h-3 w-3" /> {item.author?.name || 'Unknown User'}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" /> {new Date(item.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end gap-1">
                                    <div className="flex items-center gap-1 text-muted-foreground">
                                        <MessageCircle className="h-4 w-4" />
                                        <span className="text-sm">{item._count?.comments || 0}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
