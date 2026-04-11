"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter
} from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, Loader2, Save, Trash2, Settings2 } from "lucide-react"

export default function EditJobPage() {
    const router = useRouter()
    const params = useParams()
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [formData, setFormData] = useState({
        title: '',
        type: 'FULL_TIME',
        location: 'Remote',
        salary: '',
        experience: '0-2 Years',
        skills: '',
        description: '',
        requirements: '',
        clientName: '',
        shift: 'Day',
        category: 'Development',
        status: 'PUBLISHED'
    })

    useEffect(() => {
        const fetchJob = async () => {
            try {
                const res = await api.get(`/jobs/${params.id}`)
                const job = res.data.job
                setFormData({
                    title: job.title,
                    type: job.type,
                    location: job.location,
                    salary: job.salary || '',
                    experience: job.experience || '0-2 Years',
                    skills: job.skills || '',
                    description: job.description || '',
                    requirements: job.requirements || '',
                    clientName: job.clientName || '',
                    shift: job.shift || 'Day',
                    category: job.category || 'Development',
                    status: job.status
                })
            } catch (error) {
                console.error("Failed to fetch job", error)
            } finally {
                setIsLoading(false)
            }
        }
        if (params.id) {
            fetchJob()
        }
    }, [params.id])

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        try {
            await api.put(`/jobs/${params.id}`, formData)
            alert('Job updated successfully!')
            router.push('/employer/jobs')
        } catch (error: unknown) {
            console.error(error)
            const errorMessage = (error as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to update job'
            alert(errorMessage)
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted" onClick={() => router.back()}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground">
                            Edit Job Listing
                        </h1>
                        <p className="text-muted-foreground mt-1 text-sm font-medium">Refining: <span className="text-primary">{formData.title}</span></p>
                    </div>
                </div>
                <div className="w-full md:w-auto">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 block px-1">Listing Status</Label>
                    <Select value={formData.status} onValueChange={v => handleChange('status', v)}>
                        <SelectTrigger className="bg-primary/5 border-primary/10 rounded-xl h-11 focus:ring-primary/20 font-bold min-w-[160px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="glass-card border-none shadow-xl">
                            <SelectItem value="DRAFT">Draft</SelectItem>
                            <SelectItem value="PUBLISHED">Published</SelectItem>
                            <SelectItem value="CLOSED">Closed</SelectItem>
                            <SelectItem value="PAUSED">Paused</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
                </div>
            ) : (
                <form onSubmit={handleSubmit}>
                    <Card className="glass-card border-none shadow-2xl overflow-hidden">
                        <CardHeader className="bg-muted/30 border-b border-muted/20">
                            <CardTitle className="flex items-center gap-2">
                                <Settings2 className="h-5 w-5 text-primary" />
                                Configuration
                            </CardTitle>
                            <CardDescription>Update the core parameters of this job role.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold">Job Title <span className="text-primary">*</span></Label>
                                    <Input
                                        className="bg-muted/20 border-none rounded-xl h-11 focus:ring-primary/20 font-medium"
                                        required
                                        value={formData.title}
                                        onChange={e => handleChange('title', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold">Client Name (Optional)</Label>
                                    <Input
                                        className="bg-muted/20 border-none rounded-xl h-11 focus:ring-primary/20 font-medium"
                                        placeholder="Internal Team"
                                        value={formData.clientName}
                                        onChange={e => handleChange('clientName', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold">Job Type</Label>
                                    <Select value={formData.type} onValueChange={v => handleChange('type', v)}>
                                        <SelectTrigger className="bg-muted/20 border-none rounded-xl h-11 focus:ring-primary/20 font-medium"><SelectValue /></SelectTrigger>
                                        <SelectContent className="glass-card border-none shadow-xl">
                                            <SelectItem value="FULL_TIME">Full Time</SelectItem>
                                            <SelectItem value="PART_TIME">Part Time</SelectItem>
                                            <SelectItem value="CONTRACT">Contract</SelectItem>
                                            <SelectItem value="INTERNSHIP">Internship</SelectItem>
                                            <SelectItem value="FREELANCE">Freelance</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold">Work Stream</Label>
                                    <Select value={formData.category} onValueChange={v => handleChange('category', v)}>
                                        <SelectTrigger className="bg-muted/20 border-none rounded-xl h-11 focus:ring-primary/20 font-medium"><SelectValue /></SelectTrigger>
                                        <SelectContent className="glass-card border-none shadow-xl">
                                            <SelectItem value="Development">Development</SelectItem>
                                            <SelectItem value="Design">Design</SelectItem>
                                            <SelectItem value="Marketing">Marketing</SelectItem>
                                            <SelectItem value="Sales">Sales</SelectItem>
                                            <SelectItem value="Management">Management</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold">Required Experience</Label>
                                    <Select value={formData.experience} onValueChange={v => handleChange('experience', v)}>
                                        <SelectTrigger className="bg-muted/20 border-none rounded-xl h-11 focus:ring-primary/20 font-medium"><SelectValue /></SelectTrigger>
                                        <SelectContent className="glass-card border-none shadow-xl">
                                            <SelectItem value="Fresher">Fresher</SelectItem>
                                            <SelectItem value="0-2 Years">0-2 Years</SelectItem>
                                            <SelectItem value="2-5 Years">2-5 Years</SelectItem>
                                            <SelectItem value="5-8 Years">5-8 Years</SelectItem>
                                            <SelectItem value="8+ Years">8+ Years</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold">Revised Budget</Label>
                                    <Input
                                        className="bg-muted/20 border-none rounded-xl h-11 focus:ring-primary/20 font-medium"
                                        value={formData.salary}
                                        onChange={e => handleChange('salary', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold">Location</Label>
                                    <Input
                                        className="bg-muted/20 border-none rounded-xl h-11 focus:ring-primary/20 font-medium"
                                        value={formData.location}
                                        onChange={e => handleChange('location', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold">Shift Pattern</Label>
                                    <Select value={formData.shift} onValueChange={v => handleChange('shift', v)}>
                                        <SelectTrigger className="bg-muted/20 border-none rounded-xl h-11 focus:ring-primary/20 font-medium"><SelectValue /></SelectTrigger>
                                        <SelectContent className="glass-card border-none shadow-xl">
                                            <SelectItem value="Day">Day Shift</SelectItem>
                                            <SelectItem value="Night">Night Shift</SelectItem>
                                            <SelectItem value="Rotational">Rotational</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-semibold">Core Skills & Tech</Label>
                                <Input
                                    className="bg-muted/20 border-none rounded-xl h-11 focus:ring-primary/20 font-medium"
                                    value={formData.skills}
                                    onChange={e => handleChange('skills', e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-semibold">Full Description</Label>
                                <Textarea
                                    className="min-h-[160px] bg-muted/20 border-none rounded-2xl p-4 focus:ring-primary/20 resize-none font-medium text-sm"
                                    value={formData.description}
                                    onChange={e => handleChange('description', e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-semibold">Candidate Requirements</Label>
                                <Textarea
                                    className="min-h-[120px] bg-muted/20 border-none rounded-2xl p-4 focus:ring-primary/20 resize-none font-medium text-sm"
                                    value={formData.requirements}
                                    onChange={e => handleChange('requirements', e.target.value)}
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col md:flex-row justify-between items-center bg-muted/30 border-t border-muted/20 p-8 gap-4">
                            <Button type="button" variant="ghost" className="rounded-xl font-bold uppercase tracking-wider text-xs text-red-500 hover:text-red-700 hover:bg-red-500/10">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remove Job Listing
                            </Button>
                            <div className="flex gap-4 w-full md:w-auto">
                                <Button type="button" variant="ghost" className="flex-1 md:flex-none rounded-xl font-bold uppercase tracking-wider text-xs" onClick={() => router.back()}>Discard Changes</Button>
                                <Button type="submit" disabled={isSaving} className="flex-1 md:flex-none h-12 px-10 rounded-2xl font-bold bg-primary shadow-xl shadow-primary/20 hover:scale-[1.03] active:scale-[0.98] transition-all">
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" />
                                            Update Listing
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardFooter>
                    </Card>
                </form>
            )}
            <div className="h-20" />
        </div>
    )
}
