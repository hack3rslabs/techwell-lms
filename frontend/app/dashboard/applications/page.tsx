"use client"

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import {
    Loader2,
    Briefcase,
    MapPin,
    Clock,
    Building2,
    ExternalLink,
    ArrowLeft,
    FileText,
    Search
} from 'lucide-react'

interface Application {
    id: string
    status: string
    createdAt: string
    job: {
        id: string
        title: string
        location: string
        type: string
        employer: {
            employerProfile: {
                companyName: string
                logo: string | null
            }
        }
    }
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
    APPLIED: { label: 'Applied', className: 'bg-blue-50 text-blue-700 border-blue-200' },
    UNDER_REVIEW: { label: 'Under Review', className: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
    SHORTLISTED: { label: 'Shortlisted', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    INTERVIEW: { label: 'Interview', className: 'bg-purple-50 text-purple-700 border-purple-200' },
    OFFERED: { label: 'Offered', className: 'bg-green-50 text-green-700 border-green-200' },
    HIRED: { label: 'Hired', className: 'bg-green-50 text-green-800 border-green-300' },
    REJECTED: { label: 'Rejected', className: 'bg-red-50 text-red-700 border-red-200' },
    WITHDRAWN: { label: 'Withdrawn', className: 'bg-gray-50 text-gray-600 border-gray-200' },
}

export default function MyApplicationsPage() {
    const router = useRouter()
    const { user, isLoading: authLoading } = useAuth()
    const [applications, setApplications] = React.useState<Application[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [filter, setFilter] = React.useState('ALL')
    const [searchQuery, setSearchQuery] = React.useState('')

    React.useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login')
        }
    }, [authLoading, user, router])

    React.useEffect(() => {
        const fetchApplications = async () => {
            try {
                const res = await api.get('/jobs/applications/me')
                setApplications(res.data || [])
            } catch (error) {
                console.error("Failed to fetch applications", error)
            } finally {
                setIsLoading(false)
            }
        }
        if (user) {
            fetchApplications()
        }
    }, [user])

    const filteredApps = applications
        .filter(app => filter === 'ALL' || app.status === filter)
        .filter(app => {
            if (!searchQuery.trim()) return true
            const query = searchQuery.toLowerCase()
            return (
                app.job.title.toLowerCase().includes(query) ||
                app.job.employer?.employerProfile?.companyName?.toLowerCase().includes(query) ||
                app.job.location?.toLowerCase().includes(query)
            )
        })

    const getStatusBadge = (status: string) => {
        const s = STATUS_CONFIG[status] || { label: status, className: 'bg-gray-50 text-gray-700 border-gray-200' }
        return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${s.className}`}>{s.label}</span>
    }

    if (authLoading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="container max-w-4xl py-8">
                {/* Header */}
                <div className="mb-8">
                    <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')} className="mb-4">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
                    </Button>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">My Applications</h1>
                            <p className="text-muted-foreground mt-1">{applications.length} total application{applications.length !== 1 ? 's' : ''}</p>
                        </div>
                        <Button onClick={() => router.push('/jobs')}>
                            <Briefcase className="mr-2 h-4 w-4" /> Find Jobs
                        </Button>
                    </div>
                </div>

                {/* Search + Filter Bar */}
                {applications.length > 0 && (
                    <div className="space-y-4 mb-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search by job title, company, or location..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground placeholder:text-muted-foreground"
                            />
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-1">
                            {['ALL', ...Object.keys(STATUS_CONFIG)].map((status) => {
                                const count = status === 'ALL' ? applications.length : applications.filter(a => a.status === status).length
                                if (count === 0 && status !== 'ALL') return null
                                return (
                                    <button
                                        key={status}
                                        onClick={() => setFilter(status)}
                                        className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap border ${filter === status
                                            ? 'bg-primary text-white border-primary'
                                            : 'bg-background text-muted-foreground border-border hover:bg-muted/50'
                                            }`}
                                    >
                                        {status === 'ALL' ? 'All' : STATUS_CONFIG[status]?.label || status} ({count})
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* Applications List */}
                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredApps.map((app) => (
                            <div key={app.id} className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-all duration-200">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <Building2 className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-foreground text-lg">{app.job.title}</h3>
                                            <p className="text-sm text-muted-foreground">
                                                {app.job.employer?.employerProfile?.companyName || 'Company'}
                                            </p>
                                            <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                                                {app.job.location && (
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="h-3 w-3" /> {app.job.location}
                                                    </span>
                                                )}
                                                <span className="flex items-center gap-1">
                                                    <Briefcase className="h-3 w-3" /> {app.job.type}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" /> Applied {new Date(app.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 md:flex-shrink-0">
                                        {getStatusBadge(app.status)}
                                        <Button variant="ghost" size="sm" onClick={() => router.push(`/jobs/${app.job.id}`)}>
                                            <ExternalLink className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {applications.length === 0 && (
                            <div className="text-center py-20 bg-card border border-border rounded-2xl">
                                <Briefcase className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                                <h3 className="text-xl font-medium mb-2 text-foreground">No Applications Yet</h3>
                                <p className="text-muted-foreground mb-6 max-w-sm mx-auto">Start applying to jobs and track your applications here.</p>
                                <Button size="lg" onClick={() => router.push('/jobs')}>
                                    <Briefcase className="mr-2 h-4 w-4" /> Browse Jobs
                                </Button>
                            </div>
                        )}

                        {applications.length > 0 && filteredApps.length === 0 && (
                            <div className="text-center py-12 bg-card border border-border rounded-2xl">
                                <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                                <p className="text-muted-foreground">No applications match your search or filter.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
