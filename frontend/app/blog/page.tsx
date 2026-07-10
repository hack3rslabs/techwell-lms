"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import {
  Calendar,
  User,
  Search,
  Tag,
  Loader2,
  Clock,
  MessageSquare,
  Eye,
  ArrowRight,
  TrendingUp,
  Sparkles
} from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"

import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import api from "@/lib/api"
import { getFullImageUrl } from "@/lib/image-utils"
import { useAuth } from "@/lib/auth-context"

interface BlogPost {
  id: string
  title: string
  slug: string
  summary?: string
  content: string
  coverImage?: string
  category?: string
  publishedAt?: string
  createdAt: string
  author?: { name: string, avatar?: string }
  tags?: string[]
  views?: number
  _count?: {
      comments?: number
  }
}

const getReadingTime = (content: string) => {
    if (!content) return "1 min read"
    const text = content.replace(/<[^>]+>/g, '')
    const words = text.trim().split(/\s+/).length
    const minutes = Math.ceil(words / 200) || 1
    return `${minutes} min read`
}

function PostCard({ post }: { post: any }) {
    const handleClick = () => {
        // Fire-and-forget click tracking for CTR
        if (post.id) {
            api.post(`/blogs/${post.id}/click`).catch(() => {});
        }
    };

    return (
        <Link href={`/blog/${post.slug || post.id}`} className="block group h-full" onClick={handleClick}>
            <Card className="h-full flex flex-col overflow-hidden border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 group-hover:-translate-y-1 rounded-2xl">
                {/* Cover Image */}
                <div className="relative h-56 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                {post.coverImage ? (
                    <Image 
                        src={getFullImageUrl(post.coverImage)} 
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30" />
                )}
                {post.category && (
                    <Badge className="absolute top-4 left-4 bg-white/90 text-slate-900 backdrop-blur border-none font-bold shadow-sm">{post.category}</Badge>
                )}
                </div>

                <CardContent className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400 mb-3">
                    <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(post.publishedAt || post.createdAt).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                    </span>
                    <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {getReadingTime(post.content)}
                    </span>
                </div>

                <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 leading-snug">
                    {post.title}
                </h3>

                <p className="text-slate-600 dark:text-slate-400 line-clamp-2 mb-6 text-sm flex-1 leading-relaxed">
                    {post.summary || post.content.replace(/<[^>]+>/g, '').substring(0, 120)}...
                </p>

                <div className="flex items-center justify-between text-sm text-slate-500 pt-4 border-t border-slate-100 dark:border-slate-800/60 mt-auto">
                    <span className="font-semibold text-slate-900 dark:text-slate-200">
                    {post.author?.name || "Admin"}
                    </span>
                    
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-xs" title="Views">
                            <Eye className="h-3.5 w-3.5 text-slate-400" /> {post.views || 0}
                        </span>
                        <span className="flex items-center gap-1 text-xs" title="Comments">
                            <MessageSquare className="h-3.5 w-3.5 text-slate-400" /> {post._count?.comments || 0}
                        </span>
                    </div>
                </div>
                </CardContent>
            </Card>
        </Link>
    )
}

export default function BlogPage() {
  const { user } = useAuth()
  const [posts, setPosts] = React.useState<BlogPost[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  const [category, setCategory] = React.useState("")
  const [availableCategories, setAvailableCategories] = React.useState<string[]>([])

  /* ---------------- Debounce Search ---------------- */
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery])

  /* ---------------- Fetch Categories ---------------- */
  React.useEffect(() => {
    api.get('/blogs/categories')
       .then(res => setAvailableCategories(res.data))
       .catch(console.error)
  }, [])

  /* ---------------- Fetch Blogs ---------------- */
  React.useEffect(() => {
    const abortController = new AbortController()
    const fetchPosts = async () => {
      setIsLoading(true)
      try {
        const res = await api.get(
          `/blogs?status=PUBLISHED&search=${debouncedSearch}&category=${category}`,
          { signal: abortController.signal }
        )
        if (!abortController.signal.aborted) {
          setPosts(res.data.blogs || [])
        }
      } catch (error) {
        if (!abortController.signal.aborted) console.error(error)
      } finally {
        if (!abortController.signal.aborted) setIsLoading(false)
      }
    }
    fetchPosts()
    return () => abortController.abort()
  }, [debouncedSearch, category])

  const featuredPost = posts.length > 0 && !searchQuery && !category ? posts[0] : null
  const regularPosts = featuredPost ? posts.slice(1) : posts

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-slate-950">
      
      {/* Dynamic Header */}
      <div className="relative py-20 overflow-hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-indigo-500 opacity-20 blur-[100px]"></div>
          <div className="container relative z-10 text-center max-w-4xl mx-auto px-6">
              <div className="flex items-center justify-center gap-4 mb-6">
                  <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-300 dark:hover:bg-indigo-800/50 rounded-full px-4 py-1.5 border-none">
                      <Sparkles className="w-3.5 h-3.5 mr-2 inline" /> Techwell Insights
                  </Badge>
                  {user && ['SUPER_ADMIN', 'ADMIN', 'CONTENT_WRITER'].includes(user.role) && (
                      <Link href="/admin/posts/create">
                          <Button size="sm" className="rounded-full bg-slate-900 text-white hover:bg-slate-800 shadow-sm border border-slate-700">
                              Write Article
                          </Button>
                      </Link>
                  )}
              </div>
              <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight text-slate-900 dark:text-white leading-tight">
                  Ideas that <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-cyan-500">shape</span> your tech career.
              </h1>
              <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                  Deep dives into software engineering, AI, UI/UX, and career growth. Learn directly from industry experts.
              </p>

              {/* Search + Filters */}
              <div className="relative max-w-2xl mx-auto mb-8 shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-full group">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  <Input
                      placeholder="Search for an article..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-14 h-16 rounded-full text-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-slate-200/60 dark:border-slate-800 focus-visible:ring-indigo-500 focus-visible:ring-offset-0"
                  />
              </div>

              {/* Categories Pill Navigation */}
              {availableCategories.length > 0 && (
                <div className="flex flex-wrap items-center justify-center gap-2 max-w-4xl mx-auto">
                  <button
                    onClick={() => setCategory("")}
                    className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                      category === ""
                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-lg scale-105"
                        : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    All Topics
                  </button>
                  {availableCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                        category === cat
                          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 scale-105 border-none"
                          : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
          </div>
      </div>

      <div className="container py-16 px-6 max-w-7xl mx-auto">
        {isLoading ? (
          <div className="flex justify-center py-32">
            <Loader2 className="animate-spin h-10 w-10 text-indigo-600" />
          </div>
        ) : (
          <>
            {/* Featured Post Hero */}
            {featuredPost && (
              <div className="mb-16">
                  <div className="flex items-center gap-2 mb-6">
                      <TrendingUp className="h-5 w-5 text-rose-500" />
                      <h2 className="text-2xl font-bold tracking-tight">Featured Story</h2>
                  </div>
                  <Link href={`/blog/${featuredPost.slug || featuredPost.id}`} className="group block">
                      <div className="relative rounded-3xl overflow-hidden bg-slate-900 shadow-[0_20px_50px_rgba(0,0,0,0.15)] transition-all duration-500 hover:shadow-[0_20px_50px_rgba(79,70,229,0.25)] border border-slate-200 dark:border-slate-800 group-hover:-translate-y-1">
                          {featuredPost.coverImage ? (
                              <Image 
                                  src={getFullImageUrl(featuredPost.coverImage)} 
                                  alt={featuredPost.title}
                                  width={1200}
                                  height={600}
                                  className="w-full h-[400px] md:h-[500px] object-cover opacity-80 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105"
                              />
                          ) : (
                              <div className="w-full h-[400px] md:h-[500px] bg-gradient-to-br from-indigo-900 to-purple-900" />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent flex flex-col justify-end p-8 md:p-12">
                              {featuredPost.category && (
                                  <Badge className="bg-indigo-600 text-white border-none w-fit mb-4 text-xs tracking-wider uppercase">{featuredPost.category}</Badge>
                              )}
                              <h3 className="text-3xl md:text-5xl font-extrabold text-white mb-4 leading-tight group-hover:text-indigo-200 transition-colors">
                                  {featuredPost.title}
                              </h3>
                              <p className="text-slate-300 md:text-lg mb-6 line-clamp-2 max-w-3xl">
                                  {featuredPost.summary || featuredPost.content.replace(/<[^>]+>/g, '').substring(0, 150)}...
                              </p>
                              <div className="flex items-center gap-6 text-sm text-slate-400">
                                  <span className="flex items-center gap-2 font-medium text-slate-200">
                                      <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden">
                                          {featuredPost.author?.avatar ? <Image src={featuredPost.author.avatar} alt="Author" width={32} height={32} className="object-cover"/> : <User className="h-4 w-4 text-slate-300" />}
                                      </div>
                                      {featuredPost.author?.name || "Admin"}
                                  </span>
                                  <span className="flex items-center gap-1.5 hidden md:flex"><Calendar className="h-4 w-4" /> {new Date(featuredPost.publishedAt || featuredPost.createdAt).toLocaleDateString(undefined, {month: 'long', day: 'numeric'})}</span>
                                  <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {getReadingTime(featuredPost.content)}</span>
                              </div>
                          </div>
                      </div>
                  </Link>
              </div>
            )}

            {/* Grouped Category Sections */}
            {regularPosts.length > 0 ? (
              <div className="space-y-16">
                  {category === "" ? (
                      // Group by categories when no specific category is selected
                      Array.from(new Set(regularPosts.map(p => p.category).filter(Boolean))).map(catGroup => {
                          const groupPosts = regularPosts.filter(p => p.category === catGroup).slice(0, 3)
                          if(groupPosts.length === 0) return null;
                          return (
                              <div key={catGroup as string} className="space-y-6">
                                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                                      <h3 className="text-2xl font-bold">{catGroup as string}</h3>
                                      <button onClick={() => setCategory(catGroup as string)} className="text-sm font-bold text-indigo-600 hover:text-indigo-700">View All →</button>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                      {groupPosts.map(post => (
                                          <PostCard key={post.id} post={post} />
                                      ))}
                                  </div>
                              </div>
                          )
                      })
                  ) : (
                      // Just grid if category is selected
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                          {regularPosts.map((post) => (
                              <PostCard key={post.id} post={post} />
                          ))}
                      </div>
                  )}
              </div>
            ) : (
              !featuredPost && (
                <div className="text-center py-32 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="h-20 w-20 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Search className="h-10 w-10 text-indigo-500" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">No articles found</h3>
                  <p className="text-slate-500">Try adjusting your search or category filters.</p>
                </div>
              )
            )}
          </>
        )}
      </div>

      {/* Newsletter CTA Block */}
      <div className="container pb-24 px-6 max-w-5xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden bg-slate-900 shadow-2xl">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/90 to-purple-800/90 backdrop-blur-sm"></div>
              <div className="relative p-10 md:p-16 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-10">
                  <div className="max-w-xl">
                      <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 tracking-tight">Never miss an update.</h2>
                      <p className="text-indigo-100 text-lg leading-relaxed">Join 10,000+ developers and tech enthusiasts getting our best insights delivered to their inbox weekly.</p>
                  </div>
                  <div className="w-full md:w-auto flex-shrink-0">
                      <div className="flex flex-col sm:flex-row gap-3">
                          <Input placeholder="Enter your email" className="h-12 w-full md:w-72 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/20 transition-colors" />
                          <Button size="lg" className="h-12 bg-white text-indigo-900 hover:bg-slate-100 font-bold rounded-xl px-8 shadow-xl">Subscribe</Button>
                      </div>
                      <p className="text-xs text-indigo-200 mt-3 opacity-80 text-center sm:text-left">No spam. Unsubscribe anytime.</p>
                  </div>
              </div>
          </div>
      </div>

    </div>
  )
}
