"use client"

import * as React from "react"
import Link from "next/link"
import {
  Calendar,
  User,
  ArrowRight,
  Search,
  Tag,
  Loader2,
  Clock
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"

import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import api from "@/lib/api"

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
  author?: { name: string }
  tags?: string[]
}

export default function BlogPage() {

  const [posts, setPosts] = React.useState<BlogPost[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  const [searchQuery, setSearchQuery] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")

  const [category, setCategory] = React.useState("")

  /* ---------------- Debounce Search ---------------- */

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery])

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

        if (!abortController.signal.aborted) {
          console.error(error)
        }

      } finally {

        if (!abortController.signal.aborted) {
          setIsLoading(false)
        }

      }

    }

    fetchPosts()

    return () => abortController.abort()

  }, [debouncedSearch, category])

  /* ---------------- Reading Time ---------------- */

  const getReadingTime = (content: string) => {
    const words = content.split(" ").length
    const minutes = Math.ceil(words / 200)
    return `${minutes} min read`
  }

  return (

    <div className="min-h-screen py-12">

      <div className="container">

        {/* Header */}

        <div className="text-center mb-12">

          <h1 className="text-4xl font-bold mb-4">
            Techwell Blog
          </h1>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Insights, tutorials, and success stories to help you grow your tech career
          </p>

        </div>

        {/* Search + Filters */}

        <div className="flex flex-col md:flex-row gap-4 justify-center mb-12">

          <div className="relative w-full max-w-sm">

            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

            <Input
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />

          </div>

          <select
            className="border rounded-md px-3 py-2 text-sm"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="AI & Future Tech">AI & Future Tech</option>
            <option value="IT Careers">IT Careers</option>
            <option value="Freshers Guide">Freshers Guide</option>
            <option value="Skill Development">Skill Development</option>
          </select>

        </div>

        {/* Loading */}

        {isLoading ? (

          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin h-8 w-8 text-primary" />
          </div>

        ) : (

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {posts.length > 0 ? posts.map((post) => (

              <Card
                key={post.id}
                className="hover:shadow-xl transition-all duration-300 group flex flex-col h-full"
              >

                {/* Cover Image */}

                {post.coverImage ? (

                  <div
                    className="h-48 w-full bg-cover bg-center rounded-t-lg"
                    style={{
                      backgroundImage: `url(${post.coverImage})`
                    }}
                  />

                ) : (

                  <div className="h-48 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-t-lg" />

                )}

                <CardHeader>

                  {/* Meta */}

                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mb-2">

                    {post.category && (
                      <Badge variant="secondary">
                        {post.category}
                      </Badge>
                    )}

                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}
                    </span>

                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {getReadingTime(post.content)}
                    </span>

                  </div>

                  {/* Title */}

                  <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2">

                    {post.title}

                  </CardTitle>

                  {/* Summary */}

                  <CardDescription className="line-clamp-2">

                    {post.summary || post.content.substring(0, 120)}...

                  </CardDescription>

                </CardHeader>

                <CardContent className="mt-auto pt-0">

                  {/* Tags */}

                  <div className="flex flex-wrap gap-2 mb-4">

                    {post.tags?.slice(0, 3).map((tag, i) => (
                      <Badge key={i} variant="outline">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}

                  </div>

                  {/* Footer */}

                  <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t">

                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {post.author?.name || "Admin"}
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