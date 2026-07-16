"use client"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Briefcase, FileText, Linkedin, Video, ArrowRight, Search, CheckCircle2 } from "lucide-react"

export default function CareerHubDashboard() {
    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
                <h1 className="text-3xl font-black tracking-tight">Career Hub</h1>
                <p className="text-blue-100 mt-2 text-lg">AI-powered tools to help you land your dream job.</p>
            </div>

            {/* Primary CTA — Job Board */}
            <div className="bg-gradient-to-br from-slate-900 to-blue-900 rounded-2xl p-7 text-white flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Search className="w-5 h-5 text-blue-300" />
                        <span className="text-blue-300 text-sm font-bold uppercase tracking-widest">Now Live</span>
                    </div>
                    <h2 className="text-2xl font-black">Browse Open Jobs</h2>
                    <p className="text-slate-300 mt-1">Explore verified job openings, apply directly, and track your applications in real time.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                    <Button
                        className="bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-xl px-6 gap-2 shadow-lg shadow-blue-900/50"
                        onClick={() => window.location.href = '/student/jobs'}
                    >
                        <Briefcase className="w-4 h-4" /> Browse Jobs <ArrowRight className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="outline"
                        className="border-white/20 text-white hover:bg-white/10 rounded-xl px-6 gap-2"
                        onClick={() => window.location.href = '/student/jobs/applications'}
                    >
                        <CheckCircle2 className="w-4 h-4" /> My Applications
                    </Button>
                </div>
            </div>

            {/* Tool Cards */}
            <div>
                <h3 className="text-lg font-black text-slate-700 mb-4">AI Career Tools</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">

                    {/* Resume Builder */}
                    <Card className="border-indigo-100 hover:border-indigo-300 hover:shadow-md transition-all">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-indigo-700">
                                <Briefcase className="w-6 h-6" />
                                ATS Resume Builder
                            </CardTitle>
                            <CardDescription>Create a professionally formatted, ATS-compliant resume from scratch.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button className="w-full bg-indigo-600 hover:bg-indigo-700" onClick={() => window.location.href = '/student/resume'}>
                                Open Resume Builder <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </CardContent>
                    </Card>

                    {/* ATS Checker */}
                    <Card className="border-emerald-100 hover:border-emerald-300 hover:shadow-md transition-all">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-emerald-700">
                                <FileText className="w-6 h-6" />
                                AI ATS Checker
                            </CardTitle>
                            <CardDescription>Score your resume against a job description to find missing keywords.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={() => window.location.href = '/student/career-hub/ats-checker'}>
                                Scan My Resume <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </CardContent>
                    </Card>

                    {/* LinkedIn Analyzer */}
                    <Card className="border-[#0a66c2]/20 hover:border-[#0a66c2]/50 hover:shadow-md transition-all">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-[#0a66c2]">
                                <Linkedin className="w-6 h-6" />
                                LinkedIn Profile Analyzer
                            </CardTitle>
                            <CardDescription>Get AI feedback on your LinkedIn headline, summary, and experience.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button className="w-full bg-[#0a66c2] hover:bg-[#004182]" onClick={() => window.location.href = '/student/career-hub/linkedin-analyzer'}>
                                Optimize Profile <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Mock Interview */}
                    <Card className="border-amber-100 hover:border-amber-300 hover:shadow-md transition-all">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-amber-700">
                                <Video className="w-6 h-6" />
                                AI Mock Interview
                            </CardTitle>
                            <CardDescription>Practice technical and HR rounds with our live AI video interviewer.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button className="w-full bg-amber-600 hover:bg-amber-700" onClick={() => window.location.href = '/student/career-hub/mock-interview'}>
                                Start Practice <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </CardContent>
                    </Card>

                </div>
            </div>
        </div>
    )
}
