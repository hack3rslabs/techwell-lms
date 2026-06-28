"use client"

import { useEffect, useState } from "react"
import { consultancyApi } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
    Users, 
    Send, 
    Clock, 
    CheckCircle, 
    Briefcase, 
    Video, 
    Award, 
    CheckSquare,
    Loader2
} from "lucide-react"

import Link from "next/link"

export default function ConsultancyDashboard() {
    const [stats, setStats] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await consultancyApi.getDashboardStats()
                setStats(res.data.stats)
            } catch (error) {
                console.error("Failed to fetch consultancy stats:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchStats()
    }, [])

    if (loading) {
        return <div className="flex h-[400px] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
    }

    const { counts, total } = stats

    const kpiCards = [
        { label: "Total Invitations", value: total, icon: Users, color: "text-blue-500" },
        { label: "Invitation Sent", value: counts.INVITED, icon: Send, color: "text-gray-500" },
        { label: "Pending Acceptance", value: counts.PENDING_ACCEPTANCE, icon: Clock, color: "text-orange-500" },
        { label: "Agreement Accepted", value: counts.AGREEMENT_ACCEPTED, icon: CheckSquare, color: "text-green-500" },
        { label: "Processing", value: counts.PROCESSING, icon: Briefcase, color: "text-purple-500" },
        { label: "Interview Scheduled", value: counts.INTERVIEW_SCHEDULED, icon: Video, color: "text-indigo-500" },
        { label: "Offer Released", value: counts.OFFER_RELEASED, icon: Award, color: "text-pink-500" },
        { label: "Joined", value: counts.JOINED, icon: CheckCircle, color: "text-teal-500" },
        { label: "Completed", value: counts.COMPLETED, icon: CheckCircle, color: "text-emerald-500" },
        { label: "Closed Cases", value: counts.CLOSED, icon: Users, color: "text-red-500" },
    ]

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-primary/5 p-6 rounded-xl border border-primary/10">
                <div>
                    <h2 className="text-2xl font-bold text-primary">Consultancy Dashboard</h2>
                    <p className="text-muted-foreground mt-1">Track candidate progress, agreements, and placements.</p>
                </div>
                <Link href="/admin/consultancy/invitations">
                    <button className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-lg font-semibold shadow-lg shadow-primary/25 transition-transform hover:scale-105 active:scale-95">
                        <Send className="h-5 w-5" />
                        Generate New Invitation
                    </button>
                </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {kpiCards.map((card, idx) => (
                    <Card key={idx}>
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
                                <p className="text-3xl font-bold mt-2">{card.value}</p>
                            </div>
                            <div className={`p-3 rounded-full bg-muted/50 ${card.color}`}>
                                <card.icon className="h-6 w-6" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                 {/* Placeholders for Recent Invitations / Recent Accepted which would be fetched separately */}
                 <Card>
                     <CardHeader>
                         <CardTitle>Recent Invitations</CardTitle>
                     </CardHeader>
                     <CardContent>
                         <p className="text-sm text-muted-foreground">List of last 10 invitations will appear here.</p>
                     </CardContent>
                 </Card>
                 <Card>
                     <CardHeader>
                         <CardTitle>Recently Accepted Candidates</CardTitle>
                     </CardHeader>
                     <CardContent>
                         <p className="text-sm text-muted-foreground">Latest accepted agreements will appear here.</p>
                     </CardContent>
                 </Card>
            </div>
        </div>
    )
}
