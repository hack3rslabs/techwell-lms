"use client"

import { useEffect, useState } from "react"
import { consultancyApi } from "@/lib/api"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { FileText, Eye, Download, Calendar } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function ConsultancyAgreements() {
    const [agreements, setAgreements] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedAgreement, setSelectedAgreement] = useState<any>(null)

    useEffect(() => {
        fetchAgreements()
    }, [])

    const fetchAgreements = async () => {
        try {
            const res = await consultancyApi.getInvitations()
            // Filter to only those with agreements
            const withAgreements = res.data.invitations
                .filter((i: any) => i.agreement)
                .map((i: any) => i.agreement)
            
            // Sort by acceptedAt descending
            withAgreements.sort((a: any, b: any) => new Date(b.acceptedAt).getTime() - new Date(a.acceptedAt).getTime())
            setAgreements(withAgreements)
        } catch (error) {
            console.error("Failed to fetch agreements", error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return <div className="flex justify-center items-center h-48">Loading agreements...</div>
    }

    return (
        <>
            {/* SCREEN VIEW */}
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Candidate Agreements</h2>
                </div>
                
                <div className="border rounded-md bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Candidate Name</TableHead>
                                <TableHead>Contact Info</TableHead>
                                <TableHead>Qualification</TableHead>
                                <TableHead>Date Accepted</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {agreements.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                        No agreements found.
                                    </TableCell>
                                </TableRow>
                            ) : agreements.map((agreement) => (
                                <TableRow key={agreement.id}>
                                    <TableCell className="font-medium">
                                        {agreement.fullName}
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm">{agreement.emailAddress}</div>
                                        <div className="text-xs text-muted-foreground">{agreement.mobileNumber}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm">{agreement.highestQualification}</div>
                                        <div className="text-xs text-muted-foreground">{agreement.preferredJobRoles}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center text-sm">
                                            <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                                            {new Date(agreement.acceptedAt).toLocaleDateString()}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" size="sm" onClick={() => setSelectedAgreement(agreement)}>
                                                    <Eye className="h-4 w-4 mr-2" /> View Details
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-4xl h-[90vh]">
                                                <DialogHeader className="flex flex-row justify-between items-center pr-8">
                                                    <DialogTitle>Agreement Details - {selectedAgreement?.fullName}</DialogTitle>
                                                    <Button variant="default" onClick={() => {
                                                        window.open(`/print-agreement/${selectedAgreement.id}`, '_blank')
                                                    }}>
                                                        <FileText className="h-4 w-4 mr-2" /> Open Document
                                                    </Button>
                                                </DialogHeader>
                                                <ScrollArea className="h-full pr-4">
                                                    {selectedAgreement && (
                                                        <div className="space-y-6 py-4">
                                                            {/* Detailed Data... */}
                                                            <div>
                                                                <h3 className="font-semibold text-lg mb-2 border-b pb-1">Personal Information</h3>
                                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                                                    <div><span className="text-muted-foreground">Full Name:</span> {selectedAgreement.fullName}</div>
                                                                    <div><span className="text-muted-foreground">Parent's Name:</span> {selectedAgreement.parentsName}</div>
                                                                    <div><span className="text-muted-foreground">DOB:</span> {new Date(selectedAgreement.dob).toLocaleDateString()}</div>
                                                                    <div><span className="text-muted-foreground">Gender:</span> {selectedAgreement.gender}</div>
                                                                    <div><span className="text-muted-foreground">Aadhaar:</span> {selectedAgreement.aadhaarNumber}</div>
                                                                </div>
                                                            </div>

                                                            <div>
                                                                <h3 className="font-semibold text-lg mb-2 border-b pb-1">Contact Information</h3>
                                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                                    <div><span className="text-muted-foreground">Email:</span> {selectedAgreement.emailAddress}</div>
                                                                    <div><span className="text-muted-foreground">Mobile:</span> {selectedAgreement.mobileNumber}</div>
                                                                    <div><span className="text-muted-foreground">Alternate Mobile:</span> {selectedAgreement.alternateMobile || 'N/A'}</div>
                                                                    <div className="col-span-2"><span className="text-muted-foreground">Current Address:</span> {selectedAgreement.currentAddress}, {selectedAgreement.city}, {selectedAgreement.state} - {selectedAgreement.pinCode}</div>
                                                                    <div className="col-span-2"><span className="text-muted-foreground">Permanent Address:</span> {selectedAgreement.permanentAddress}</div>
                                                                </div>
                                                            </div>

                                                            <div>
                                                                <h3 className="font-semibold text-lg mb-2 border-b pb-1">Education & Professional</h3>
                                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                                                    <div><span className="text-muted-foreground">Qualification:</span> {selectedAgreement.highestQualification} ({selectedAgreement.graduationYear})</div>
                                                                    <div><span className="text-muted-foreground">Level:</span> {selectedAgreement.experienceLevel}</div>
                                                                    <div><span className="text-muted-foreground">Company:</span> {selectedAgreement.currentCompany || 'N/A'}</div>
                                                                    <div><span className="text-muted-foreground">Relevant Exp:</span> {selectedAgreement.relevantExperience || 'N/A'}</div>
                                                                    <div><span className="text-muted-foreground">Notice Period:</span> {selectedAgreement.noticePeriod || 'N/A'}</div>
                                                                    <div><span className="text-muted-foreground">Expected CTC:</span> {selectedAgreement.expectedCtc || 'N/A'}</div>
                                                                </div>
                                                            </div>

                                                            <div>
                                                                <h3 className="font-semibold text-lg mb-2 border-b pb-1">Preferences</h3>
                                                                <div className="grid grid-cols-1 gap-2 text-sm">
                                                                    <div><span className="text-muted-foreground">Preferred Locations:</span> {selectedAgreement.preferredLocations}</div>
                                                                    <div><span className="text-muted-foreground">Preferred Job Roles:</span> {selectedAgreement.preferredJobRoles}</div>
                                                                </div>
                                                            </div>

                                                            {/* Terms & Conditions (Screen View) */}
                                                            <div>
                                                                <h3 className="font-semibold text-lg mb-2 border-b pb-1">Accepted Terms & Conditions</h3>
                                                                <div className="bg-slate-50 p-4 rounded-lg text-sm text-slate-700 h-64 overflow-y-auto border space-y-3">
                                                                    <p className="font-bold mb-2 text-slate-900 border-b pb-2">The candidate securely accepted all clauses of the Techwell Consultancy Agreement (Ver 1.0) verbatim:</p>
                                                                    <p><strong>1. Consultancy Services:</strong> I understand that Techwell provides Placement Consultancy, Resume Processing, Resume Forwarding, Career Guidance, Interview Coordination, Employer Communication, and Job Opportunity Assistance. Techwell is not the employer.</p>
                                                                    <p><strong>2. No Employment Guarantee:</strong> I clearly understand and voluntarily accept that Techwell does not guarantee employment, interview selection, offer release, joining, confirmation after joining, or employment continuation. Final employment decisions are made solely by the employer.</p>
                                                                    <p><strong>3. No Salary Guarantee:</strong> I understand that Techwell does not promise or guarantee Salary (CTC), Salary Hike, Designation, Promotions, Incentives, or Bonuses. Salary negotiations are solely between the candidate and the employer.</p>
                                                                    <p><strong>4. No Location Guarantee:</strong> I understand that Techwell cannot guarantee Preferred City, Preferred State, Work From Home, Hybrid Work, or Office Location. Location depends entirely on employer requirements.</p>
                                                                    <p><strong>5. Job Process:</strong> I authorize Techwell to review my profile, improve resume formatting if required, share my resume with suitable employers, contact employers regarding my profile, coordinate interviews, and follow up with employers.</p>
                                                                    <p><strong>6. Candidate Responsibility:</strong> I agree to attend scheduled interviews, respond to employer communication promptly, inform Techwell about interview results, inform Techwell if I receive an offer, inform Techwell after joining, and maintain professional behaviour throughout the recruitment process.</p>
                                                                    <p><strong>7. Consultancy Charges:</strong> I understand that consultancy charges, if applicable, are communicated separately by Techwell. I acknowledge that any agreed consultancy charges are part of the consultancy arrangement and are separate from the employer's salary or compensation.</p>
                                                                    <p><strong>8. Privacy & Data Usage:</strong> I authorize Techwell to store my information, process my personal data, store my resume, share my profile with prospective employers, and maintain records of interviews, offers, and placement activities for consultancy purposes.</p>
                                                                    <p><strong>9. Employer Decisions:</strong> I understand that employers independently shortlist candidates, conduct interviews, and decide salary, designation, work location, joining date, probation, confirmation, and continuation of employment. These decisions are beyond Techwell's control.</p>
                                                                    <p><strong>10. After Joining:</strong> I understand that after joining a company, my employment relationship is directly with that employer. Day-to-day work, salary payments, HR policies, probation, confirmation, transfers, resignations, and employment decisions are handled by the employer. Techwell is not responsible for managing the employment relationship after joining.</p>
                                                                    <p><strong>11. Communication Consent:</strong> I authorize Techwell to communicate with me through Phone Calls, WhatsApp, SMS, and Email for placement consultancy and career-related purposes.</p>
                                                                </div>
                                                            </div>

                                                            {/* Attachments */}
                                                            <div>
                                                                <h3 className="font-semibold text-lg mb-2 border-b pb-1">Attachments & Verification</h3>
                                                                <div className="flex flex-wrap gap-4 mt-2">
                                                                    {selectedAgreement.livePhotoUrl && (
                                                                        <div className="border p-2 rounded-lg bg-white shadow-sm">
                                                                            <p className="text-xs font-semibold mb-2 text-center text-slate-500">Live Photo</p>
                                                                            <img src={selectedAgreement.livePhotoUrl} alt="Live Photo" className="h-32 object-contain" />
                                                                        </div>
                                                                    )}
                                                                    {selectedAgreement.digitalSignatureUrl && (
                                                                        <div className="border p-2 rounded-lg bg-white shadow-sm">
                                                                            <p className="text-xs font-semibold mb-2 text-center text-slate-500">Digital Signature</p>
                                                                            <img src={selectedAgreement.digitalSignatureUrl} alt="Signature" className="h-32 object-contain bg-slate-50" />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="mt-4 text-xs text-muted-foreground bg-muted/50 p-3 rounded">
                                                                    <div><strong>Accepted At:</strong> {new Date(selectedAgreement.acceptedAt).toLocaleString()}</div>
                                                                    <div><strong>Agreement Version:</strong> {selectedAgreement.agreementVersion}</div>
                                                                    {selectedAgreement.locationCoords && <div><strong>Location Coordinates:</strong> {selectedAgreement.locationCoords}</div>}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </ScrollArea>
                                            </DialogContent>
                                        </Dialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>

        </>
    )
}
