"use client"
import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Briefcase, Clock, CheckCircle2, AlertTriangle, FileText } from "lucide-react"

export default function StudentInternshipPortal() {
    const [internship, setInternship] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    // Form state
    const [hoursLogged, setHoursLogged] = useState("")
    const [tasksCompleted, setTasksCompleted] = useState("")
    const [blockers, setBlockers] = useState("")

    useEffect(() => {
        // Fetch internship data
        const fetchInternship = async () => {
            try {
                const res = await fetch('/api/internships/me', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                const data = await res.json();
                if (data.success && data.data) {
                    setInternship(data.data);
                }
            } catch (error) {
                console.error("Failed to fetch internship", error);
            } finally {
                setLoading(false);
            }
        }
        fetchInternship();
    }, [])

    const submitLog = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/internships/logs', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}` 
                },
                body: JSON.stringify({
                    hoursLogged: parseFloat(hoursLogged),
                    tasksCompleted,
                    blockers
                })
            });
            const data = await res.json();
            if (data.success) {
                alert("Daily log submitted successfully!");
                setHoursLogged("");
                setTasksCompleted("");
                setBlockers("");
                window.location.reload();
            } else {
                alert(data.message || "Failed to submit log");
            }
        } catch (error) {
            console.error(error);
            alert("Error submitting log");
        }
    }

    if (loading) return <div className="p-8">Loading Internship Portal...</div>
    if (!internship) return (
        <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
            <Briefcase className="w-16 h-16 text-slate-300 mb-4" />
            <h2 className="text-2xl font-bold mb-2">No Active Internship</h2>
            <p className="text-slate-500 mb-6">You are not currently enrolled in any Techwell internship programs.</p>
            <Button>Explore Internships</Button>
        </div>
    )

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-8">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Internship Dashboard</h1>
                    <p className="text-slate-500">Manage your daily tasks and track your performance.</p>
                </div>
                <Badge className={internship.status === 'ACTIVE' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}>
                    {internship.status}
                </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-indigo-500" />
                            Submit Daily Work Log
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submitLog} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Hours Logged Today</label>
                                    <Input type="number" step="0.5" required value={hoursLogged} onChange={e => setHoursLogged(e.target.value)} placeholder="e.g. 4.5" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Tasks Completed</label>
                                <Textarea required value={tasksCompleted} onChange={e => setTasksCompleted(e.target.value)} placeholder="What did you build or learn today?" rows={3} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Blockers / Need Help? (Optional)</label>
                                <Textarea value={blockers} onChange={e => setBlockers(e.target.value)} placeholder="Any issues blocking your progress?" rows={2} />
                            </div>
                            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">Submit Daily Log</Button>
                        </form>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Program Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm text-slate-500">Program</p>
                                <p className="font-semibold">{internship.program?.title}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Mentor</p>
                                <p className="font-semibold">{internship.mentor?.name || 'Pending Assignment'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Start Date</p>
                                <p className="font-semibold">{internship.startDate ? new Date(internship.startDate).toLocaleDateString() : 'N/A'}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Recent Logs</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {internship.dailyLogs?.length === 0 && <p className="text-sm text-slate-500">No logs submitted yet.</p>}
                                {internship.dailyLogs?.map((log: any) => (
                                    <div key={log.id} className="border-l-2 border-indigo-500 pl-4 py-1">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-xs font-bold text-slate-400">{new Date(log.date).toLocaleDateString()}</span>
                                            <span className="text-xs font-medium bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">{log.hoursLogged} hrs</span>
                                        </div>
                                        <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2">{log.tasksCompleted}</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
