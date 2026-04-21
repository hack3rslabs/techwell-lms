"use client"

import * as React from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { courseApi, courseCategoryApi } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { GraduationCap, Search, Loader2 } from 'lucide-react'
import { getFullImageUrl } from '@/lib/image-utils'

interface Course {
    id: string
    title: string
    description: string
    category: string
    difficulty: string
    duration: number
    price: number
    thumbnail?: string
    bannerUrl?: string
    instructor?: { name: string }
    _count?: { enrollments: number }
    isEnrolled?: boolean
}

const difficulties = [
    { value: '', label: 'All Levels' },
    { value: 'BEGINNER', label: 'Beginner' },
    { value: 'INTERMEDIATE', label: 'Intermediate' },
    { value: 'ADVANCED', label: 'Advanced' },
]

export default function CourseList() {
    const router = useRouter()
    const { isAuthenticated } = useAuth()

    const [courses, setCourses] = React.useState<Course[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [search, setSearch] = React.useState('')
    const [category, setCategory] = React.useState('')
    const [difficulty, setDifficulty] = React.useState('')
    const [_enrollingId, setEnrollingId] = React.useState<string | null>(null)
    const [dbCategories, setDbCategories] = React.useState<{ name: string; icon: string | null }[]>([])

    React.useEffect(() => {
        courseCategoryApi.getAll()
            .then(res => setDbCategories(res.data.categories || []))
            .catch(() => setDbCategories([]))
    }, [])

    React.useEffect(() => {
        const abortController = new AbortController()
        
        const fetchCourses = async () => {
            try {
                setIsLoading(true)
                const response = await courseApi.getAll({
                    search: search || undefined,
                    category: category || undefined
                })
                if (!abortController.signal.aborted) {
                    setCourses(response.data.courses || [])
                }
            } catch (error) {
                if (!abortController.signal.aborted) {
                    console.error('Failed to fetch courses:', error)
                }
            } finally {
                if (!abortController.signal.aborted) {
                    setIsLoading(false)
                }
            }
        }

        const debounce = setTimeout(fetchCourses, 300)
        return () => {
            clearTimeout(debounce)
            abortController.abort()
        }
    }, [search, category])

    const _handleEnroll = async (courseId: string) => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }

        setEnrollingId(courseId)
        try {
            await courseApi.enroll(courseId)
            setCourses(courses.map(c =>
                c.id === courseId ? { ...c, isEnrolled: true } : c
            ))
        } catch (error) {
            console.error('Failed to enroll:', error)
        } finally {
            setEnrollingId(null)
        }
    }

    const filteredCourses = difficulty
        ? courses.filter(c => c.difficulty === difficulty)
        : courses

    const getDifficultyColor = (diff: string) => {
        switch (diff) {
            case 'BEGINNER': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            case 'INTERMEDIATE': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
            case 'ADVANCED': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            default: return 'bg-gray-100 text-gray-700'
        }
    }

    return (
        <div className="container py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-extrabold tracking-tight mb-2">Explore AI-Adaptive Courses</h1>
                <p className="text-xl text-muted-foreground">
                    Master the most in-demand tech skills with our personalized learning paths.
                </p>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="relative md:w-1/2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search courses (e.g., React, AI, Python)..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 h-10"
                    />
                </div>
                <select
                    title="Filter by Category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="h-10 px-3 rounded-md border border-input bg-background text-sm min-w-[150px]"
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
                    className="h-10 px-3 rounded-md border border-input bg-background text-sm min-w-[150px]"
                >
                    {difficulties.map(diff => (
                        <option key={diff.value} value={diff.value}>{diff.label}</option>
                    ))}
                </select>
            </div>

            {/* Course Grid */}
            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : filteredCourses.length === 0 ? (
                <div className="text-center py-20 bg-muted/30 rounded-3xl">
                    <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-20" />
                    <h3 className="text-lg font-medium">No courses found matching your criteria</h3>
                    <p className="text-muted-foreground">Try adjusting your search or filters to see more results.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredCourses.map((course) => (
                        <Card
                            key={course.id}
                            className="flex flex-col group hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden border-border/50 cursor-pointer"
                            onClick={() => router.push(`/courses/${course.id}`)}
                        >
                                <div className="h-48 relative bg-gradient-to-br from-primary/5 via-purple-500/5 to-blue-500/5 flex items-center justify-center overflow-hidden">
                                    <GraduationCap className="h-16 w-16 text-primary/20 absolute z-0" />
                                    {(course.bannerUrl || course.thumbnail) && (
                                        <Image
                                            src={getFullImageUrl(course.bannerUrl || course.thumbnail)}
                                            alt={course.title}
                                            fill
                                            unoptimized
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            className="absolute inset-0 w-full h-full object-cover z-10 transition-opacity duration-300"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                console.error(`[IMAGE ERROR] Failed to load: ${target.src}`);
                                                target.style.opacity = '0';
                                            }}
                                            onLoad={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.style.opacity = '1';
                                            }}
                                        />
                                    )}
                                </div>
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between mb-3">
                                    <span className={`text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded-md ${getDifficultyColor(course.difficulty)}`}>
                                        {course.difficulty}
                                    </span>
                                    <span className="text-xs font-semibold text-primary/70">{course.category}</span>
                                </div>
                                <CardTitle className="text-xl line-clamp-1 group-hover:text-primary transition-colors">{course.title}</CardTitle>
                                <CardDescription className="line-clamp-2 text-sm leading-relaxed">{course.description}</CardDescription>
                            </CardHeader>

                            <CardFooter className="pt-4 border-t border-border/10 flex items-center justify-between bg-muted/5">
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">Price</span>
                                    <span className="text-2xl font-black text-foreground">
                                        {course.price === 0 ? 'Free' : `₹${course.price}`}
                                    </span>
                                </div>
                                {course.isEnrolled && (
                                    <span className="text-xs px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-full font-semibold dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
                                        ✓ Enrolled
                                    </span>
                                )}
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
