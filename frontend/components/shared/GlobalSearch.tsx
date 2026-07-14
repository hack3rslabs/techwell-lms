"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Search, Loader2, BookOpen, User } from "lucide-react"
import { Input } from "@/components/ui/input"
import { searchApi } from "@/lib/api"


interface SearchCourse {
    id: string
    title: string
}

interface SearchInstructor {
    id: string
    name: string
}

export function GlobalSearch() {
    const router = useRouter()
    const [query, setQuery] = React.useState("")
    const [results, setResults] = React.useState<{ courses: SearchCourse[]; instructors: SearchInstructor[] } | null>(null)
    const [isLoading, setIsLoading] = React.useState(false)
    const [isOpen, setIsOpen] = React.useState(false)
    const searchRef = React.useRef<HTMLDivElement>(null)

    const performSearch = async (q: string) => {
        setIsLoading(true)
        try {
            const res = await searchApi.global(q)
            setResults(res.data)
            setIsOpen(true)
        } catch (err) {
            console.error(err)
        } finally {
            setIsLoading(false)
        }
    }

    // Quick debounce implementation if hook missing
    React.useEffect(() => {
        const timer = setTimeout(() => {
            if (query.length >= 2) {
                performSearch(query)
            } else {
                setResults(null)
                setIsOpen(false)
            }
        }, 400)
        return () => clearTimeout(timer)
    }, [query])

    // Close on click outside
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const handleSelect = (url: string) => {
        setIsOpen(false)
        setQuery("")
        router.push(url)
    }

    return (
        <div className="relative ml-2 lg:ml-4 hidden md:block" ref={searchRef}>
            <div className="relative group">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                <Input
                    type="search"
                    placeholder="Search..."
                    className="pl-8 w-[140px] lg:w-[160px] xl:w-[240px] focus:w-[180px] lg:focus:w-[220px] xl:focus:w-[320px] transition-all duration-300 bg-background/50 hover:bg-background border-border/70"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => { if (results) setIsOpen(true) }}
                />
                {isLoading && (
                    <Loader2 className="absolute right-2.5 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
                )}
            </div>

            {isOpen && results && (
                <div className="absolute top-full mt-2 w-full bg-popover text-popover-foreground shadow-md rounded-md border p-2 z-50">
                    {results.courses.length === 0 && results.instructors.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">No results found.</div>
                    ) : (
                        <div className="max-h-[300px] overflow-y-auto space-y-4">
                            {/* Courses */}
                            {results.courses.length > 0 && (
                                <div>
                                    <h4 className="text-xs font-semibold text-muted-foreground mb-2 px-2">Courses</h4>
                                    <div className="space-y-1">
                                        {results.courses.map((c) => (
                                            <div
                                                key={c.id}
                                                className="flex items-center gap-2 p-2 hover:bg-muted rounded cursor-pointer text-sm"
                                                onClick={() => handleSelect(`/courses/${c.id}`)}
                                            >
                                                <BookOpen className="h-4 w-4 text-primary" />
                                                <span>{c.title}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Instructors */}
                            {results.instructors.length > 0 && (
                                <div>
                                    <h4 className="text-xs font-semibold text-muted-foreground mb-2 px-2 mt-2">Mentors</h4>
                                    <div className="space-y-1">
                                        {results.instructors.map((i) => (
                                            <div
                                                key={i.id}
                                                className="flex items-center gap-2 p-2 hover:bg-muted rounded cursor-pointer text-sm"
                                                onClick={() => handleSelect(`/mentors/${i.id}`)} // Assuming mentor profile page
                                            >
                                                <User className="h-4 w-4 text-blue-500" />
                                                <span>{i.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
