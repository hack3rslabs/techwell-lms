"use client"

import { useEffect, useState } from "react"
import { consultancyApi } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Mail, Phone, Briefcase } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"

const PIPELINE_STAGES = [
    { id: "AGREEMENT_ACCEPTED", label: "Accepted (New)" },
    { id: "PROCESSING", label: "Processing" },
    { id: "INTERVIEW_SCHEDULED", label: "Interview" },
    { id: "OFFER_RELEASED", label: "Offered" },
    { id: "JOINED", label: "Joined" },
    { id: "COMPLETED", label: "Completed" },
]

export default function ConsultancyProcessing() {
    const [candidates, setCandidates] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    async function fetchCandidates() {
        try {
            const res = await consultancyApi.getInvitations()
            // Filter to only those with agreements and in relevant processing stages
            const processingCandidates = res.data.invitations.filter(
                (i: any) => i.agreement && PIPELINE_STAGES.some(stage => stage.id === i.status)
            )
            setCandidates(processingCandidates)
        } catch (error) {
            console.error("Failed to fetch candidates", error)
        } finally {
            setLoading(false)
        }
    }


    useEffect(() => {
        fetchCandidates()
    }, [])


    const handleStatusChange = async (id: string, newStatus: string) => {
        try {
            await consultancyApi.updateCandidateStatus(id, newStatus)
            toast({ title: "Status Updated", description: "Candidate status has been updated successfully." })
            fetchCandidates()
        } catch (error) {
            toast({ title: "Error", description: "Failed to update status", variant: "destructive" })
        }
    }

    if (loading) {
        return <div className="flex justify-center items-center h-48"><Loader2 className="animate-spin h-8 w-8 text-muted-foreground" /></div>
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Processing Pipeline</h2>
                <p className="text-sm text-muted-foreground">Manage candidates through the placement lifecycle</p>
            </div>
            
            <ScrollArea className="w-full whitespace-nowrap pb-4">
                <div className="flex gap-4 w-max min-h-[60vh] items-start">
                    {PIPELINE_STAGES.map((stage) => {
                        const stageCandidates = candidates.filter(c => c.status === stage.id)
                        
                        return (
                            <div key={stage.id} className="w-[320px] shrink-0 bg-muted/30 rounded-xl p-4 flex flex-col gap-4 border">
                                <div className="flex items-center justify-between font-semibold border-b pb-2">
                                    <span>{stage.label}</span>
                                    <Badge variant="secondary">{stageCandidates.length}</Badge>
                                </div>
                                
                                <div className="flex flex-col gap-3">
                                    {stageCandidates.map(candidate => (
                                        <Card key={candidate.id} className="shadow-sm border-muted hover:border-primary/50 transition-colors">
                                            <CardContent className="p-4 flex flex-col gap-3">
                                                <div>
                                                    <div className="font-semibold">{candidate.agreement.fullName}</div>
                                                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                                        <Briefcase className="h-3 w-3" />
                                                        {candidate.jobRole || candidate.agreement.preferredJobRoles}
                                                    </div>
                                                </div>
                                                
                                                <div className="text-xs space-y-1">
                                                    <div className="flex items-center gap-2"><Mail className="h-3 w-3 text-muted-foreground"/> <span className="truncate">{candidate.email}</span></div>
                                                    <div className="flex items-center gap-2"><Phone className="h-3 w-3 text-muted-foreground"/> <span>{candidate.phone || candidate.agreement.mobileNumber}</span></div>
                                                </div>
                                                
                                                <div className="pt-2 border-t mt-1">
                                                    <Select
                                                        defaultValue={candidate.status}
                                                        onValueChange={(val) => handleStatusChange(candidate.id, val)}
                                                    >
                                                        <SelectTrigger className="h-8 text-xs">
                                                            <SelectValue placeholder="Status" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {PIPELINE_STAGES.map(s => (
                                                                <SelectItem key={s.id} value={s.id} className="text-xs">{s.label}</SelectItem>
                                                            ))}
                                                            <SelectItem value="CLOSED" className="text-xs text-red-600">Closed (Failed/Dropped)</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                    
                                    {stageCandidates.length === 0 && (
                                        <div className="text-center py-6 text-sm text-muted-foreground bg-background/50 rounded-lg border border-dashed">
                                            No candidates
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </ScrollArea>
        </div>
    )
}
