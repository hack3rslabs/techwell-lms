"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Search, MapPin, Briefcase, Filter, Building2, Clock, Banknote, GraduationCap, ChevronRight } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import api from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import EmployerRequestDialog from "@/components/jobs/EmployerRequestDialog"

interface Job {
    id: string
    title: string
    type: string
    location: string
    salary: string
    experience: string
    description: string
    employer: {
        name: string
        employerProfile: {
            companyName: string
            logo: string | null
            industry: string | null
        }
    }
    createdAt: string
}

export default function JobListing() {
    const { user } = useAuth()
    const [jobs, setJobs] = useState<Job[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [filters, setFilters] = useState({
        search: "",
        type: [] as string[],
        location: "",
        experience: "0"
    })

    useEffect(() => {
        fetchJobs()
    }, [])

    const fetchJobs = async () => {
        setIsLoading(true)
        try {
            const res = await api.get('/jobs')
            setJobs(res.data)
        } catch (error) {
            console.error("Failed to fetch jobs", error)
        } finally {
            setIsLoading(false)
        }
    }

    const filteredJobs = jobs.filter(job => {
        const matchesSearch = job.title.toLowerCase().includes(filters.search.toLowerCase()) ||
            job.employer.employerProfile?.companyName.toLowerCase().includes(filters.search.toLowerCase())
        const matchesType = filters.type.length === 0 || filters.type.includes(job.type)
        const matchesLocation = filters.location === "" || job.location.toLowerCase().includes(filters.location.toLowerCase())
        return matchesSearch && matchesType && matchesLocation
    })

    const toggleTypeFilter = (type: string) => {
        setFilters(prev => ({
            ...prev,
            type: prev.type.includes(type)
                ? prev.type.filter(t => t !== type)
                : [...prev.type, type]
        }))
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
            {/* Minimal Header Search */}
            <div className="bg-white dark:bg-slate-900 border-b sticky top-16 z-30 shadow-sm">
                <div className="container py-4">
                    <div className="flex gap-4 max-w-4xl mx-auto">
                        <div className="relative w-1/2">
                            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                            <Input
                                className="pl-10 h-11"
                                placeholder="Search skills, designations, companies..."
                                value={filters.search}
                                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                            />
                        </div>
                        <div className="relative w-1/3 hidden md:block">
                            <MapPin className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                            <Input
                                className="pl-10 h-11"
                                placeholder="Location"
                                value={filters.location}
                                onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                            />
                        </div>
                        <Button size="lg" className="h-11 px-8">Search Jobs</Button>
                    </div>
                </div>
            </div>

            <div className="container py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Sidebar Filters */}
                <div className="hidden lg:block lg:col-span-3 space-y-6">
                    <Card>
                        <CardContent className="p-6 space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold flex items-center gap-2">
                                    <Filter className="h-4 w-4" /> Filters
                                </h3>
                                <Button variant="link" className="text-xs h-auto p-0" onClick={() => setFilters({ search: "", type: [], location: "", experience: "0" })}>
                                    Clear All
                                </Button>
                            </div>

                            <Separator />

                            <div className="space-y-3">
                                <h4 className="text-sm font-medium">Work Mode</h4>
                                <div className="space-y-2">
                                    {['FULL_TIME', 'Part_Time', 'Remote', 'Internship'].map((mode) => (
                                        <div key={mode} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={mode}
                                                checked={filters.type.includes(mode.toUpperCase())}
                                                onCheckedChange={() => toggleTypeFilter(mode.toUpperCase())}
                                            />
                                            <label htmlFor={mode} className="text-sm font-medium leading-none">
                                                {mode.replace('_', ' ')}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-6 rounded-2xl text-center space-y-4 shadow-xl">
                        <GraduationCap className="h-12 w-12 mx-auto opacity-90" />
                        <h3 className="font-bold text-lg">Ace Your Next Interview</h3>
                        <p className="text-sm opacity-80">Practice with our AI interviewers before you apply.</p>
                        <Button variant="secondary" size="sm" className="w-full font-bold" asChild>
                            <Link href="/interviews">Try AI Mock Interview</Link>
                        </Button>
                    </div>
                </div>

                {/* Main Job Feed */}
                <div className="col-span-1 lg:col-span-9 space-y-6">
                    <h1 className="sr-only">Tech Job Opportunities at TechWell</h1>
                    <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-xl border shadow-sm">
                        <h2 className="font-bold text-xl">
                            {filteredJobs.length} Opportunities Found
                        </h2>
                        <div className="flex gap-3">
                            <EmployerRequestDialog />
                            {!user || user.role === 'EMPLOYER' ? (
                                <Link href="/employer/register">
                                    <Button variant="default" size="sm">Post a Job</Button>
                                </Link>
                            ) : null}
                        </div>
                    </div>

                    {isLoading ? (
                        Array(3).fill(0).map((_, i) => (
                            <Card key={i} className="p-6 space-y-4 animate-pulse">
                                <div className="h-6 bg-muted rounded w-1/3"></div>
                                <div className="h-4 bg-muted rounded w-1/4"></div>
                                <div className="h-10 bg-muted rounded"></div>
                            </Card>
                        ))
                    ) : filteredJobs.length === 0 ? (
                        <Card className="p-12 text-center rounded-2xl border-dashed">
                            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                                <Briefcase className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-xl font-bold">No jobs match your search</h3>
                            <p className="text-muted-foreground">Try broadening your filters or search terms.</p>
                        </Card>
                    ) : (
                        <div className="grid gap-4">
                            {filteredJobs.map(job => (
                                <Link href={`/jobs/${job.id}`} key={job.id} className="block group">
                                    <Card className="hover:shadow-xl transition-all duration-300 dark:hover:border-primary/50 relative overflow-hidden rounded-xl">
                                        <div className="absolute top-0 left-0 w-1.5 h-full bg-primary origin-left scale-y-0 group-hover:scale-y-100 transition-transform duration-300" />
                                        <CardContent className="p-6">
                                            <div className="flex gap-5 items-start">
                                                <Avatar className="h-16 w-16 rounded-xl border bg-white p-2 shadow-sm">
                                                    <AvatarImage src={job.employer.employerProfile?.logo || ''} className="object-contain" />
                                                    <AvatarFallback className="rounded-xl bg-gray-50"><Building2 className="h-8 w-8 text-gray-400" /></AvatarFallback>
                                                </Avatar>

                                                <div className="flex-1 space-y-2">
                                                    <h3 className="text-xl font-bold group-hover:text-primary transition-colors line-clamp-1">
                                                        {job.title}
                                                    </h3>
                                                    <p className="text-base font-semibold text-foreground/70">
                                                        {job.employer.employerProfile?.companyName}
                                                    </p>

                                                    <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-sm font-medium text-muted-foreground">
                                                        <div className="flex items-center gap-1.5">
                                                            <Briefcase className="h-4 w-4 text-primary/60" />
                                                            {job.experience || 'Fresher'}
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            <Banknote className="h-4 w-4 text-primary/60" />
                                                            {job.salary || 'Not disclosed'}
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            <MapPin className="h-4 w-4 text-primary/60" />
                                                            {job.location}
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-3 mt-6 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                                        <Clock className="h-3.5 w-3.5" />
                                                        <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                                                        <span className="w-1.5 h-1.5 rounded-full bg-border" />
                                                        <span className="text-primary/80">{job.type.replace('_', ' ')}</span>
                                                    </div>
                                                </div>

                                                <div className="hidden md:block self-center">
                                                    <Button variant="ghost" className="h-12 w-12 rounded-full p-0 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all transform group-hover:translate-x-1">
                                                        <ChevronRight className="h-6 w-6" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
