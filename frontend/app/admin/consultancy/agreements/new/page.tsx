"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { consultancyApi, studentsApi } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { toast } from "sonner"
import { Loader2, Link as LinkIcon, Copy } from "lucide-react"

export default function NewAgreementPage() {
    const router = useRouter()
    const [candidates, setCandidates] = useState<any[]>([])
    const [selectedCandidate, setSelectedCandidate] = useState<string>("")
    const [loading, setLoading] = useState(true)
    const [generating, setGenerating] = useState(false)
    const [inviteLink, setInviteLink] = useState<string | null>(null)

    const [formData, setFormData] = useState({
        totalFee: "",
        advanceFee: "",
        jobRole: "",
        customTerms: ""
    })

    useEffect(() => {
        const fetchCandidates = async () => {
            try {
                // Fetching all students as potential candidates
                const res = await studentsApi.getAll()
                setCandidates(res.data.students || [])
            } catch (error: any) {
                toast.error("Failed to fetch candidates")
            } finally {
                setLoading(false)
            }
        }
        fetchCandidates()
    }, [])

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedCandidate) return toast.error("Please select a candidate")
        
        const candidate = candidates.find(c => c.id === selectedCandidate)
        if (!candidate) return toast.error("Candidate not found")

        setGenerating(true)
        try {
            const payload = {
                name: candidate.name,
                email: candidate.email,
                phone: candidate.phone || "",
                jobRole: formData.jobRole,
                advanceFee: formData.advanceFee,
                totalFee: formData.totalFee,
                customTerms: formData.customTerms,
                prefilledData: {
                    fullName: candidate.name,
                    emailAddress: candidate.email,
                    mobileNumber: candidate.phone || ""
                }
            }

            const res = await consultancyApi.createInvitation(payload)
            const fullLink = `${window.location.origin}${res.data.link}`
            setInviteLink(fullLink)
            toast.success("Agreement link generated successfully")
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to generate agreement")
        } finally {
            setGenerating(false)
        }
    }

    const copyToClipboard = () => {
        if (inviteLink) {
            navigator.clipboard.writeText(inviteLink)
            toast.success("Link copied to clipboard")
        }
    }

    if (loading) return <div className="flex justify-center items-center h-[50vh]"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Generate Consultancy Agreement</h1>
                <p className="text-muted-foreground mt-2">Create a new legally binding agreement for a registered candidate.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Agreement Details</CardTitle>
                    <CardDescription>Select a candidate and specify the fee structure.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleGenerate} className="space-y-6">
                        <div className="space-y-2">
                            <Label>Select Registered Candidate</Label>
                            <Select value={selectedCandidate} onValueChange={setSelectedCandidate}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Search and select candidate..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {candidates.map(c => (
                                        <SelectItem key={c.id} value={c.id}>
                                            {c.name} ({c.email})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Total Payment / Fee (₹)</Label>
                                <Input 
                                    type="number" 
                                    placeholder="e.g. 50000" 
                                    required 
                                    value={formData.totalFee}
                                    onChange={e => setFormData({...formData, totalFee: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Advance Fee (₹)</Label>
                                <Input 
                                    type="number" 
                                    placeholder="e.g. 10000" 
                                    required 
                                    value={formData.advanceFee}
                                    onChange={e => setFormData({...formData, advanceFee: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Target Job Role</Label>
                            <Input 
                                placeholder="e.g. Full Stack Developer" 
                                required 
                                value={formData.jobRole}
                                onChange={e => setFormData({...formData, jobRole: e.target.value})}
                            />
                        </div>

                        {!inviteLink ? (
                            <Button type="submit" disabled={generating} className="w-full">
                                {generating ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                                Generate Agreement Link
                            </Button>
                        ) : (
                            <div className="p-4 bg-green-50/50 border border-green-200 rounded-lg space-y-3">
                                <p className="text-sm font-medium text-green-800">Agreement generated successfully. Send this link to the candidate for live capture and signing.</p>
                                <div className="flex gap-2">
                                    <Input value={inviteLink} readOnly className="bg-white" />
                                    <Button type="button" variant="outline" onClick={copyToClipboard}>
                                        <Copy className="h-4 w-4 mr-2" /> Copy
                                    </Button>
                                    <Button type="button" onClick={() => window.open(inviteLink, '_blank')}>
                                        <LinkIcon className="h-4 w-4 mr-2" /> Open
                                    </Button>
                                </div>
                                <Button type="button" variant="ghost" className="w-full mt-2" onClick={() => setInviteLink(null)}>
                                    Generate Another
                                </Button>
                            </div>
                        )}
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
