"use client"
import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Loader2, Search, CheckCircle, XCircle, AlertTriangle, FileText, Briefcase } from "lucide-react"

export default function AtsChecker() {
    const [resumeText, setResumeText] = useState("")
    const [jobDescription, setJobDescription] = useState("")
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<any>(null)

    const analyzeResume = async () => {
        if (!resumeText || !jobDescription) {
            alert("Please provide both your resume and the job description.");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/ats-checker/analyze', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ resumeText, jobDescription })
            });
            const data = await res.json();
            if (data.success) {
                setResult(data.data);
            } else {
                alert(data.error || "Failed to analyze resume");
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred during analysis.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">AI ATS Resume Checker</h1>
                <p className="text-slate-500">Paste your resume and target job description to see how well you match.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* LEFT PANEL: Inputs */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="w-5 h-5 text-indigo-500" />
                                Your Resume
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Textarea 
                                placeholder="Paste the full text of your resume here..."
                                className="min-h-[250px] font-mono text-sm"
                                value={resumeText}
                                onChange={e => setResumeText(e.target.value)}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Briefcase className="w-5 h-5 text-indigo-500" />
                                Target Job Description
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Textarea 
                                placeholder="Paste the job description you are applying for..."
                                className="min-h-[250px] font-mono text-sm"
                                value={jobDescription}
                                onChange={e => setJobDescription(e.target.value)}
                            />
                        </CardContent>
                    </Card>

                    <Button 
                        className="w-full h-12 text-lg bg-indigo-600 hover:bg-indigo-700" 
                        onClick={analyzeResume}
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="w-6 h-6 animate-spin mr-2" /> : <Search className="w-5 h-5 mr-2" />}
                        {loading ? "Analyzing..." : "Run ATS Scan"}
                    </Button>
                </div>

                {/* RIGHT PANEL: Results */}
                <div className="space-y-6">
                    {!result && !loading && (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 p-12 border-2 border-dashed rounded-xl">
                            <Search className="w-16 h-16 mb-4 opacity-50" />
                            <p className="text-lg font-medium text-center">Run the ATS scan to see your match score and recommendations.</p>
                        </div>
                    )}

                    {loading && (
                        <div className="h-full flex flex-col items-center justify-center text-indigo-500 p-12 border-2 border-dashed border-indigo-200 rounded-xl bg-indigo-50/50">
                            <Loader2 className="w-16 h-16 mb-4 animate-spin" />
                            <p className="text-lg font-medium text-center text-indigo-700">Gemini AI is analyzing your resume...</p>
                        </div>
                    )}

                    {result && !loading && (
                        <>
                            <Card className={result.score >= 80 ? "border-emerald-500 shadow-sm" : result.score >= 50 ? "border-amber-500 shadow-sm" : "border-rose-500 shadow-sm"}>
                                <CardContent className="pt-6 flex items-center justify-between">
                                    <div>
                                        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">ATS Match Score</h3>
                                        <div className="text-5xl font-black mt-1">
                                            {result.score}<span className="text-2xl text-slate-400">%</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        {result.score >= 80 ? (
                                            <Badge className="bg-emerald-100 text-emerald-800 text-lg py-1 px-4">Highly Matched</Badge>
                                        ) : result.score >= 50 ? (
                                            <Badge className="bg-amber-100 text-amber-800 text-lg py-1 px-4">Needs Improvement</Badge>
                                        ) : (
                                            <Badge className="bg-rose-100 text-rose-800 text-lg py-1 px-4">Poor Match</Badge>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                                        Missing Keywords (Add these!)
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2">
                                        {result.missingKeywords?.length > 0 ? result.missingKeywords.map((kw: string, i: number) => (
                                            <Badge key={i} variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">{kw}</Badge>
                                        )) : <p className="text-sm text-slate-500">Great job! You have all the key terms.</p>}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                                        Matching Keywords
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2">
                                        {result.matchingKeywords?.length > 0 ? result.matchingKeywords.map((kw: string, i: number) => (
                                            <Badge key={i} variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">{kw}</Badge>
                                        )) : <p className="text-sm text-slate-500">No matching keywords found.</p>}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">AI Recommendations</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-3">
                                        {result.recommendations?.map((rec: string, i: number) => (
                                            <li key={i} className="flex gap-3 text-sm">
                                                <span className="text-indigo-500 mt-0.5">•</span>
                                                <span className="text-slate-700">{rec}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
