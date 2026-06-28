"use client"

import { useEffect, useState } from "react"
import { consultancyApi } from "@/lib/api"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { FileText, RotateCcw } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export default function ConsultancyClosed() {
    const [candidates, setCandidates] = useState<any[]>([])

    useEffect(() => {
        fetchCandidates()
    }, [])

    const fetchCandidates = async () => {
        try {
            const res = await consultancyApi.getInvitations()
            const closedCandidates = res.data.invitations.filter((i: any) => i.agreement && i.status === "CLOSED")
            setCandidates(closedCandidates)
        } catch (error) {
            console.error("Failed to fetch candidates", error)
        }
    }

    const handleRestore = async (id: string) => {
        try {
            await consultancyApi.updateCandidateStatus(id, "PROCESSING")
            toast({ title: "Profile Restored", description: "Candidate has been moved back to the Processing pipeline." })
            fetchCandidates()
        } catch (error) {
            toast({ title: "Error", description: "Failed to restore profile", variant: "destructive" })
        }
    }

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold">Closed Profiles</h2>
            <p className="text-sm text-muted-foreground -mt-4">Candidates who have been dropped, failed interviews, or otherwise closed.</p>
            
            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Role/Experience</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Resume</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {candidates.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No closed profiles found.</TableCell>
                            </TableRow>
                        ) : candidates.map((candidate) => (
                            <TableRow key={candidate.id}>
                                <TableCell className="font-medium">
                                    {candidate.agreement?.fullName || candidate.name}
                                </TableCell>
                                <TableCell>
                                    <div className="text-sm">{candidate.agreement?.emailAddress || candidate.email}</div>
                                    <div className="text-xs text-muted-foreground">{candidate.agreement?.mobileNumber || candidate.phone}</div>
                                </TableCell>
                                <TableCell>
                                    <div className="text-sm">{candidate.jobRole || candidate.agreement?.preferredJobRoles}</div>
                                    <div className="text-xs text-muted-foreground">{candidate.agreement?.experienceLevel}</div>
                                </TableCell>
                                <TableCell>
                                    <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                                        Closed
                                    </span>
                                </TableCell>
                                <TableCell>
                                    {candidate.agreement?.resumeUrl && (
                                        <Button variant="ghost" size="sm" asChild>
                                            <a href={candidate.agreement.resumeUrl} target="_blank" rel="noreferrer">
                                                <FileText className="h-4 w-4 mr-2" /> View
                                            </a>
                                        </Button>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="outline" size="sm" onClick={() => handleRestore(candidate.id)}>
                                        <RotateCcw className="h-4 w-4 mr-2" /> Restore
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
