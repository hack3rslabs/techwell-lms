"use client"
import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Loader2, Search, Linkedin, Target, CheckCircle2, TrendingUp } from "lucide-react"

export default function LinkedinAnalyzer() {
    const [profileText, setProfileText] = useState("")
    const [targetRole, setTargetRole] = useState("")
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<any>(null)

    const analyzeProfile = async () => {
        if (!profileText || !targetRole) {
            alert("Please provide both your LinkedIn profile text and target role.");
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/career-hub/linkedin-analyze`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ profileText, targetRole })
            });
            const data = await res.json();
            if (data.success) {
                setResult(data.data);
            } else {
                alert(data.error || "Failed to analyze profile");
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
                <h1 className="text-3xl font-bold tracking-tight text-[#0a66c2] flex items-center gap-3">
                    <Linkedin className="w-8 h-8" />
                    LinkedIn Profile Optimizer
                </h1>
                <p className="text-slate-500 mt-2">Get AI-driven feedback to make your LinkedIn profile stand out to recruiters.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* LEFT PANEL: Inputs */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Target className="w-5 h-5 text-indigo-500" />
                                Target Role
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Input 
                                placeholder="e.g. Full Stack Developer, Data Scientist..."
                                value={targetRole}
                                onChange={e => setTargetRole(e.target.value)}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-[#0a66c2]">
                                <Linkedin className="w-5 h-5" />
                                Your LinkedIn Content
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-slate-500 mb-2">Tip: Go to your LinkedIn profile, select your 'About' and 'Experience' sections, copy them, and paste them below.</p>
                            <Textarea 
                                placeholder="Paste your LinkedIn text here..."
                                className="min-h-[300px] text-sm"
                                value={profileText}
                                onChange={e => setProfileText(e.target.value)}
                            />
                        </CardContent>
                    </Card>

                    <Button 
                        className="w-full h-12 text-lg bg-[#0a66c2] hover:bg-[#004182]" 
                        onClick={analyzeProfile}
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="w-6 h-6 animate-spin mr-2" /> : <Search className="w-5 h-5 mr-2" />}
                        {loading ? "Analyzing Profile..." : "Analyze My Profile"}
                    </Button>
                </div>

                {/* RIGHT PANEL: Results */}
                <div className="space-y-6">
                    {!result && !loading && (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 p-12 border-2 border-dashed rounded-xl">
                            <Linkedin className="w-16 h-16 mb-4 opacity-50" />
                            <p className="text-lg font-medium text-center">Run the analysis to get your personalized LinkedIn strategy.</p>
                        </div>
                    )}

                    {loading && (
                        <div className="h-full flex flex-col items-center justify-center text-[#0a66c2] p-12 border-2 border-dashed border-[#0a66c2]/30 rounded-xl bg-[#0a66c2]/5">
                            <Loader2 className="w-16 h-16 mb-4 animate-spin" />
                            <p className="text-lg font-medium text-center">Gemini AI is reviewing your profile...</p>
                        </div>
                    )}

                    {result && !loading && (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <Card className="bg-slate-50 border-slate-200 shadow-sm">
                                    <CardContent className="pt-6 text-center">
                                        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Headline Score</h3>
                                        <div className="text-4xl font-black mt-2 text-[#0a66c2]">{result.headlineScore}/100</div>
                                    </CardContent>
                                </Card>
                                <Card className="bg-slate-50 border-slate-200 shadow-sm">
                                    <CardContent className="pt-6 text-center">
                                        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Summary Score</h3>
                                        <div className="text-4xl font-black mt-2 text-[#0a66c2]">{result.summaryScore}/100</div>
                                    </CardContent>
                                </Card>
                            </div>

                            <Card className="border-[#0a66c2]/30 shadow-md">
                                <CardHeader className="bg-[#0a66c2]/5 pb-4">
                                    <CardTitle className="text-lg flex items-center gap-2 text-[#0a66c2]">
                                        <TrendingUp className="w-5 h-5" />
                                        Suggested Optimized Headline
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-4">
                                    <p className="text-lg font-medium text-slate-800 italic">"{result.suggestedHeadline}"</p>
                                    <p className="text-xs text-slate-500 mt-2">Update your LinkedIn headline to this to drastically improve search visibility for recruiters looking for a {targetRole}.</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                        Actionable Suggestions
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-4">
                                        {result.suggestions?.map((rec: string, i: number) => (
                                            <li key={i} className="flex gap-3 text-sm bg-slate-50 p-3 rounded-lg border border-slate-100">
                                                <span className="text-[#0a66c2] mt-0.5">•</span>
                                                <span className="text-slate-700 leading-relaxed">{rec}</span>
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
