"use client"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Briefcase, FileText, Linkedin, Video, ArrowRight } from "lucide-react"

export default function CareerHubDashboard() {
    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Career Hub</h1>
                <p className="text-slate-500 mt-2">Access AI-powered tools to optimize your profile and land your dream job.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                
                {/* Resume Builder (Existing) */}
                <Card className="border-indigo-100 hover:border-indigo-300 transition-colors">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-indigo-700">
                            <Briefcase className="w-6 h-6" />
                            ATS Resume Builder
                        </CardTitle>
                        <CardDescription>Create a professionally formatted, ATS-compliant resume from scratch.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button className="w-full bg-indigo-600 hover:bg-indigo-700" onClick={() => window.location.href='/student/resume'}>
                            Open Resume Builder <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </CardContent>
                </Card>

                {/* ATS Checker (New) */}
                <Card className="border-emerald-100 hover:border-emerald-300 transition-colors">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-emerald-700">
                            <FileText className="w-6 h-6" />
                            AI ATS Checker
                        </CardTitle>
                        <CardDescription>Score your existing resume against a target job description to find missing keywords.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={() => window.location.href='/student/career-hub/ats-checker'}>
                            Scan My Resume <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </CardContent>
                </Card>

                {/* LinkedIn Analyzer (New) */}
                <Card className="border-[#0a66c2]/20 hover:border-[#0a66c2]/50 transition-colors">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-[#0a66c2]">
                            <Linkedin className="w-6 h-6" />
                            LinkedIn Profile Analyzer
                        </CardTitle>
                        <CardDescription>Get AI feedback on your LinkedIn headline, summary, and experience sections.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button className="w-full bg-[#0a66c2] hover:bg-[#004182]" onClick={() => window.location.href='/student/career-hub/linkedin-analyzer'}>
                            Optimize Profile <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </CardContent>
                </Card>

                {/* Mock Interview */}
                <Card className="border-amber-100 hover:border-amber-300 transition-colors">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-amber-700">
                            <Video className="w-6 h-6" />
                            AI Mock Interview
                        </CardTitle>
                        <CardDescription>Practice technical and HR rounds with our live AI video interviewer.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button className="w-full bg-amber-600 hover:bg-amber-700" onClick={() => window.location.href='/student/career-hub/mock-interview'}>
                            Start Practice <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </CardContent>
                </Card>

            </div>
        </div>
    )
}
