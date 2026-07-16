"use client"

import * as React from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
    BookOpen,
    ChevronLeft,
    ChevronRight,
    Clock,
    GraduationCap,
    Loader2,
    Plus,
    Search,
    Trash2,
    X,
} from "lucide-react"

import api, { courseApi } from "@/lib/api"
import { getFullImageUrl } from "@/lib/image-utils"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface Course {
    id: string
    title: string
    category: string
    courseCode?: string
    isPublished: boolean
    difficulty: string
    price: number
    discountPrice?: number
    bannerUrl?: string
    thumbnail?: string
    _count?: { enrollments: number; modules: number }
}

interface Pagination {
    page: number
    limit: number
    total: number
    pages: number
}

type CourseStatus = "ALL" | "PUBLISHED" | "DRAFT"

export default function AdminCoursesPage() {
    const router = useRouter()
    const { hasPermission } = useAuth()
    const [courses, setCourses] = React.useState<Course[]>([])
    const [pagination, setPagination] = React.useState<Pagination>({
        page: 1,
        limit: 24,
        total: 0,
        pages: 1,
    })
    const [page, setPage] = React.useState(1)
    const [searchInput, setSearchInput] = React.useState("")
    const [search, setSearch] = React.useState("")
    const [status, setStatus] = React.useState<CourseStatus>("ALL")
    const [isLoading, setIsLoading] = React.useState(true)
    const [isDeleting, setIsDeleting] = React.useState<string | null>(null)
    const [error, setError] = React.useState("")

    React.useEffect(() => {
        const timer = window.setTimeout(() => {
            setPage(1)
            setSearch(searchInput.trim())
        }, 350)
        return () => window.clearTimeout(timer)
    }, [searchInput])

    const fetchCourses = React.useCallback(async () => {
        setIsLoading(true)
        setError("")
        try {
            const response = await api.get("/courses/manage/all", {
                params: {
                    page,
                    limit: pagination.limit,
                    search: search || undefined,
                    status,
                },
            })
            setCourses(response.data.courses || [])
            setPagination(response.data.pagination)
        } catch (requestError: unknown) {
            console.error(requestError)
            setError(
                (requestError as { response?: { data?: { error?: string } } })?.response?.data?.error
                || "Failed to load courses."
            )
        } finally {
            setIsLoading(false)
        }
    }, [page, pagination.limit, search, status])

    React.useEffect(() => {
        void fetchCourses()
    }, [fetchCourses])

    const handleStatusChange = (value: CourseStatus) => {
        setStatus(value)
        setPage(1)
    }

    const handleDelete = async (courseId: string, title: string) => {
        if (!window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
            return
        }

        setIsDeleting(courseId)
        try {
            await courseApi.delete(courseId)
            const remainingOnPage = courses.length - 1
            if (remainingOnPage === 0 && page > 1) {
                setPage(current => current - 1)
            } else {
                await fetchCourses()
            }
        } catch (deleteError: unknown) {
            const message = (deleteError as { response?: { data?: { error?: string } } })
                ?.response?.data?.error || "Failed to delete course."
            window.alert(message)
        } finally {
            setIsDeleting(null)
        }
    }

    const startItem = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1
    const endItem = Math.min(pagination.page * pagination.limit, pagination.total)

    return (
        <div className="space-y-6">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Courses</h1>
                    <p className="text-muted-foreground">
                        Manage all course content, publishing status and curriculum.
                    </p>
                </div>
                {hasPermission("COURSES", "create") && (
                    <Button onClick={() => router.push("/admin/courses/new")}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create New Course
                    </Button>
                )}
            </div>

            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col gap-3 md:flex-row">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={searchInput}
                                onChange={event => setSearchInput(event.target.value)}
                                placeholder="Search by title, category, description or course code..."
                                className="pl-9 pr-10"
                            />
                            {searchInput && (
                                <button
                                    type="button"
                                    aria-label="Clear course search"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    onClick={() => setSearchInput("")}
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                        <Select value={status} onValueChange={value => handleStatusChange(value as CourseStatus)}>
                            <SelectTrigger className="w-full md:w-48">
                                <SelectValue placeholder="Publishing status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All courses</SelectItem>
                                <SelectItem value="PUBLISHED">Published</SelectItem>
                                <SelectItem value="DRAFT">Draft</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
                        <span>
                            {isLoading
                                ? "Loading courses..."
                                : `Showing ${startItem}-${endItem} of ${pagination.total} courses`}
                        </span>
                        {(search || status !== "ALL") && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setSearchInput("")
                                    setSearch("")
                                    setStatus("ALL")
                                    setPage(1)
                                }}
                            >
                                Reset filters
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {error ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <p className="font-medium text-red-600">{error}</p>
                        <Button className="mt-4" variant="outline" onClick={() => void fetchCourses()}>
                            Try Again
                        </Button>
                    </CardContent>
                </Card>
            ) : isLoading ? (
                <div className="flex justify-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : courses.length === 0 ? (
                <Card>
                    <CardContent className="py-16 text-center">
                        <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/40" />
                        <h2 className="mt-4 text-lg font-semibold">No courses found</h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Try another search or reset the publishing filter.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {courses.map(course => {
                        const imageUrl = course.bannerUrl || course.thumbnail
                        return (
                            <Card key={course.id} className="group flex flex-col overflow-hidden transition-all hover:shadow-lg">
                                <div className="relative flex h-32 items-center justify-center overflow-hidden bg-primary/10">
                                    {imageUrl ? (
                                        <Image
                                            src={getFullImageUrl(imageUrl)}
                                            alt={course.title}
                                            fill
                                            sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw"
                                            className="object-cover transition-transform group-hover:scale-105"
                                        />
                                    ) : (
                                        <GraduationCap className="h-8 w-8 text-primary/30" />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                                </div>

                                <CardContent className="flex flex-1 flex-col p-5">
                                    <div className="mb-3 flex items-start justify-between gap-2">
                                        <Badge variant="outline" className="max-w-[60%] truncate">
                                            {course.category}
                                        </Badge>
                                        <Badge className={course.isPublished
                                            ? "bg-green-100 text-green-700 hover:bg-green-100"
                                            : "bg-yellow-100 text-yellow-700 hover:bg-yellow-100"
                                        }>
                                            {course.isPublished ? "Published" : "Draft"}
                                        </Badge>
                                    </div>

                                    <h2 className="min-h-14 line-clamp-2 text-lg font-bold">{course.title}</h2>
                                    {course.courseCode && (
                                        <p className="mt-1 text-xs text-muted-foreground">Code: {course.courseCode}</p>
                                    )}

                                    <div className="my-5 grid grid-cols-2 gap-3 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <BookOpen className="h-3.5 w-3.5" />
                                            {course._count?.modules || 0} Modules
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-3.5 w-3.5" />
                                            {course.difficulty}
                                        </div>
                                        <div className="col-span-2 text-xs">
                                            {course._count?.enrollments || 0} enrolled students
                                        </div>
                                    </div>

                                    <div className="mt-auto flex items-center justify-between border-t pt-4">
                                        <span className="text-lg font-bold">
                                            {Number(course.price) === 0 ? "Free" : `₹${Number(course.price).toLocaleString("en-IN")}`}
                                        </span>
                                        <div className="flex gap-2">
                                            {hasPermission("COURSES", "delete") && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600"
                                                    onClick={() => void handleDelete(course.id, course.title)}
                                                    disabled={isDeleting === course.id}
                                                    aria-label={`Delete ${course.title}`}
                                                >
                                                    {isDeleting === course.id
                                                        ? <Loader2 className="h-4 w-4 animate-spin" />
                                                        : <Trash2 className="h-4 w-4" />}
                                                </Button>
                                            )}
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => router.push(`/admin/courses/${course.id}/edit`)}
                                            >
                                                {hasPermission("COURSES", "update") ? "Manage" : "View"}
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}

            {!isLoading && !error && pagination.total > 0 && (
                <div className="flex flex-col items-center justify-between gap-3 border-t pt-5 sm:flex-row">
                    <p className="text-sm text-muted-foreground">
                        Page {pagination.page} of {pagination.pages}
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            disabled={page <= 1}
                            onClick={() => setPage(current => Math.max(current - 1, 1))}
                        >
                            <ChevronLeft className="mr-1 h-4 w-4" />
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            disabled={page >= pagination.pages}
                            onClick={() => setPage(current => Math.min(current + 1, pagination.pages))}
                        >
                            Next
                            <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
