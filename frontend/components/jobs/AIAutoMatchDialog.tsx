"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2, Sparkles, UserCheck } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import api from "@/lib/api"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function AIAutoMatchDialog({ jobId }: { jobId: string }) {
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [matches, setMatches] = useState<any[]>([])
    const [hasRun, setHasRun] = useState(false)
    const router = useRouter()

    const runAutoMatch = async () => {
        setIsLoading(true)
        try {
            const res = await api.get(`/jobs/${jobId}/ai-matches`)
            setMatches(res.data.matches || [])
            setHasRun(true)
            toast.success("AI Matching Complete!")
        } catch (error) {
            console.error(error)
            toast.error("Failed to run AI Matcher")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md">
                    <Sparkles className="mr-2 h-4 w-4" /> AI Auto-Match
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl text-indigo-700">
                        <Sparkles className="h-6 w-6" /> AI Candidate Matcher
                    </DialogTitle>
                    <DialogDescription>
                        Our AI engine will instantly scan your job requirements against the entire Techwell talent pool to find the best fits.
                    </DialogDescription>
                </DialogHeader>

                {!hasRun && !isLoading && (
                    <div className="flex flex-col items-center justify-center py-10 space-y-4">
                        <div className="p-4 bg-indigo-50 rounded-full">
                            <UserCheck className="h-10 w-10 text-indigo-600" />
                        </div>
                        <p className="text-center text-muted-foreground max-w-sm">
                            Ready to find your next great hire? Let Gemini AI do the heavy lifting.
                        </p>
                        <Button size="lg" onClick={runAutoMatch} className="mt-4 bg-indigo-600 hover:bg-indigo-700">
                            Run Analysis Now
                        </Button>
                    </div>
                )}

                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                        <Loader2 className="h-12 w-12 text-indigo-600 animate-spin" />
                        <p className="text-indigo-800 font-medium">Scanning thousands of profiles...</p>
                        <p className="text-sm text-muted-foreground">Analyzing skills, experience, and ATS scores...</p>
                    </div>
                )}

                {hasRun && !isLoading && (
                    <div className="space-y-4 pt-4">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-semibold text-lg">Top Matches ({matches.length})</h3>
                            <Button variant="outline" size="sm" onClick={runAutoMatch}>Re-Run</Button>
                        </div>
                        
                        {matches.length === 0 ? (
                            <p className="text-center text-muted-foreground py-4">No strong matches found in the current pool.</p>
                        ) : (
                            <div className="space-y-3">
                                {matches.map((match, i) => (
                                    <Card key={i} className="border border-indigo-100 overflow-hidden shadow-sm">
                                        <div className="h-1 w-full bg-indigo-100">
                                            <div 
                                                className={`h-full ${match.matchPercentage >= 90 ? 'bg-green-500' : match.matchPercentage >= 75 ? 'bg-indigo-500' : 'bg-orange-400'}`} 
                                                style={{ width: `${match.matchPercentage}%` }}
                                            />
                                        </div>
                                        <CardContent className="p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h4 className="font-bold text-lg">{match.name}</h4>
                                                    <p className="text-sm text-muted-foreground">{match.email}</p>
                                                </div>
                                                <Badge variant="outline" className={`font-bold text-sm ${match.matchPercentage >= 90 ? 'text-green-700 border-green-200 bg-green-50' : 'text-indigo-700 border-indigo-200 bg-indigo-50'}`}>
                                                    {match.matchPercentage}% Match
                                                </Badge>
                                            </div>
                                            
                                            <div className="bg-slate-50 p-3 rounded-md text-sm text-slate-700 mb-3 border border-slate-100">
                                                <p><span className="font-semibold text-indigo-900">AI Rationale:</span> {match.rationale}</p>
                                            </div>

                                            <div className="flex justify-between items-center mt-2">
                                                <div className="flex flex-wrap gap-1">
                                                    {match.skills.slice(0, 3).map((s: string) => (
                                                        <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                                                    ))}
                                                    {match.skills.length > 3 && <Badge variant="secondary" className="text-xs">+{match.skills.length - 3}</Badge>}
                                                </div>
                                                <Button size="sm" variant="default" onClick={() => router.push(`/employer/dashboard/ats/candidate/${match.candidateId}`)}>
                                                    View Profile
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
