"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { 
    Search, MapPin, Briefcase, Filter, Building2, Clock, 
    Banknote, GraduationCap, ChevronRight, Zap, Star, 
    TrendingUp, History, BrainCircuit, Target, CheckCircle2,
    PlayCircle, Sparkles, LayoutGrid, ListFilter
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { ScrollArea } from "@/components/ui/scroll-area"
import api from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import EmployerRequestDialog from "@/components/jobs/EmployerRequestDialog"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

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
    const { user, isAuthenticated } = useAuth()
    const router = useRouter()
    const [jobs, setJobs] = useState<Job[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [resumeData, setResumeData] = useState<any>(null)
    const [recentSearches, setRecentSearches] = useState<string[]>([])
    const [filters, setFilters] = useState({
        search: "",
        type: [] as string[],
        location: "",
        experience: 0,
        salaryRange: [0, 50], // in LPA
        freshness: "all" as "all" | "24h" | "7d" | "30d",
        industry: [] as string[]
    })
    const [showFilters, setShowFilters] = useState(false)

    const fetchResume = async () => {
        try {
            const res = await api.get('/resume')
            if (res.data.exists) {
                setResumeData(res.data.resume)
            }
        } catch (error) {
            console.error("Failed to fetch resume", error)
        }
    }

    const loadRecentSearches = () => {
        const saved = localStorage.getItem('recent_job_searches')
        if (saved) setRecentSearches(JSON.parse(saved))
    }

    const addRecentSearch = (term: string) => {
        if (!term.trim()) return
        const updated = [term, ...recentSearches.filter(t => t !== term)].slice(0, 5)
        setRecentSearches(updated)
        localStorage.setItem('recent_job_searches', JSON.stringify(updated))
    }

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

    useEffect(() => {
        fetchJobs()
        if (isAuthenticated) fetchResume()
        loadRecentSearches()
    }, [isAuthenticated])

    const calculateMatchScore = (job: Job) => {
        if (!resumeData) return 0
        let score = 0
        const skills = resumeData.technicalSkills || []
        const domain = resumeData.domain || ""

        // Skill Match (40%)
        const matchedSkills = skills.filter((s: string) => 
            job.title.toLowerCase().includes(s.toLowerCase()) || 
            job.description.toLowerCase().includes(s.toLowerCase())
        )
        score += (matchedSkills.length / Math.max(skills.length, 1)) * 40

        // Domain Match (30%)
        if (job.title.toLowerCase().includes(domain.toLowerCase())) score += 30

        // Location Match (10%)
        if (resumeData.location && job.location.toLowerCase().includes(resumeData.location.toLowerCase())) score += 10

        // Experience Fit (20%)
        const jobExp = parseInt(job.experience) || 0
        const userExp = 2 // Hardcoded for demo/default, but could come from resume
        if (userExp >= jobExp) score += 20
        else if (userExp >= jobExp - 2) score += 10

        return Math.round(Math.min(score, 100))
    }

    const filteredJobs = jobs.filter(job => {
        const matchesSearch = job.title.toLowerCase().includes(filters.search.toLowerCase()) ||
            job.employer.employerProfile?.companyName.toLowerCase().includes(filters.search.toLowerCase())
        
        const jobTypeNormalized = job.type.toUpperCase().replace(/\s/g, '_');
        const matchesType = filters.type.length === 0 || filters.type.includes(jobTypeNormalized)
        
        const matchesLocation = filters.location === "" || job.location.toLowerCase().includes(filters.location.toLowerCase())
        
        // Improved Salary Matching: If job.salary contains "L" or "LPA", we assume it's in Lakhs.
        // If parsing fails or is 0, we show it (to avoid hiding jobs with non-numeric salary text)
        const rawSalary = job.salary.replace(/[^0-9]/g, '');
        const jobSalaryValue = parseInt(rawSalary) || 0;
        
        let matchesSalary = true;
        if (jobSalaryValue > 0) {
            // If the value is small (e.g. 5, 8, 12), treat as Lakhs. 
            // If it's large (e.g. 500000), treat as raw.
            const normalizedSalary = jobSalaryValue < 100 ? jobSalaryValue * 100000 : jobSalaryValue;
            const minSal = filters.salaryRange[0] * 100000;
            const maxSal = filters.salaryRange[1] * 100000;
            matchesSalary = normalizedSalary >= minSal && (filters.salaryRange[1] === 50 ? true : normalizedSalary <= maxSal);
        }
        
        const jobDate = new Date(job.createdAt)
        const now = new Date()
        let matchesFreshness = true
        if (filters.freshness === "24h") matchesFreshness = (now.getTime() - jobDate.getTime()) <= 24 * 60 * 60 * 1000
        else if (filters.freshness === "7d") matchesFreshness = (now.getTime() - jobDate.getTime()) <= 7 * 24 * 60 * 60 * 1000
        else if (filters.freshness === "30d") matchesFreshness = (now.getTime() - jobDate.getTime()) <= 30 * 24 * 60 * 60 * 1000

        return matchesSearch && matchesType && matchesLocation && matchesSalary && matchesFreshness
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
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 pb-20">
            {/* Header / Global Search */}
            <div className="bg-white dark:bg-slate-900 border-b sticky top-0 z-50 shadow-sm backdrop-blur-md bg-opacity-80">
                <div className="container py-6">
                    <div className="flex flex-col md:flex-row gap-4 max-w-6xl mx-auto items-center">
                        <div className="relative flex-1 group w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                            <Input
                                className="pl-12 h-14 bg-slate-50 border-slate-200 focus:bg-white transition-all text-lg shadow-inner-sm"
                                placeholder="Skills, designations, companies..."
                                value={filters.search}
                                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                                onKeyDown={(e) => e.key === 'Enter' && addRecentSearch(filters.search)}
                            />
                        </div>
                        <div className="relative w-full md:w-1/3 group">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                            <Input
                                className="pl-12 h-14 bg-slate-50 border-slate-200 focus:bg-white transition-all text-lg shadow-inner-sm"
                                placeholder="City or remote"
                                value={filters.location}
                                onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                            />
                        </div>
                        <Button 
                            size="lg" 
                            className="h-14 px-10 text-lg font-bold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 dark:shadow-none transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            Find Jobs
                        </Button>
                        <Button 
                            variant="outline" 
                            size="lg" 
                            className={`h-14 px-6 gap-2 border-slate-200 font-bold transition-all ${showFilters ? 'bg-slate-100 border-blue-200 text-blue-600' : ''}`}
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <Filter className="w-5 h-5" /> 
                            {showFilters ? 'Hide Filters' : 'Filters'}
                        </Button>
                    </div>

                    {recentSearches.length > 0 && (
                        <div className="mt-4 max-w-6xl mx-auto flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1 shrink-0">
                                <History className="w-3 h-3" /> Recent:
                            </span>
                            {recentSearches.map((term, i) => (
                                <Badge 
                                    key={i} 
                                    variant="secondary" 
                                    className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer transition-colors shrink-0"
                                    onClick={() => setFilters(prev => ({ ...prev, search: term }))}
                                >
                                    {term}
                                </Badge>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="container py-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Left Sidebar: Advanced Meta-Filters */}
                    {showFilters && (
                        <aside className="lg:col-span-3 flex flex-col gap-6 sticky top-32 animate-in slide-in-from-left duration-300">
                            <Card className="border-slate-200/60 shadow-xl shadow-slate-200/40 overflow-hidden rounded-2xl">
                                <div className="bg-slate-50 p-4 border-b flex justify-between items-center">
                                    <h3 className="font-black text-slate-900 text-xs uppercase tracking-widest flex items-center gap-2">
                                        <ListFilter className="h-4 w-4 text-blue-600" /> Filter Log
                                    </h3>
                                    <Button variant="ghost" className="text-[10px] h-6 px-2 hover:bg-red-50 hover:text-red-600 font-bold uppercase transition-colors" onClick={() => setFilters({ search: "", type: [], location: "", experience: 0, salaryRange: [0, 50], freshness: "all", industry: [] })}>
                                        Reset
                                    </Button>
                                </div>
                                <CardContent className="p-6 space-y-8">
                                    <div className="space-y-4">
                                        <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-tight">Experience Year</h4>
                                        <div className="px-2">
                                            <Slider 
                                                max={20} 
                                                step={1} 
                                                value={[filters.experience]} 
                                                onValueChange={(val) => setFilters(prev => ({ ...prev, experience: val[0] }))}
                                                className="cursor-pointer"
                                            />
                                            <div className="flex justify-between mt-2 font-black text-[10px] text-slate-500 uppercase tracking-tighter">
                                                <span>Fresher</span>
                                                <span>20+ Yrs</span>
                                            </div>
                                        </div>
                                    </div>

                                    <Separator className="bg-slate-100" />

                                    <div className="space-y-4">
                                        <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-tight">Salary Range (LPA)</h4>
                                        <div className="px-2">
                                            <Slider 
                                                max={100} 
                                                step={5} 
                                                value={filters.salaryRange} 
                                                onValueChange={(val) => setFilters(prev => ({ ...prev, salaryRange: val }))}
                                            />
                                            <div className="flex justify-between mt-2 font-black text-[10px] text-slate-500 tracking-tighter uppercase">
                                                <span>₹{filters.salaryRange[0]}L</span>
                                                <span>₹{filters.salaryRange[1]}L+</span>
                                            </div>
                                        </div>
                                    </div>

                                    <Separator className="bg-slate-100" />

                                    <div className="space-y-4">
                                        <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-tight">Work Design</h4>
                                        <div className="grid grid-cols-1 gap-2">
                                            {['FULL_TIME', 'Part_Time', 'Remote', 'Internship'].map((mode) => (
                                                <div key={mode} className="flex items-center space-x-3 group cursor-pointer" onClick={() => toggleTypeFilter(mode.toUpperCase())}>
                                                    <Checkbox
                                                        id={mode}
                                                        checked={filters.type.includes(mode.toUpperCase())}
                                                        onCheckedChange={() => toggleTypeFilter(mode.toUpperCase())}
                                                        className="border-slate-300"
                                                    />
                                                    <label className="text-[13px] font-bold text-slate-600 group-hover:text-blue-600 cursor-pointer transition-colors">
                                                        {mode.replace('_', ' ')}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <Separator className="bg-slate-100" />

                                
                                </CardContent>
                            </Card>
                        </aside>
                    )}

                    {/* Middle Column: Major Job Feed */}
                    <main className={cn(
                        "col-span-1 space-y-8 transition-all duration-300",
                        showFilters ? "lg:col-span-9" : "lg:col-span-12"
                    )}>
                        {resumeData && (
                            <section className="bg-blue-600/5 border border-blue-100 p-6 rounded-3xl relative overflow-hidden group">
                                <div className="absolute -right-12 -top-12 w-48 h-48 bg-blue-400/10 rounded-full blur-3xl" />
                                <div className="flex items-center gap-4 mb-6 relative">
                                    <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                                        <Zap className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-slate-900 text-lg tracking-tight uppercase">AI Propelled Matches</h3>
                                        <p className="text-[11px] text-blue-600 font-black uppercase tracking-widest">{resumeData.domain} Specializations</p>
                                    </div>
                                    <Badge className="ml-auto bg-blue-600 text-[10px] font-black uppercase">Top Recommendation</Badge>
                                </div>
                                <div className="grid gap-4">
                                    {jobs.sort((a,b) => calculateMatchScore(b) - calculateMatchScore(a)).slice(0, 1).map(job => (
                                        <Link href={`/jobs/${job.id}`} key={job.id} className="block group/rec">
                                            <Card className="border-blue-200/50 hover:border-blue-400 transition-all shadow-lg hover:shadow-blue-100 bg-white/80 backdrop-blur-sm">
                                                <CardContent className="p-5 flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <Avatar className="h-12 w-12 rounded-xl border border-blue-50">
                                                            <AvatarImage src={job.employer.employerProfile?.logo || undefined} />
                                                            <AvatarFallback className="bg-blue-50 text-blue-600 font-black"><Building2 className="w-5 h-5" /></AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <h4 className="font-black text-slate-900 text-md group-hover/rec:text-blue-600 transition-colors">{job.title}</h4>
                                                            <p className="text-xs font-bold text-slate-500">{job.employer.employerProfile?.companyName}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-2xl font-black text-blue-600 tracking-tighter">{calculateMatchScore(job)}%</div>
                                                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Match Score</div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        )}

                        <div className="flex justify-between items-end border-b border-slate-100 pb-4">
                            <div>
                                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Active Opportunities</h1>
                                <p className="text-[13px] font-bold text-slate-400 uppercase tracking-widest mt-1">Found {filteredJobs.length} results logic</p>
                            </div>
                            <div className="flex gap-2">
                                <EmployerRequestDialog />
                                {!user || user.role === 'EMPLOYER' ? (
                                    <Link href="/employer/register">
                                        <Button variant="outline" size="sm" className="font-black h-10 px-6 uppercase tracking-widest text-[10px] border-slate-200">Post Opportunity</Button>
                                    </Link>
                                ) : null}
                            </div>
                        </div>

                        {isLoading ? (
                            Array(5).fill(0).map((_, i) => (
                                <Card key={i} className="p-8 space-y-6 animate-pulse rounded-3xl border-slate-100">
                                    <div className="flex gap-6">
                                        <div className="h-16 w-16 bg-slate-100 rounded-2xl"></div>
                                        <div className="flex-1 space-y-4">
                                            <div className="h-6 bg-slate-100 rounded-lg w-1/3"></div>
                                            <div className="h-4 bg-slate-100 rounded-lg w-1/4"></div>
                                        </div>
                                    </div>
                                    <div className="h-12 bg-slate-50 rounded-xl"></div>
                                </Card>
                            ))
                        ) : filteredJobs.length === 0 ? (
                            <Card className="p-20 text-center rounded-[3rem] border-dashed border-2 bg-white/50 border-slate-200">
                                <div className="mx-auto w-24 h-24 bg-slate-100 rounded-[2rem] flex items-center justify-center mb-6 shadow-inner">
                                    <Search className="h-10 w-10 text-slate-400" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">System Empty</h3>
                                <p className="text-slate-500 font-medium max-w-sm mx-auto mt-2">Adjust your filters or try global keywords for broader reach.</p>
                                <Button variant="outline" className="mt-8 font-black uppercase tracking-widest text-[10px]" onClick={() => setFilters({ ...filters, search: "" })}>Clear Parameters</Button>
                            </Card>
                        ) : (
                            <div className="grid gap-6">
                                {filteredJobs.map(job => {
                                    const matchScore = calculateMatchScore(job)
                                    return (
                                        <Link href={`/jobs/${job.id}`} key={job.id} className="block group">
                                            <Card className="hover:shadow-3xl hover:shadow-slate-200/50 transition-all duration-500 hover:-translate-y-1 relative overflow-hidden rounded-[2.5rem] border-slate-200/60 bg-white group-hover:border-blue-200">
                                                <div className="absolute top-0 right-0 w-2 h-full bg-blue-600 origin-right scale-y-0 group-hover:scale-y-100 transition-transform duration-500" />
                                                <CardContent className="p-8">
                                                    <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                                                        <Avatar className="h-20 w-20 rounded-3xl border bg-slate-50 p-2 shadow-sm shrink-0">
                                                            <AvatarImage src={job.employer.employerProfile?.logo || undefined} className="object-contain" />
                                                            <AvatarFallback className="rounded-3xl bg-slate-100 text-slate-400"><Building2 className="h-10 w-10" /></AvatarFallback>
                                                        </Avatar>

                                                        <div className="flex-1 space-y-4">
                                                            <div className="flex justify-between items-start">
                                                                <div>
                                                                    <h3 className="text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors tracking-tight leading-none mb-2">
                                                                        {job.title}
                                                                    </h3>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-sm font-bold text-slate-500">{job.employer.employerProfile?.companyName}</span>
                                                                        {matchScore > 80 && (
                                                                            <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 text-[9px] font-black uppercase py-0.5 px-1.5 shadow-none">Must Apply</Badge>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="hidden md:flex flex-col items-end">
                                                                    <span className="text-2xl font-black text-slate-900 tracking-tighter uppercase whitespace-nowrap">₹{job.salary || 'N/A'}</span>
                                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Est. Compensation</span>
                                                                </div>
                                                            </div>

                                                            <div className="flex flex-wrap gap-4 pt-2">
                                                                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-100 text-[11px] font-black text-slate-600 uppercase tracking-tighter">
                                                                    <Briefcase className="h-3.5 w-3.5 text-blue-500" />
                                                                    {job.experience || 'Fresher'}
                                                                </div>
                                                                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-100 text-[11px] font-black text-slate-600 uppercase tracking-tighter">
                                                                    <MapPin className="h-3.5 w-3.5 text-blue-500" />
                                                                    {job.location}
                                                                </div>
                                                                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-xl border border-blue-100 text-[11px] font-black text-blue-600 uppercase tracking-tighter">
                                                                    <Zap className="h-3.5 w-3.5" />
                                                                    {job.type.replace('_', ' ')}
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-50">
                                                                <div className="flex flex-wrap gap-2 items-center">
                                                                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                                                                        <Clock className="w-3 h-3" />
                                                                        <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                                                                    </div>
                                                                    {resumeData && resumeData.technicalSkills?.slice(0, 3).map((skill: string) => (
                                                                        job.description.toLowerCase().includes(skill.toLowerCase()) && (
                                                                            <Badge key={skill} variant="outline" className="bg-blue-50 text-blue-600 border-blue-100 text-[8px] font-black uppercase py-0 px-1 shadow-none">
                                                                                Matched: {skill}
                                                                            </Badge>
                                                                        )
                                                                    ))}
                                                                </div>
                                                                
                                                                <div className="flex items-center gap-3">
                                                                    {matchScore > 0 && (
                                                                        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black border border-emerald-100">
                                                                            <CheckCircle2 className="w-3 h-3" />
                                                                            {matchScore}% Profile Sync
                                                                        </div>
                                                                    )}
                                                                    <div className="h-10 w-10 rounded-2xl bg-slate-900 flex items-center justify-center text-white group-hover:bg-blue-600 transition-all duration-300">
                                                                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </Link>
                                    )
                                })}
                            </div>
                        )}
                    </main>

                    {/* Right Column: AI Intelligence & Insights */}
                    <aside className="hidden lg:flex lg:col-span-3 flex-col gap-6 sticky top-32">
                       

                     
                        
                    </aside>
                </div>

            </div>
        </div>
    )
}
