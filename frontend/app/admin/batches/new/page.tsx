"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import api from "@/lib/api"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function CreateBatchPage() {
    const router = useRouter()
    const { hasPermission } = useAuth()
    
    const [courses, setCourses] = useState<any[]>([])
    const [instructors, setInstructors] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    
    const [formData, setFormData] = useState({
        name: "",
        courseId: "",
        instructorId: "",
        timings: "",
        startDate: "",
        endDate: "",
        maxStudents: "",
        hasJobAssistance: false,
        description: ""
    })

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [coursesRes, usersRes] = await Promise.all([
                    api.get('/courses?limit=1000'),
                    api.get('/users?limit=1000')
                ])
                const coursesData = Array.isArray(coursesRes.data) ? coursesRes.data : (coursesRes.data.courses || [])
                setCourses(coursesData)
                const usersData = Array.isArray(usersRes.data) ? usersRes.data : (usersRes.data.users || [])
                setInstructors(usersData.filter((u: any) => ['ADMIN', 'INSTRUCTOR', 'TEACHER'].includes(u.role)))
            } catch (error) {
                console.error("Failed to load options", error)
            }
        }
        fetchData()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            setLoading(true)
            await api.post('/batches', formData)
            router.push('/admin/batches')
        } catch (error) {
            console.error("Failed to create batch", error)
            alert("Error creating batch")
        } finally {
            setLoading(false)
        }
    }

    if (!hasPermission("COURSES")) return <div className="p-8">Access Denied</div>

    return (
        <div className="p-8 max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/batches">
                    <Button variant="outline" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold">Create New Batch</h1>
            </div>
            <p className="text-muted-foreground">Fill in the details to create a new batch. A unique Batch ID will be automatically generated.</p>

            <form onSubmit={handleSubmit} className="space-y-6 bg-card p-6 border rounded-lg">
                <div className="space-y-2">
                    <Label>Batch Name *</Label>
                    <Input 
                        required 
                        placeholder="e.g. MERN Stack Weekend Batch" 
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Course *</Label>
                        <Select onValueChange={(val) => setFormData({...formData, courseId: val})} required>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Course" />
                            </SelectTrigger>
                            <SelectContent>
                                {courses.map(course => (
                                    <SelectItem key={course.id} value={course.id}>{course.title}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    
                    <div className="space-y-2">
                        <Label>Instructor *</Label>
                        <Select onValueChange={(val) => setFormData({...formData, instructorId: val})} required>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Instructor" />
                            </SelectTrigger>
                            <SelectContent>
                                {instructors.map(inst => (
                                    <SelectItem key={inst.id} value={inst.id}>{inst.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Start Date</Label>
                        <Input 
                            type="date"
                            value={formData.startDate}
                            onChange={e => setFormData({...formData, startDate: e.target.value})}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>End Date</Label>
                        <Input 
                            type="date"
                            value={formData.endDate}
                            onChange={e => setFormData({...formData, endDate: e.target.value})}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Timings</Label>
                        <Input 
                            placeholder="e.g. 10:00 AM - 12:00 PM" 
                            value={formData.timings}
                            onChange={e => setFormData({...formData, timings: e.target.value})}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Max Students</Label>
                        <Input 
                            type="number"
                            placeholder="e.g. 50" 
                            value={formData.maxStudents}
                            onChange={e => setFormData({...formData, maxStudents: e.target.value})}
                        />
                    </div>
                </div>

                <div className="flex items-center space-x-2 py-2">
                    <Switch 
                        id="job-assistance" 
                        checked={formData.hasJobAssistance}
                        onCheckedChange={(checked) => setFormData({...formData, hasJobAssistance: checked})}
                    />
                    <Label htmlFor="job-assistance">Enable Job Assistance for this Batch</Label>
                </div>

                <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea 
                        placeholder="Additional batch details..." 
                        value={formData.description}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                    />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                    <Button type="submit" disabled={loading}>
                        {loading ? "Creating..." : "Create Batch"}
                    </Button>
                </div>
            </form>
        </div>
    )
}
