"use client"

import * as React from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { userApi, uploadApi } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { User as UserIcon, Mail, Phone, Save, Loader2, Shield, Camera, Crown } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

interface ExtendedUser {
    id: string
    name: string
    email: string
    role: string
    phone?: string
    avatar?: string
    plan?: string // Added plan
}

export default function ProfilePage() {
    const router = useRouter()
    const { user, isAuthenticated, isLoading: authLoading, refreshUser, logout } = useAuth()
    const currentUser = user as ExtendedUser | null

    const [isEditing, setIsEditing] = React.useState(false)
    const [isSaving, setIsSaving] = React.useState(false)
    const [isUploading, setIsUploading] = React.useState(false)
    const [formData, setFormData] = React.useState({
        name: '',
        phone: '',
        avatar: '',
    })

    const fileInputRef = React.useRef<HTMLInputElement>(null)

    React.useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login')
        }
    }, [authLoading, isAuthenticated, router])

    React.useEffect(() => {
        if (currentUser) {
            setFormData({
                name: currentUser.name || '',
                phone: currentUser.phone || '',
                avatar: currentUser.avatar || '',
            })
        }
    }, [currentUser])

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)

        try {
            await userApi.updateMe(formData)
            await refreshUser()
            setIsEditing(false)
            toast.success('Profile updated successfully!')
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to update profile')
        } finally {
            setIsSaving(false)
        }
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (file.size > 5 * 1024 * 1024) {
            toast.error('File size must be less than 5MB')
            return
        }

        setIsUploading(true)
        const uploadFormData = new FormData()
        uploadFormData.append('file', file)

        try {
            const res = await uploadApi.upload(uploadFormData)
            const fileUrl = res.data.url

            // Immediately update the profile with the new avatar URL
            const updatedData = { ...formData, avatar: fileUrl }
            setFormData(updatedData)

            // Also save to backend immediately
            await userApi.updateMe({ ...updatedData })
            await refreshUser()

            toast.success('Profile picture updated!')
        } catch (error: any) {
            console.error(error)
            toast.error('Failed to upload image')
        } finally {
            setIsUploading(false)
        }
    }

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'SUPER_ADMIN': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            case 'ADMIN': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
            case 'INSTRUCTOR': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
            default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
        }
    }

    const getPlanBadge = (plan?: string) => {
        if (plan === 'PRO') {
            return (
                <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0 shadow-sm ml-2 font-bold px-2 py-0.5 text-[10px] tracking-wider">
                    <Crown className="w-3 h-3 mr-1 fill-white" /> PRO
                </Badge>
            )
        }
        if (plan === 'ENTERPRISE') {
            return (
                <Badge className="bg-gradient-to-r from-slate-700 to-slate-900 text-white border-0 shadow-sm ml-2">
                    ENTERPRISE
                </Badge>
            )
        }
        return (
            <Badge variant="outline" className="ml-2 text-[10px] text-gray-500 font-medium">
                FREE
            </Badge>
        )
    }

    if (authLoading || !currentUser) {
        return (
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="container py-10 max-w-3xl animate-in fade-in duration-500">
            <h1 className="text-3xl font-bold mb-8 text-gray-900">Account Settings</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Profile Card */}
                <Card className="col-span-1 md:col-span-3 bg-white border-gray-200 shadow-sm rounded-xl overflow-hidden">
                    <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600 relative">
                        <div className="absolute bottom-4 right-4">
                            {!isEditing && (
                                <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)} className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm">
                                    Edit Profile
                                </Button>
                            )}
                        </div>
                    </div>
                    <CardContent className="px-8 pb-8 pt-0 relative">
                        <div className="flex flex-col md:flex-row items-center md:items-end -mt-12 mb-6 gap-6">
                            <div className="relative group">
                                <div className="h-24 w-24 rounded-full border-4 border-white bg-white shadow-md overflow-hidden flex items-center justify-center relative">
                                    {formData.avatar ? (
                                        <Image src={formData.avatar} alt="Profile" width={96} height={96} className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="h-full w-full bg-gray-100 flex items-center justify-center">
                                            <UserIcon className="h-10 w-10 text-gray-400" />
                                        </div>
                                    )}
                                    {isUploading && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                            <Loader2 className="h-6 w-6 text-white animate-spin" />
                                        </div>
                                    )}
                                </div>
                                <Button
                                    size="icon"
                                    variant="secondary"
                                    className="absolute bottom-0 right-0 h-8 w-8 rounded-full shadow-md border-2 border-white"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading}
                                >
                                    <Camera className="h-4 w-4 text-gray-600" />
                                </Button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    aria-label="Upload profile picture"
                                />
                            </div>

                            <div className="text-center md:text-left flex-1 mb-2">
                                <div className="flex items-center justify-center md:justify-start gap-2">
                                    <h2 className="text-2xl font-bold text-gray-900">{currentUser.name}</h2>
                                    {getPlanBadge(currentUser.plan)}
                                </div>
                                <div className="flex items-center justify-center md:justify-start gap-2 text-gray-500 mt-1">
                                    <span className={`inline-flex items-center gap-1 text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${getRoleBadgeColor(currentUser.role)}`}>
                                        {currentUser.role}
                                    </span>
                                    <span>•</span>
                                    <span>{currentUser.email}</span>
                                </div>
                            </div>
                        </div>

                        {isEditing ? (
                            <form onSubmit={handleSave} className="grid gap-6 max-w-xl">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Full Name</label>
                                    <Input
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        className="max-w-md"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Phone Number</label>
                                    <Input
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="+91 9876543210"
                                        className="max-w-md"
                                    />
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <Button type="submit" disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
                                        {isSaving ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="mr-2 h-4 w-4" />
                                                Save Changes
                                            </>
                                        )}
                                    </Button>
                                    <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mt-8">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact Information</label>
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                        <span className="text-sm font-medium text-gray-700">{currentUser.email}</span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone</label>
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                        <Phone className="h-5 w-5 text-gray-400" />
                                        <span className="text-sm font-medium text-gray-700">{currentUser.phone || 'Not provided'}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {!isEditing && (
                            <div className="mt-8 pt-8 border-t border-gray-100 flex justify-between items-center">
                                <p className="text-xs text-gray-400">Member since {new Date().getFullYear()}</p>
                                <Button variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={logout}>
                                    Sign Out
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
