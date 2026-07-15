"use client"

import * as React from 'react'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { courseApi, courseCategoryApi } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
    GraduationCap, Search, Loader2, Clock, Users,
    BookOpen, ChevronLeft, ChevronRight, X, Star
} from 'lucide-react'
import { getFullImageUrl } from '@/lib/image-utils'

interface Course {
    id: string
    title: string
    description: string
    category: string
    difficulty: string
    duration: number
    price: number
    averageRating?: number
    discountPrice?: number
    thumbnail?: string
    bannerUrl?: string
    courseType?: string
    instructor?: { name: string }
    _count?: { enrollments: number; modules: number }
    isEnrolled?: boolean
    fakeEnrolledCount?: number
    fakeRating?: number
}

const DIFFICULTIES = [
    { value: '', label: 'All Levels' },
    { value: 'BEGINNER', label: 'Beginner' },
    { value: 'INTERMEDIATE', label: 'Intermediate' },
    { value: 'ADVANCED', label: 'Advanced' },
]

const PAGE_SIZE = 12

export default function CourseList() {
    const router = useRouter()

    const [courses, setCourses] = React.useState<Course[]>([])
    const [total, setTotal] = React.useState(0)
    const [isLoading, setIsLoading] = React.useState(true)
    const [search, setSearch] = React.useState('')
    const [debouncedSearch, setDebouncedSearch] = React.useState('')
    const [category, setCategory] = React.useState('')
    const [difficulty, setDifficulty] = React.useState('')
    const [currentPage, setCurrentPage] = React.useState(1)
    const [dbCategories, setDbCategories] = React.useState<{ name: string; icon: string | null }[]>([])

    // Debounce
    React.useEffect(() => {
        const t = setTimeout(() => {
            setDebouncedSearch(search)
            setCurrentPage(1)
        }, 350)
        return () => clearTimeout(t)
    }, [search])

    const searchParams = useSearchParams()
    const jobPrepParam = searchParams.get('jobPrep')
    const isJobPrepOnly = jobPrepParam === 'true'

    // Fetch categories
    React.useEffect(() => {
        courseCategoryApi.getAll()
            .then(res => setDbCategories(res.data.categories || []))
            .catch(() => setDbCategories([]))
    }, [])

    // Fetch courses (server-side search + pagination)
    React.useEffect(() => {
        const abortController = new AbortController()
        const fetchCourses = async () => {
            try {
                setIsLoading(true)
                const response = await courseApi.getAll({
                    search: debouncedSearch || undefined,
                    category: category || undefined,
                    page: currentPage,
                    limit: PAGE_SIZE,
                    jobPrep: isJobPrepOnly ? true : undefined,
                })
                if (!abortController.signal.aborted) {
                    setCourses(response.data.courses || [])
                    setTotal(response.data.pagination?.total || 0)
                }
            } catch (error) {
                if (!abortController.signal.aborted) {
                    console.error('Failed to fetch courses:', error)
                }
            } finally {
                if (!abortController.signal.aborted) setIsLoading(false)
            }
        }
        fetchCourses()
        return () => abortController.abort()
    }, [debouncedSearch, category, currentPage, isJobPrepOnly])

    // Client-side difficulty filter
    const filteredCourses = difficulty
        ? courses.filter(c => c.difficulty === difficulty)
        : courses

    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

    const clearFilters = () => {
        setSearch('')
        setCategory('')
        setDifficulty('')
        setCurrentPage(1)
    }

    const hasFilters = search || category || difficulty

    const getDifficultyColor = (diff: string) => {
        switch (diff) {
            case 'BEGINNER': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
            case 'INTERMEDIATE': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
            case 'ADVANCED': return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
            default: return 'bg-muted text-muted-foreground'
        }
    }

    const getTypeColor = (type?: string) => {
        switch (type) {
            case 'LIVE': return 'bg-red-500 text-white'
            case 'HYBRID': return 'bg-purple-500 text-white'
            default: return 'bg-blue-500 text-white'
        }
    }

    return (
        <div className="container py-8">

            {/* Events & Webinars — Compact Ribbon */}
            <div className="mb-8 flex items-center justify-between gap-4 bg-gradient-to-r from-indigo-950 to-indigo-800 rounded-2xl px-5 py-3 border border-indigo-700/50 shadow-sm overflow-hidden relative">
                <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_70%_50%,rgba(99,102,241,0.8),transparent_60%)]" />
                <div className="flex items-center gap-3 z-10">
                    <span className="flex-shrink-0 inline-flex items-center justify-center w-7 h-7 bg-indigo-600 rounded-lg">
                        <span className="text-xs">📅</span>
                    </span>
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="flex h-2 w-2 rounded-full bg-teal-400 animate-pulse"></span>
                        <span className="text-white font-semibold text-sm">Upcoming Events &amp; Webinars</span>
                        <span className="text-indigo-300 text-xs hidden sm:inline">— Free masterclasses on AI, Cloud &amp; Tech Careers</span>
                    </div>
                </div>
                <Button
                    onClick={() => router.push('/events')}
                    size="sm"
                    className="z-10 flex-shrink-0 bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-semibold rounded-lg px-4 h-8 transition-all"
                >
                    View All →
                </Button>
            </div>
            
            {/* Quick Promoted Filter Tabs */}
            <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-2">Trending:</span>
                <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 rounded-full text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800"
                    onClick={() => { setSearch('High Demand'); setCategory(''); }}
                >
                    🚀 High Demand
                </Button>
                <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 rounded-full text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800"
                    onClick={() => { setSearch('Market Trends'); setCategory(''); }}
                >
                    📈 Market Trends
                </Button>
                <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 rounded-full text-xs"
                    onClick={() => { setSearch('Data Science'); setCategory(''); }}
                >
                    🤖 AI & Data Science
                </Button>
                <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 rounded-full text-xs"
                    onClick={() => { setSearch('Cloud'); setCategory(''); }}
                >
                    ☁️ Cloud & DevOps
                </Button>
                <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 rounded-full text-xs"
                    onClick={() => { setSearch('Web Development'); setCategory(''); }}
                >
                    💻 Web Development
                </Button>
            </div>

            {/* Unified Search and Filters */}
            <div className="flex flex-col lg:flex-row gap-4 mb-6 p-4 bg-muted/30 rounded-xl border border-border/50">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="course-search"
                        placeholder="Search courses — React, Python, AWS, Data Science..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 h-11 text-sm bg-background border-input"
                    />
                    {search && (
                        <button
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            onClick={() => setSearch('')}
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <select
                        title="Filter by Category"
                        value={category}
                        onChange={(e) => { setCategory(e.target.value); setCurrentPage(1) }}
                        className="h-11 px-3 rounded-md border border-input bg-background text-sm min-w-[200px]"
                    >
                        <option value="">All Categories</option>
                        {dbCategories.length > 0
                            ? dbCategories.map(cat => (
                                <option key={cat.name} value={cat.name}>
                                    {cat.icon ? `${cat.icon} ` : ''}{cat.name}
                                </option>
                            ))
                            : [
                                'Cloud & DevOps Engineering', 'Software Development',
                                'Data Science & Artificial Intelligence', 'Cyber Security',
                                'Networking & System Administration', 'ERP & SAP',
                                'ITSM & CRM Platforms', 'HR Management', 'Finance & Marketing'
                            ].map(name => <option key={name} value={name}>{name}</option>)
                        }
                    </select>

                    <select
                        title="Filter by Difficulty"
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value)}
                        className="h-11 px-3 rounded-md border border-input bg-background text-sm min-w-[150px]"
                    >
                        {DIFFICULTIES.map(diff => (
                            <option key={diff.value} value={diff.value}>{diff.label}</option>
                        ))}
                    </select>

                    {hasFilters && (
                        <Button variant="ghost" className="h-11 text-muted-foreground px-3" onClick={clearFilters}>
                            <X className="h-4 w-4 mr-1" /> Clear
                        </Button>
                    )}
                </div>
            </div>

            {/* Active filter chips */}
            {hasFilters && (
                <div className="flex flex-wrap gap-2 mb-5">
                    {search && (
                        <Badge variant="secondary" className="gap-1.5 pr-1">
                            Search: &quot;{search}&quot;
                            <button onClick={() => setSearch('')} className="ml-0.5 hover:text-destructive">
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    )}
                    {category && (
                        <Badge variant="secondary" className="gap-1.5 pr-1">
                            {category}
                            <button onClick={() => setCategory('')} className="ml-0.5 hover:text-destructive">
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    )}
                    {difficulty && (
                        <Badge variant="secondary" className="gap-1.5 pr-1">
                            {difficulty}
                            <button onClick={() => setDifficulty('')} className="ml-0.5 hover:text-destructive">
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    )}
                </div>
            )}

            {/* Course Grid */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-muted-foreground text-sm">Loading courses...</p>
                </div>
            ) : filteredCourses.length === 0 ? (
                <div className="text-center py-24 bg-muted/20 rounded-3xl border border-dashed border-border">
                    <GraduationCap className="h-16 w-16 mx-auto text-muted-foreground/20 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No courses found</h3>
                    <p className="text-muted-foreground mb-6 max-w-xs mx-auto">
                        {hasFilters
                            ? 'No courses match your current filters. Try broadening your search.'
                            : 'No courses are available right now. Check back soon!'}
                    </p>
                    {hasFilters && (
                        <Button onClick={clearFilters} variant="outline">
                            <X className="h-4 w-4 mr-2" /> Clear Filters
                        </Button>
                    )}
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredCourses.map((course) => (
                            <Card
                                key={course.id}
                                className="flex flex-col group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 rounded-2xl overflow-hidden border-border/50 cursor-pointer"
                                onClick={() => router.push(`/courses/${course.id}`)}
                            >
                                {/* Thumbnail */}
                                <div className="h-44 relative bg-gradient-to-br from-primary/10 via-purple-500/5 to-blue-500/10 flex items-center justify-center overflow-hidden">
                                    <GraduationCap className="h-14 w-14 text-primary/10 absolute z-0" />
                                    {(course.bannerUrl || course.thumbnail) && (
                                        <Image
                                            src={getFullImageUrl(course.bannerUrl || course.thumbnail)}
                                            alt={course.title}
                                            fill
                                            unoptimized
                                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                            className="absolute inset-0 w-full h-full object-cover z-10 group-hover:scale-105 transition-transform duration-500"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).style.opacity = '0'
                                            }}
                                        />
                                    )}
                                    {/* Course Type badge */}
                                    {course.courseType && (
                                        <span className={`absolute top-2 left-2 z-20 text-[10px] font-bold px-2 py-0.5 rounded-full ${getTypeColor(course.courseType)}`}>
                                            {course.courseType}
                                        </span>
                                    )}
                                    {/* Enrolled badge */}
                                    {course.isEnrolled && (
                                        <span className="absolute top-2 right-2 z-20 text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-500 text-white">
                                            ✓ Enrolled
                                        </span>
                                    )}
                                </div>

                                <CardHeader className="pb-2">
                                    {/* Tags row */}
                                    <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                                        <div className="flex items-center gap-1.5">
                                            <span className={`text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-md ${getDifficultyColor(course.difficulty)}`}>
                                                {course.difficulty || 'ALL'}
                                            </span>
                                            <span className="text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                                {course.duration || 0}h
                                            </span>
                                            <span className="flex items-center gap-0.5 text-[10px] font-bold text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded-md">
                                                <Star className="h-3 w-3 fill-amber-500" />
                                                {course.fakeRating || course.averageRating || 4.5}
                                            </span>
                                        </div>
                                        <span className="text-[10px] font-semibold text-primary/70 truncate max-w-[100px]">{course.category}</span>
                                    </div>

                                    <CardTitle className="text-base line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                                        {course.title}
                                    </CardTitle>
                                    <CardDescription className="line-clamp-2 text-sm leading-relaxed mt-1">
                                        {course.description}
                                    </CardDescription>
                                </CardHeader>

                                {/* Mini stats */}
                                <CardContent className="pt-0 pb-2">
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <BookOpen className="h-3 w-3" />
                                            {course._count?.modules || 0} modules
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Users className="h-3 w-3" />
                                            {(course.fakeEnrolledCount || 0) + (course._count?.enrollments || 0)} enrolled
                                        </span>
                                        {course.instructor?.name && (
                                            <span className="flex items-center gap-1 truncate">
                                                <Clock className="h-3 w-3 flex-shrink-0" />
                                                <span className="truncate">{course.instructor.name}</span>
                                            </span>
                                        )}
                                    </div>
                                </CardContent>

                                <CardFooter className="pt-3 border-t border-border/10 flex justify-end bg-muted/5 mt-auto">
                                    <Button
                                        size="sm"
                                        variant={course.isEnrolled ? 'secondary' : 'default'}
                                        className="rounded-xl text-xs"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            router.push(`/courses/${course.id}`)
                                        }}
                                    >
                                        {course.isEnrolled ? 'Continue' : 'View Course'}
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex flex-col items-center gap-3 pt-8">
                            <p className="text-sm text-muted-foreground">
                                Page {currentPage} of {totalPages} — {total} courses total
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    Previous
                                </Button>

                                <div className="flex gap-1">
                                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                        let page = i + 1
                                        if (totalPages > 5) {
                                            if (currentPage <= 3) page = i + 1
                                            else if (currentPage >= totalPages - 2) page = totalPages - 4 + i
                                            else page = currentPage - 2 + i
                                        }
                                        return (
                                            <Button
                                                key={page}
                                                variant={currentPage === page ? 'default' : 'outline'}
                                                size="sm"
                                                className="h-8 w-8 p-0"
                                                onClick={() => setCurrentPage(page)}
                                            >
                                                {page}
                                            </Button>
                                        )
                                    })}
                                </div>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                >
                                    Next
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
