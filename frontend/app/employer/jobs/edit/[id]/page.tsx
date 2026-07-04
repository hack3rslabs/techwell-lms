"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import api from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"

interface Job {
    title: string
    type: string
    location: string
    salary: string
    experience: string
    description: string
    requirements: string
    skills: string
    status: string
}

export default function EditJobPage() {
    const { id } = useParams()
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [job, setJob] = useState<Job>({
        title: '',
        type: 'FULL_TIME',
        location: '',
        salary: '',
        experience: '',
        description: '',
        requirements: '',
        skills: '',
        status: 'OPEN'
    })

    useEffect(() => {
        const fetchJob = async () => {
            try {
                const res = await api.get(`/jobs/my/listings/${id}`)
                setJob(res.data)
            } catch {
                alert("Failed to load job details")
            } finally {
                setIsLoading(false)
            }
        }
        if (id) {
            void fetchJob()
        }
    }, [id])

    const handleSave = async () => {
        setIsSaving(true)
        try {
            await api.put(`/jobs/${id}`, job)
            alert('Job Updated Successfully!')
            router.push('/employer/dashboard')
        } catch {
            // Error handling
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>

    return (
        <div className="container py-8 max-w-3xl">
            <Card>
                <CardHeader>
                    <CardTitle>Edit Job Posting</CardTitle>
                    <CardDescription>Update job details, status, or requirements.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Job Title</Label>
                            <Input value={job.title} onChange={e => setJob({ ...job, title: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select value={job.status} onValueChange={val => setJob({ ...job, status: val })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="DRAFT">Draft</SelectItem>
                                    <SelectItem value="PUBLISHED">Published</SelectItem>
                                    <SelectItem value="PAUSED">Paused</SelectItem>
                                    <SelectItem value="CLOSED">Closed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Location</Label>
                            <Input value={job.location} onChange={e => setJob({ ...job, location: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Salary Range</Label>
                            <Input value={job.salary} onChange={e => setJob({ ...job, salary: e.target.value })} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Job Type</Label>
                            <Select value={job.type} onValueChange={val => setJob({ ...job, type: val })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="FULL_TIME">Full Time</SelectItem>
                                    <SelectItem value="PART_TIME">Part Time</SelectItem>
                                    <SelectItem value="INTERNSHIP">Internship</SelectItem>
                                    <SelectItem value="CONTRACT">Contract</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Experience</Label>
                            <Input value={job.experience} onChange={e => setJob({ ...job, experience: e.target.value })} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Skills (Comma separated)</Label>
                        <Input value={job.skills} onChange={e => setJob({ ...job, skills: e.target.value })} />
                    </div>

                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                            className="min-h-[150px]"
                            value={job.description}
                            onChange={e => setJob({ ...job, description: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Requirements</Label>
                        <Textarea
                            className="min-h-[100px]"
                            value={job.requirements}
                            onChange={e => setJob({ ...job, requirements: e.target.value })}
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
                        <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
