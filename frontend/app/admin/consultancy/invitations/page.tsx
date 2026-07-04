"use client"

import { useEffect, useState } from "react"
import { consultancyApi, studentsApi } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Link2, Copy, Check } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"
import { Sparkles, Loader2 } from "lucide-react"

const defaultTerms = `# CONSULTANCY TERMS & CONDITIONS

## Candidate Declaration
I voluntarily request Techwell to provide placement consultancy and career assistance services.
I confirm that all information, documents, certificates, resume details, work experience, salary information, and personal details submitted by me are true, complete, and accurate.
I understand that providing false, misleading, or forged information may result in cancellation of my consultancy process without prior notice.

## Service Scope
I understand that Techwell provides placement consultancy, profile processing, resume forwarding, interview coordination, career guidance, and communication with potential employers.
I understand that Techwell is a placement consultancy and is **not the employer**.
The final hiring decision is made solely by the hiring company.

## Job & Placement Understanding
I understand and voluntarily accept that:
* Techwell cannot guarantee a job.
* Techwell cannot guarantee interview selection.
* Techwell cannot guarantee employment with any specific company.
* Techwell cannot guarantee any specific designation.
* Techwell cannot guarantee any minimum or maximum salary (CTC).
* Techwell cannot guarantee a preferred work location.
* Techwell cannot guarantee a joining date.
* Techwell cannot guarantee that an employer will release an offer letter.
* Techwell cannot guarantee that an offer, once issued by an employer, will remain valid, as employers control their own hiring processes.

## Candidate Responsibilities
I agree to:
* Attend interviews on time.
* Respond to calls, emails, and messages from Techwell and prospective employers.
* Provide correct information during interviews.
* Inform Techwell if I receive an offer or join a company.
* Inform Techwell if I decide to withdraw from the recruitment process.
* Maintain professional conduct throughout the recruitment process.

## Resume & Profile Authorization
I authorize Techwell to:
* Review my resume.
* Modify resume formatting for presentation purposes (without changing factual information).
* Share my resume and profile with prospective employers for suitable job opportunities.
* Contact employers on my behalf regarding employment opportunities.

## Consultancy Charges (Non-Refundable Policy)
I understand that Techwell invests significant resources upfront (training, mock interviews, resume building, HR and trainer time). 
Therefore, ALL consultancy fees, training fees, and registration amounts paid to Techwell are STRICTLY 100% NON-REFUNDABLE, including in cases of middle drop-outs or resignation.
If management approves a refund under highly exceptional circumstances, deductions (18% GST, 2% Admin, 2% Gateway, and consumed HR hours) will apply.

## Employer Decisions & Post-Joining
I understand that employers independently shortlist candidates, conduct interviews, and decide terms. These decisions are outside Techwell's control.
I understand that once I join an employer, my employment relationship is directly with that employer. Techwell is not responsible for workplace politics, performance, or termination.

## Data & Communication Consent
I authorize Techwell to store and process my personal data for consultancy purposes and to contact me via Phone, WhatsApp, SMS, and Email.

## Candidate Confirmation
By signing below and completing this submission, I confirm that:
- I have carefully read and fully understand the complete Consultancy Agreement.
- I understand no guarantees are made regarding jobs, CTC, or location.
- I confirm all information submitted is true.
- I voluntarily accept these legally binding Terms & Conditions.`;

export default function ConsultancyInvitations() {
    const [invitations, setInvitations] = useState<any[]>([])
    const [students, setStudents] = useState<any[]>([])
    const [selectedStudent, setSelectedStudent] = useState<string>("manual")
    const [isOpen, setIsOpen] = useState(false)
    const [viewOpen, setViewOpen] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [viewData, setViewData] = useState<any>(null)
    const [formData, setFormData] = useState({ 
        name: "", email: "", phone: "", customTerms: defaultTerms, jobRole: "", feePercentage: "",
        prefilledData: {
            highestQualification: "", experienceLevel: "Fresher", currentCompany: "", 
            expectedCtc: "", noticePeriod: "", preferredLocations: ""
        }
    })
    const [activeTab, setActiveTab] = useState<'basic' | 'prefill' | 'terms'>('basic')
    const [submitting, setSubmitting] = useState(false)
    const [copiedId, setCopiedId] = useState<string | null>(null)
    
    // Auto Match State
    const [matchOpen, setMatchOpen] = useState(false)
    const [matchingId, setMatchingId] = useState<string | null>(null)
    const [isMatching, setIsMatching] = useState(false)
    const [matches, setMatches] = useState<any[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [showDropdown, setShowDropdown] = useState(false)

    useEffect(() => {
        fetchInvitations()
        fetchStudents()
    }, [])

    const fetchStudents = async () => {
        try {
            const res = await studentsApi.getAll()
            setStudents(res.data.students || [])
        } catch (error) {
            console.error("Failed to fetch students", error)
        }
    }

    const fetchInvitations = async () => {
        try {
            const res = await consultancyApi.getInvitations()
            setInvitations(res.data.invitations)
        } catch (error) {
            console.error("Failed to fetch invitations", error)
        }
    }

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        try {
            if (editingId) {
                await consultancyApi.updateInvitation(editingId, formData)
                toast.success("Invitation updated successfully!")
            } else {
                await consultancyApi.createInvitation(formData)
                toast.success("Invitation generated successfully!")
            }
            setIsOpen(false)
            setFormData({ 
                name: "", email: "", phone: "", customTerms: defaultTerms, jobRole: "", feePercentage: "",
                prefilledData: {
                    highestQualification: "", experienceLevel: "Fresher", currentCompany: "", 
                    expectedCtc: "", noticePeriod: "", preferredLocations: ""
                }
            })
            setEditingId(null)
            setSelectedStudent("manual")
            fetchInvitations()
        } catch (error) {
            toast.error(editingId ? "Failed to update invitation" : "Failed to create invitation")
        } finally {
            setSubmitting(false)
        }
    }

    const openEdit = (inv: any) => {
        if (inv.status !== 'INVITED') {
            toast.error("Cannot edit accepted invitations")
            return
        }
        setFormData({
            name: inv.name,
            email: inv.email,
            phone: inv.phone || "",
            customTerms: inv.customTerms || defaultTerms,
            jobRole: inv.jobRole || "",
            feePercentage: inv.feePercentage || "",
            prefilledData: inv.prefilledData || {
                highestQualification: "", experienceLevel: "Fresher", currentCompany: "", 
                expectedCtc: "", noticePeriod: "", preferredLocations: ""
            }
        })
        setEditingId(inv.id)
        setActiveTab('basic')
        setIsOpen(true)
    }

    const openView = (inv: any) => {
        setViewData(inv)
        setViewOpen(true)
    }

    const handleCopy = (token: string) => {
        const link = `${window.location.origin}/consultancy/invite/${token}`
        navigator.clipboard.writeText(link)
        setCopiedId(token)
        toast.success("Link copied to clipboard!")
        setTimeout(() => setCopiedId(null), 2000)
    }

    const handleAutoMatch = async (invitationId: string) => {
        setMatchingId(invitationId)
        setMatchOpen(true)
        setIsMatching(true)
        setMatches([])
        try {
            const res = await fetch(`/api/consultancy/invitations/${invitationId}/auto-match`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' }
            })
            const data = await res.json()
            setMatches(data.matches || [])
        } catch (error) {
            toast.error("Failed to auto-match jobs")
        } finally {
            setIsMatching(false)
        }
    }

    const handleStudentSelect = (studentId: string) => {
        setSelectedStudent(studentId)
        if (studentId === "manual") {
            setFormData({ ...formData, name: "", email: "", phone: "" })
            return
        }
        const student = students.find(s => s.id === studentId)
        if (student) {
            setFormData({
                ...formData,
                name: student.name,
                email: student.email,
                phone: student.phone || ""
            })
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Candidate Invitations</h2>
                <Dialog open={isOpen} onOpenChange={(val) => { setIsOpen(val); if (!val) { setEditingId(null); setFormData({ name: "", email: "", phone: "", customTerms: defaultTerms, jobRole: "", feePercentage: "", prefilledData: { highestQualification: "", experienceLevel: "Fresher", currentCompany: "", expectedCtc: "", noticePeriod: "", preferredLocations: "" } }); setActiveTab('basic'); }}}>
                    <DialogTrigger asChild>
                        <Button onClick={() => { setEditingId(null); setFormData({ name: "", email: "", phone: "", customTerms: defaultTerms, jobRole: "", feePercentage: "", prefilledData: { highestQualification: "", experienceLevel: "Fresher", currentCompany: "", expectedCtc: "", noticePeriod: "", preferredLocations: "" } }); setActiveTab('basic'); }}><Plus className="mr-2 h-4 w-4" /> Generate Invite</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editingId ? "Edit Invitation" : "Generate Private Invitation"}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreate} className="space-y-4 pt-4">
                            
                            <div className="flex border-b mb-4">
                                <button type="button" onClick={() => setActiveTab('basic')} className={`px-4 py-2 text-sm font-medium border-b-2 ${activeTab === 'basic' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>Basic Info</button>
                                <button type="button" onClick={() => setActiveTab('prefill')} className={`px-4 py-2 text-sm font-medium border-b-2 ${activeTab === 'prefill' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>Advanced Pre-fill</button>
                                <button type="button" onClick={() => setActiveTab('terms')} className={`px-4 py-2 text-sm font-medium border-b-2 ${activeTab === 'terms' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>Terms Template</button>
                            </div>

                            {activeTab === 'basic' && (
                                <div className="space-y-4">
                                    <div className="mb-4">
                                        <label className="text-sm font-medium text-primary">Fetch Registered Candidate (Optional)</label>
                                        <div className="relative mt-1">
                                            <Input 
                                                placeholder="Search by Name or Mobile..." 
                                                value={searchTerm}
                                                onFocus={() => setShowDropdown(true)}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                                            />
                                            {showDropdown && (
                                                <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto text-sm">
                                                    <div 
                                                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-muted-foreground"
                                                        onClick={() => { handleStudentSelect("manual"); setSearchTerm(""); }}
                                                    >
                                                        -- Enter Manually --
                                                    </div>
                                                    {students.filter(s => 
                                                        s.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                                        (s.phone && s.phone.includes(searchTerm))
                                                    ).map(s => (
                                                        <div 
                                                            key={s.id} 
                                                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                                                            onClick={() => { handleStudentSelect(s.id); setSearchTerm(`${s.name} (${s.phone || 'No phone'})`); }}
                                                        >
                                                            <div className="font-medium">{s.name}</div>
                                                            <div className="text-xs text-muted-foreground">{s.phone || 'No phone'} • {s.email}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium">Candidate Name</label>
                                            <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">Email Address</label>
                                            <Input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium">Phone Number (Optional)</label>
                                            <Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">Job Role (Optional)</label>
                                            <Input placeholder="e.g. Frontend Developer" value={formData.jobRole} onChange={e => setFormData({...formData, jobRole: e.target.value})} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Consultancy Fee Clause (Optional)</label>
                                        <Input placeholder="e.g. 1 Month CTC" value={formData.feePercentage} onChange={e => setFormData({...formData, feePercentage: e.target.value})} />
                                    </div>
                                </div>
                            )}

                            {activeTab === 'prefill' && (
                                <div className="space-y-4 bg-slate-50 p-4 rounded-lg border">
                                    <p className="text-xs text-muted-foreground mb-4">Pre-filling this data will save time for the candidate. They will be able to review and edit this data before submitting.</p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium">Highest Qualification</label>
                                            <Input value={formData.prefilledData.highestQualification} onChange={e => setFormData({...formData, prefilledData: {...formData.prefilledData, highestQualification: e.target.value}})} placeholder="e.g. B.Tech Computer Science" />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">Experience Level</label>
                                            <select 
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                value={formData.prefilledData.experienceLevel} 
                                                onChange={e => setFormData({...formData, prefilledData: {...formData.prefilledData, experienceLevel: e.target.value}})}
                                            >
                                                <option value="Fresher">Fresher</option>
                                                <option value="Experienced">Experienced</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">Current Company</label>
                                            <Input value={formData.prefilledData.currentCompany} onChange={e => setFormData({...formData, prefilledData: {...formData.prefilledData, currentCompany: e.target.value}})} />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">Expected CTC</label>
                                            <Input value={formData.prefilledData.expectedCtc} onChange={e => setFormData({...formData, prefilledData: {...formData.prefilledData, expectedCtc: e.target.value}})} />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">Notice Period</label>
                                            <Input value={formData.prefilledData.noticePeriod} onChange={e => setFormData({...formData, prefilledData: {...formData.prefilledData, noticePeriod: e.target.value}})} />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">Preferred Locations</label>
                                            <Input value={formData.prefilledData.preferredLocations} onChange={e => setFormData({...formData, prefilledData: {...formData.prefilledData, preferredLocations: e.target.value}})} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'terms' && (
                                <div>
                                    <label className="text-sm font-medium">Terms & Conditions (Editable Template)</label>
                                    <p className="text-xs text-muted-foreground mb-2">You can customize the terms for this specific candidate.</p>
                                    <textarea 
                                        className="w-full min-h-[300px] p-3 text-sm border rounded-md font-mono"
                                        value={formData.customTerms}
                                        onChange={e => setFormData({...formData, customTerms: e.target.value})}
                                        required
                                    />
                                </div>
                            )}
                            <Button type="submit" className="w-full" disabled={submitting}>
                                {submitting ? "Processing..." : (editingId ? "Update Invitation" : "Generate Secure Link")}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* View Dialog */}
                <Dialog open={viewOpen} onOpenChange={setViewOpen}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>View Invitation Details</DialogTitle>
                        </DialogHeader>
                        {viewData && (
                            <div className="space-y-4 pt-4 text-sm">
                                <div className="grid grid-cols-2 gap-2">
                                    <p><strong>Name:</strong> {viewData.name}</p>
                                    <p><strong>Email:</strong> {viewData.email}</p>
                                    <p><strong>Phone:</strong> {viewData.phone || 'N/A'}</p>
                                    <p><strong>Job Role:</strong> {viewData.jobRole || 'N/A'}</p>
                                    <p><strong>Fee Clause:</strong> {viewData.feePercentage || 'N/A'}</p>
                                    <p><strong>Status:</strong> <span className="font-bold">{viewData.status}</span></p>
                                </div>
                                <div className="mt-4">
                                    <p className="font-bold border-b pb-1 mb-2">Terms Sent</p>
                                    <div className="bg-gray-50 p-4 rounded border h-[300px] overflow-y-auto whitespace-pre-wrap text-xs font-mono">
                                        {viewData.customTerms}
                                    </div>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

                {/* Auto Match Dialog */}
                <Dialog open={matchOpen} onOpenChange={setMatchOpen}>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-primary" />
                                AI Job Matcher
                            </DialogTitle>
                        </DialogHeader>
                        
                        {isMatching ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
                                <p className="text-muted-foreground animate-pulse">Scanning thousands of jobs with Gemini AI...</p>
                            </div>
                        ) : matches.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg mt-4">
                                No suitable open jobs found for this candidate right now.
                            </div>
                        ) : (
                            <div className="space-y-4 pt-4">
                                <p className="text-sm text-muted-foreground mb-4">Found {matches.length} highly compatible jobs based on candidate's agreement profile.</p>
                                {matches.map((match, idx) => (
                                    <div key={idx} className="border rounded-lg p-4 bg-card hover:border-primary/50 transition-colors">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="font-semibold text-lg">{match.title}</h3>
                                                <div className="mt-2 text-sm bg-primary/10 text-primary px-3 py-2 rounded-md font-medium border border-primary/20">
                                                    <strong>AI Rationale:</strong> {match.rationale}
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <div className="text-2xl font-black text-green-600">{match.matchPercentage}%</div>
                                                <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Match Score</div>
                                                <Button size="sm" className="mt-3" onClick={() => toast.success("Applicant mapped to Job. They will be notified.")}>
                                                    Map to Job
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>

            <div className="border rounded-lg bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Candidate</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Generated At</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {invitations.map((inv) => (
                            <TableRow key={inv.id}>
                                <TableCell className="font-medium">{inv.name}</TableCell>
                                <TableCell>
                                    <div className="text-sm">{inv.email}</div>
                                    <div className="text-xs text-muted-foreground">{inv.phone}</div>
                                </TableCell>
                                <TableCell>{inv.jobRole || "N/A"}</TableCell>
                                <TableCell>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                        ${inv.status === 'INVITED' ? 'bg-gray-100 text-gray-800' :
                                        inv.status === 'PENDING_ACCEPTANCE' ? 'bg-yellow-100 text-yellow-800' :
                                        inv.status === 'AGREEMENT_ACCEPTED' ? 'bg-green-100 text-green-800' :
                                        'bg-blue-100 text-blue-800'}`}>
                                        {inv.status}
                                    </span>
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    {new Date(inv.createdAt).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="text-right space-x-2 flex justify-end">
                                    <Button variant="outline" size="sm" onClick={() => openView(inv)}>
                                        View
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={() => openEdit(inv)} 
                                        disabled={inv.status !== 'INVITED'}
                                    >
                                        Edit
                                    </Button>
                                    <Button variant="secondary" size="sm" onClick={() => handleCopy(inv.token)} title="Copy Public Link">
                                        {copiedId === inv.token ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                    </Button>
                                    {inv.status !== 'INVITED' && inv.status !== 'PENDING_ACCEPTANCE' && (
                                        <Button 
                                            size="sm" 
                                            className="bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary border-primary/20 border"
                                            onClick={() => handleAutoMatch(inv.id)}
                                            title="AI Match Jobs"
                                        >
                                            <Sparkles className="h-4 w-4" />
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
