"use client"

import { useEffect, useState } from "react"
import { consultancyApi } from "@/lib/api"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { FileText, Printer, Plus } from "lucide-react"
import Link from "next/link"

export default function ConsultancyAgreements() {
    const [agreements, setAgreements] = useState<any[]>([])

    async function fetchAgreements() {
        try {
            const res = await consultancyApi.getInvitations()
            // Filter invitations that have an agreement submitted
            const withAgreements = res.data.invitations.filter((i: any) => i.agreement)
            setAgreements(withAgreements)
        } catch (error) {
            console.error("Failed to fetch agreements", error)
        }
    }

    useEffect(() => {
        fetchAgreements()
    }, [])

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-semibold">Candidate Agreements</h2>
                    <p className="text-sm text-muted-foreground mt-1">Legally binding consent forms submitted by candidates.</p>
                </div>
                <Button asChild>
                    <Link href="/admin/consultancy/agreements/new">
                        <Plus className="mr-2 h-4 w-4" /> Generate New Agreement
                    </Link>
                </Button>
            </div>
            
            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Candidate Name</TableHead>
                            <TableHead>Email & Phone</TableHead>
                            <TableHead>Target Role</TableHead>
                            <TableHead>Signed On</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {agreements.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No candidate agreements found.</TableCell>
                            </TableRow>
                        ) : agreements.map((candidate) => (
                            <TableRow key={candidate.id}>
                                <TableCell className="font-medium">
                                    {candidate.agreement.fullName}
                                </TableCell>
                                <TableCell>
                                    <div className="text-sm">{candidate.agreement.emailAddress}</div>
                                    <div className="text-xs text-muted-foreground">{candidate.agreement.mobileNumber}</div>
                                </TableCell>
                                <TableCell>
                                    {candidate.agreement.preferredJobRoles}
                                </TableCell>
                                <TableCell>
                                    {new Date(candidate.agreement.acceptedAt).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="text-right space-x-2">
                                    {candidate.agreement.resumeUrl && (
                                        <Button variant="ghost" size="sm" asChild>
                                            <a href={candidate.agreement.resumeUrl} target="_blank" rel="noreferrer">
                                                <FileText className="h-4 w-4 mr-2" /> Resume
                                            </a>
                                        </Button>
                                    )}
                                    <Button variant="outline" size="sm" asChild>
                                        <Link href={`/admin/consultancy/agreements/${candidate.agreement.id}/print`} target="_blank">
                                            <Printer className="h-4 w-4 mr-2" /> Print PDF
                                        </Link>
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
