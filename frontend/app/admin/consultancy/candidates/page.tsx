"use client"

import { useEffect, useState } from "react"
import { consultancyApi } from "@/lib/api"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ExternalLink, FileText, Download } from "lucide-react"

export default function ConsultancyCandidates() {
    const [candidates, setCandidates] = useState<any[]>([])

    async function fetchCandidates() {
        try {
            // Reusing getInvitations but filtering or handling in UI for now
            // since candidates are essentially invitations that have agreements.
            const res = await consultancyApi.getInvitations()
            const withAgreements = res.data.invitations.filter((i: any) => i.agreement)
            setCandidates(withAgreements)
        } catch (error) {
            console.error("Failed to fetch candidates", error)
        }
    }

    useEffect(() => {
        fetchCandidates()
    }, [])

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold">Registered Candidates</h2>
            
            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Experience</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Resume</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {candidates.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No candidates have accepted agreements yet.</TableCell>
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
                                    {candidate.agreement?.experienceLevel}
                                </TableCell>
                                <TableCell>
                                    <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                                        {candidate.status.replace('_', ' ')}
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
                                    <Button variant="outline" size="sm">
                                        Update Status
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
