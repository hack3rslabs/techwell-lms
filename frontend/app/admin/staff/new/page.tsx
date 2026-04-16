"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Loader2, ArrowLeft, Shield } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import api from '@/lib/api'

const RBAC_MODULES = [
    { id: "COURSES", label: "Courses", desc: "Course material and orchestrations" },
    { id: "JOBS", label: "Jobs", desc: "ATS and Job Postings" },
    { id: "CERTIFICATES", label: "Certificates", desc: "Issued certificates and templates" },
    { id: "INTERVIEWS", label: "Interviews", desc: "AI and live interviews" },
    { id: "LEADS", label: "Leads Access", desc: "CRM and marketing targets" },
    { id: "MEETINGS", label: "Meetings", desc: "Schedule and tracking" },
    { id: "SYSTEM_LOGS", label: "System Logs", desc: "Security forensics" },
    { id: "LIBRARY", label: "Library", desc: "Digital resource centre" },
    { id: "BLOGS", label: "Blogs", desc: "Public website articles" },
    { id: "REVIEWS", label: "Reviews", desc: "Ratings & feedback" },
    { id: "USERS", label: "User Roles", desc: "Admin staff and student profiles" },
    { id: "TASKS", label: "Tasks", desc: "Internal workflow operations" },
    { id: "REPORTS", label: "Reports", desc: "Financial and system analytics" },
    { id: "SETTINGS", label: "Platform Settings", desc: "System-wide configs and vars" },
];

export default function CreateStaffPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        role: 'STAFF',
        permissions: [] as string[]
    })

    const handleRadioChange = (moduleId: string, value: string) => {
        const viewKey = `VIEW_${moduleId}`;
        const manageKey = `MANAGE_${moduleId}`;
        
        setFormData(prev => {
            let nextPermissions = prev.permissions.filter(p => p !== viewKey && p !== manageKey);
            
            if (value === "allow") {
                nextPermissions.push(viewKey, manageKey);
            } else if (value === "view") {
                nextPermissions.push(viewKey);
            }
            return { ...prev, permissions: nextPermissions };
        });
    }

    const getModuleRadioValue = (moduleId: string) => {
        const hasManage = formData.permissions.includes(`MANAGE_${moduleId}`);
        const hasView = formData.permissions.includes(`VIEW_${moduleId}`);
        
        if (hasManage) return "allow";
        if (hasView) return "view";
        return "deny";
    }

    const handleAllWildcard = (checked: boolean) => {
        setFormData(prev => {
            const permissions = checked
                ? [...prev.permissions.filter(p => p !== 'ALL'), 'ALL']
                : prev.permissions.filter(p => p !== 'ALL')
            return { ...prev, permissions }
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            await api.post('/admin/staff', formData)
            toast.success('Staff member created successfully')
            router.push('/admin/users')
        } catch (error) {
            const err = error as { response?: { data?: { error?: string } } }
            toast.error(err.response?.data?.error || 'Failed to create staff member')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container py-10 max-w-4xl">
            <div className="mb-6 flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild>
                    <Link href="/admin/users">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Users
                    </Link>
                </Button>
            </div>

            <div className="grid gap-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Create Staff Member</h1>
                    <p className="text-muted-foreground">
                        Add a new staff member or administrator with specific permissions.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Account Details</CardTitle>
                            <CardDescription>
                                Basic information for the new staff account.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input
                                        id="name"
                                        placeholder="John Doe"
                                        required
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="john@example.com"
                                        required
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        required
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone (Optional)</Label>
                                    <Input
                                        id="phone"
                                        placeholder="+91 98765 43210"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="role">Role</Label>
                                <Select
                                    value={formData.role}
                                    onValueChange={(value) => setFormData({ ...formData, role: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="STAFF">Staff (Restricted Access)</SelectItem>
                                        <SelectItem value="INSTITUTE_ADMIN">Institute Admin (Branch Head)</SelectItem>
                                        <SelectItem value="INSTRUCTOR">Instructor</SelectItem>
                                        <SelectItem value="EMPLOYER">Employer / HR (Recruiter)</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">
                                    <strong>Staff:</strong> Can only access features allowed by permissions.<br />
                                    <strong>Institute Admin:</strong> High-level access for branch management.<br />
                                    <strong>Instructor:</strong> Can manage their own courses and students.<br />
                                    <strong>Employer:</strong> Can post jobs and manage applications.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <Shield className="h-5 w-5 text-orange-600" />
                                        Access Matrix Configuration
                                    </CardTitle>
                                    <CardDescription>
                                        Establish granular Read vs Write bounds for this initial staff member.
                                    </CardDescription>
                                </div>
                                <div className="flex items-center gap-2 border px-3 py-2 rounded-md bg-muted/20">
                                    <Label htmlFor="allWizard" className="text-sm font-semibold text-orange-600 cursor-pointer">God-Mode Bypass</Label>
                                    <Switch id="allWizard" checked={formData.permissions.includes('ALL')} onCheckedChange={handleAllWildcard} />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border overflow-hidden">
                                <div className="bg-muted px-4 py-3 grid grid-cols-12 gap-4 items-center">
                                    <div className="col-span-5 font-semibold text-sm">System Module</div>
                                    <div className="col-span-7 font-semibold text-sm">Access Designation</div>
                                </div>
                                <div className="divide-y relative">
                                    {formData.permissions.includes('ALL') && (
                                        <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
                                            <Badge variant="outline" className="bg-background text-orange-600 py-1.5 px-3 border-orange-200">
                                                ALL PERMISSIONS INHERITED
                                            </Badge>
                                        </div>
                                    )}
                                    {RBAC_MODULES.map((module) => {
                                        return (
                                            <div key={module.id} className="px-4 py-4 grid grid-cols-12 gap-4 items-center hover:bg-muted/30 transition-colors">
                                                <div className="col-span-4 flex flex-col">
                                                    <span className="font-semibold text-sm">{module.label}</span>
                                                    <span className="text-[10px] text-muted-foreground hidden lg:block">{module.desc}</span>
                                                </div>
                                                <div className="col-span-8">
                                                    <RadioGroup 
                                                        className="flex flex-col sm:flex-row gap-4 sm:gap-6" 
                                                        value={getModuleRadioValue(module.id)}
                                                        onValueChange={(v) => handleRadioChange(module.id, v)}
                                                    >
                                                        <div className="flex items-center space-x-2">
                                                            <RadioGroupItem value="allow" id={`allow-${module.id}`} />
                                                            <Label htmlFor={`allow-${module.id}`} className="cursor-pointer text-sm font-medium">Allow (Full)</Label>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <RadioGroupItem value="view" id={`view-${module.id}`} />
                                                            <Label htmlFor={`view-${module.id}`} className="cursor-pointer text-sm">View Only</Label>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <RadioGroupItem value="deny" id={`deny-${module.id}`} />
                                                            <Label htmlFor={`deny-${module.id}`} className="cursor-pointer text-sm text-destructive">Deny / Hidden</Label>
                                                        </div>
                                                    </RadioGroup>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4">
                        <Button variant="outline" type="button" asChild>
                            <Link href="/admin/users">Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Provision User
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
