"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2, ArrowLeft, Shield, Check } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import api from '@/lib/api' // Assuming this exists, or I'll use fetch/axios

const PERMISSIONS_LIST = [
    { id: 'MANAGE_COURSES', label: 'Manage Courses', description: 'Create, edit, and publish courses' },
    { id: 'VIEW_ANALYTICS', label: 'View Analytics', description: 'Access dashboard stats and reports' },
    { id: 'MANAGE_USERS', label: 'Manage Users', description: 'View and edit student profiles' },
    { id: 'VIEW_FINANCE', label: 'View Finance', description: 'See revenue and transaction history' },
    { id: 'MANAGE_PAYMENTS', label: 'Manage Payments', description: 'Process refunds and invoices' },
    { id: 'MANAGE_CONTENT', label: 'Manage Content', description: 'Upload videos and resources' },
    { id: 'VIEW_REPORTS', label: 'View Reports', description: 'Access detailed performance reports' },
    { id: 'MANAGE_SETTINGS', label: 'Manage Settings', description: 'Configure platform settings' }
]

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

    const handlePermissionToggle = (permissionId: string) => {
        setFormData(prev => {
            const permissions = prev.permissions.includes(permissionId)
                ? prev.permissions.filter(p => p !== permissionId)
                : [...prev.permissions, permissionId]
            return { ...prev, permissions }
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            // Using fetch directly since I'm not 100% sure of api wrapper path, but usually it's there.
            // I'll stick to a safe fetch or axios pattern if api isn't standard, 
            // but for now I'll assume standard fetch with auth header handling is needed or generic fetch.
            // Actually, best to use the standard `api` lib if available. I see `lib/api.ts` in user context.

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

                <form onSubmit={handleSubmit}>
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

                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="w-5 h-5 text-primary" />
                                Access Permissions
                            </CardTitle>
                            <CardDescription>
                                Select specific granular permissions for this user (Mainly for Staff role).
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {PERMISSIONS_LIST.map((permission) => (
                                    <div
                                        key={permission.id}
                                        className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors ${formData.permissions.includes(permission.id)
                                            ? 'bg-blue-50 border-blue-500 shadow-sm dark:bg-blue-900/30 dark:border-blue-500'
                                            : 'bg-background hover:bg-muted/50 border-border'
                                            }`}
                                    >
                                        <Checkbox
                                            id={permission.id}
                                            checked={formData.permissions.includes(permission.id)}
                                            onCheckedChange={() => handlePermissionToggle(permission.id)}
                                        />
                                        <div className="grid gap-1.5 leading-none">
                                            <Label
                                                htmlFor={permission.id}
                                                className="font-medium cursor-pointer"
                                            >
                                                {permission.label}
                                            </Label>
                                            <p className="text-xs text-muted-foreground">
                                                {permission.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="mt-6 flex justify-end gap-4">
                        <Button variant="outline" asChild>
                            <Link href="/admin/users">Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Staff Member
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
