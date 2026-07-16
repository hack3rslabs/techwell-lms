"use client"

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Users, GraduationCap, Percent, Award, Download, Loader2, BarChart2, CheckCircle, RefreshCw } from 'lucide-react'
import api from '@/lib/api'
import { toast } from 'sonner'
import { exportToCSV } from '@/lib/export-utils'

interface CollegeStudent {
    id: string
    name: string
    email: string
    qualification: string
    college: string
    courseProgress: number
    interviewCount: number
    averageScore: number
    status: string
}

export default function CollegeReadinessPage() {
    const [students, setStudents] = React.useState<CollegeStudent[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [selectedCollege, setSelectedCollege] = React.useState('ALL')
    const [colleges, setColleges] = React.useState<string[]>([])

    const fetchData = React.useCallback(async () => {
        setIsLoading(true)
        try {
            // Fetch users with roles student to aggregate stats
            const res = await api.get('/users?role=STUDENT&limit=100')
            const users = res.data.users || res.data || []
            
            // Map users to college stats schema
            const mapped: CollegeStudent[] = users.map((u: any, idx: number) => {
                const totalProgress = u.lessonProgress?.length || 0;
                // Calculate progress and score
                const progressPct = totalProgress > 0 ? Math.min(100, Math.round((totalProgress / 5) * 100)) : 0;
                const avgScore = u.interviews?.length > 0 
                    ? Math.round(u.interviews.reduce((acc: number, item: any) => acc + (item.evaluation?.overallScore || 0), 0) / u.interviews.length)
                    : 0;

                return {
                    id: u.id,
                    name: u.name,
                    email: u.email,
                    qualification: u.qualification || 'Not Specified',
                    college: u.college || 'Not Specified',
                    courseProgress: progressPct,
                    interviewCount: u.interviews?.length || 0,
                    averageScore: avgScore,
                    status: avgScore >= 75 ? 'PLACEMENT_READY' : progressPct > 70 ? 'TRAINING_IN_PROGRESS' : 'SCREENING'
                }
            })

            setStudents(mapped)

            // Extract unique colleges
            const uniqueColleges: string[] = Array.from(new Set(mapped.map((s: CollegeStudent) => s.college).filter(Boolean))) as string[]
            setColleges(uniqueColleges)
        } catch (err) {
            console.error('Failed to load college students database:', err)
            toast.error('Could not load college analytics data')
        } finally {
            setIsLoading(false)
        }
    }, [])

    React.useEffect(() => {
        fetchData()
    }, [fetchData])

    // Filter students
    const filteredStudents = students.filter(s => 
        selectedCollege === 'ALL' || s.college === selectedCollege
    )

    // Calculate aggregated stats
    const totalCount = filteredStudents.length
    const readyCount = filteredStudents.filter(s => s.status === 'PLACEMENT_READY').length
    const avgCompletion = totalCount > 0 
        ? Math.round(filteredStudents.reduce((acc, curr) => acc + curr.courseProgress, 0) / totalCount) 
        : 0
    const avgInterviewScore = totalCount > 0 
        ? Math.round(filteredStudents.reduce((acc, curr) => acc + curr.averageScore, 0) / totalCount)
        : 0

    const handleExport = () => {
        const dataToExport = filteredStudents.map(s => ({
            Name: s.name,
            Email: s.email,
            College: s.college,
            Qualification: s.qualification,
            CourseProgressPct: `${s.courseProgress}%`,
            InterviewsAttempted: s.interviewCount,
            AvgAIInterviewScore: `${s.averageScore}%`,
            PlacementStatus: s.status === 'PLACEMENT_READY' ? 'Placement Ready' : s.status === 'TRAINING_IN_PROGRESS' ? 'Training in Progress' : 'Screening'
        }))
        exportToCSV(dataToExport as unknown as Record<string, unknown>[], {
            filename: `college_placement_readiness_${selectedCollege.replace(/\s+/g, '_')}`
        })
        toast.success('Placement readiness report exported successfully!')
    }

    return (
        <div className="space-y-6 p-6 min-h-screen bg-slate-950 text-slate-50 font-sans">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 to-teal-400 bg-clip-text text-transparent">
                        College Placement & Readiness Dashboard
                    </h1>
                    <p className="text-slate-400 text-sm">
                        Track student progression, view department performance indicators, and filter eligible hiring candidates.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Select value={selectedCollege} onValueChange={setSelectedCollege}>
                        <SelectTrigger className="w-56 bg-slate-900 border-slate-800 text-slate-100 text-xs">
                            <SelectValue placeholder="Select College" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                            <SelectItem value="ALL">All Institutes</SelectItem>
                            {colleges.map((col, idx) => (
                                <SelectItem key={idx} value={col}>
                                    {col}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Button onClick={handleExport} className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs flex items-center gap-2">
                        <Download className="h-4 w-4" /> Export Report
                    </Button>
                    
                    <Button variant="outline" size="icon" onClick={fetchData} className="border-slate-800 bg-slate-900 text-indigo-400 hover:text-indigo-300">
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Aggregated Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-slate-900 border-slate-800/80">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Enrolled Students</CardTitle>
                        <Users className="h-4 w-4 text-indigo-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-slate-100">{isLoading ? <Loader2 className="h-4 w-4 animate-spin text-slate-500" /> : totalCount}</div>
                        <p className="text-[10px] text-slate-500 mt-1">Across registered college drives</p>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800/80">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Placement Readiness Ratio</CardTitle>
                        <Percent className="h-4 w-4 text-teal-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-slate-100">
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin text-slate-500" /> : `${totalCount > 0 ? Math.round((readyCount / totalCount) * 100) : 0}%`}
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">{readyCount} total students cleared benchmarks</p>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800/80">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Avg Course Completion</CardTitle>
                        <GraduationCap className="h-4 w-4 text-emerald-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-slate-100">
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin text-slate-500" /> : `${avgCompletion}%`}
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">Training progression indicator</p>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800/80">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Avg AI Mock Score</CardTitle>
                        <Award className="h-4 w-4 text-amber-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-slate-100">
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin text-slate-500" /> : `${avgInterviewScore}%`}
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">Interview preparedness score</p>
                    </CardContent>
                </Card>
            </div>

            {/* Students List Table */}
            <Card className="bg-slate-900 border-slate-800/80">
                <CardHeader>
                    <CardTitle className="text-lg font-bold text-slate-200">Readiness Tracker Registry</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex h-48 items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                        </div>
                    ) : filteredStudents.length === 0 ? (
                        <div className="text-center py-12 text-slate-500 text-sm">
                            No students found for the selected filter query.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="border-slate-800">
                                    <TableRow className="border-slate-800 hover:bg-transparent">
                                        <TableHead className="text-slate-400">Student Name</TableHead>
                                        <TableHead className="text-slate-400">College / Institute</TableHead>
                                        <TableHead className="text-slate-400 text-center">Course Progress</TableHead>
                                        <TableHead className="text-slate-400 text-center">AI Mock Score</TableHead>
                                        <TableHead className="text-slate-400 text-center">Mocks Taken</TableHead>
                                        <TableHead className="text-slate-400">Readiness Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredStudents.map(student => (
                                        <TableRow key={student.id} className="border-slate-800/60 hover:bg-slate-950/40">
                                            <TableCell className="font-semibold text-slate-200">
                                                <div>{student.name}</div>
                                                <div className="text-[10px] text-slate-500 mt-0.5 font-normal">{student.email}</div>
                                            </TableCell>
                                            <TableCell className="text-slate-300">
                                                <div>{student.college}</div>
                                                <div className="text-[10px] text-slate-500 mt-0.5">{student.qualification}</div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <div className="w-16 bg-slate-950 rounded-full h-1.5 overflow-hidden">
                                                        <div 
                                                            className="bg-emerald-500 h-1.5 rounded-full" 
                                                            style={{ width: `${student.courseProgress}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs text-slate-200">{student.courseProgress}%</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center font-bold text-slate-200">
                                                <span className={student.averageScore >= 75 ? 'text-teal-400' : student.averageScore >= 60 ? 'text-amber-400' : 'text-red-400'}>
                                                    {student.averageScore}%
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-center text-slate-300">
                                                {student.interviewCount}
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={
                                                    student.status === 'PLACEMENT_READY' 
                                                        ? 'bg-teal-500/10 text-teal-300 border-teal-500/20' 
                                                        : student.status === 'TRAINING_IN_PROGRESS' 
                                                        ? 'bg-amber-500/10 text-amber-300 border-amber-500/20' 
                                                        : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'
                                                }>
                                                    {student.status === 'PLACEMENT_READY' 
                                                        ? 'Placement Ready' 
                                                        : student.status === 'TRAINING_IN_PROGRESS' 
                                                        ? 'Training in Progress' 
                                                        : 'Screening'}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
