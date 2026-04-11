"use client"

import { useState, useEffect, useRef } from "react"
import { userApi, employerApi, uploadApi } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import Image from "next/image"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

export default function EmployerProfilePage() {
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Employer Profile Data
    const [profile, setProfile] = useState<{
        companyName: string
        website: string
        description: string
        location: string
        industry: string
        size: string
        logo?: string
    }>({
        companyName: '',
        website: '',
        description: '',
        location: '',
        industry: '',
        size: '',
        logo: ''
    })

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const [userRes, profileRes] = await Promise.all([
                    userApi.getMe(),
                    employerApi.getProfile().catch(() => ({ data: null }))
                ])

                if (userRes.data && profileRes.data) {
                    setProfile({
                        companyName: profileRes.data.companyName || '',
                        website: profileRes.data.website || '',
                        description: profileRes.data.description || '',
                        location: profileRes.data.location || '',
                        industry: profileRes.data.industry || '',
                        size: profileRes.data.companySize || '',
                        logo: profileRes.data.logo || ''
                    })
                }
            } catch {
                toast.error("Failed to load profile")
            } finally {
                setIsLoading(false)
            }
        }
        fetchProfile()
    }, [])

    const handleChange = (field: keyof typeof profile, value: string) => {
        setProfile(prev => ({ ...prev, [field]: value }))
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
            setProfile(prev => ({ ...prev, logo: fileUrl }))
            toast.success('Logo uploaded successfully')
        } catch (error) {
            console.error(error)
            toast.error('Failed to upload logo')
        } finally {
            setIsUploading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        try {
            await employerApi.updateProfile({
                ...profile,
                companySize: profile.size
            })
            toast.success('Company profile updated successfully!')
        } catch {
            toast.error('Failed to update profile')
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                        Company Profile
                    </h1>
                    <p className="text-gray-500 mt-1 text-sm font-medium">Manage your company branding and public-facing details.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-8">
                <Card className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden">
                    <CardHeader className="bg-gray-50/50 border-b border-gray-100 py-4">
                        <CardTitle className="flex items-center gap-2 text-base font-bold text-gray-900">
                            <Building2 className="h-5 w-5 text-blue-600" />
                            Basic Information
                        </CardTitle>
                        <CardDescription className="text-xs text-gray-500">This information will be displayed on your job listings.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 space-y-8">
                        <div className="flex flex-col md:flex-row gap-8 items-start">
                            <div className="space-y-4">
                                <Label className="text-xs font-bold uppercase tracking-widest text-gray-500">Company Logo</Label>
                                <div className="relative group">
                                    <div className="h-32 w-32 rounded-2xl border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden transition-all group-hover:border-blue-200 group-hover:shadow-md">
                                        {profile.logo ? (
                                            <Image src={profile.logo || ''} alt="Logo" width={80} height={80} className="w-full h-full object-cover" />
                                        ) : (
                                            <Building2 className="h-10 w-10 text-gray-300" />
                                        )}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                            {isUploading ? <Loader2 className="h-6 w-6 text-white animate-spin" /> : <Camera className="h-6 w-6 text-white" />}
                                        </div>
                                    </div>
                                    <Button type="button" variant="outline" size="sm" className="w-full text-xs mt-2 border-gray-200 text-gray-600 hover:text-blue-600 hover:bg-blue-50" onClick={() => fileInputRef.current?.click()}>
                                        Change Logo
                                    </Button>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        aria-label="Upload company logo"
                                    />
                                </div>
                            </div>

                            <div className="flex-1 space-y-6 w-full">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-gray-700">Company Name</Label>
                                        <Input
                                            className="bg-white border-gray-200 rounded-lg h-10 focus:ring-blue-100 focus:border-blue-400 transition-all"
                                            value={profile.companyName}
                                            onChange={e => handleChange('companyName', e.target.value)}
                                            placeholder="Acme Tech Solutions"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-gray-700">Website URL</Label>
                                        <div className="relative">
                                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <Input
                                                className="pl-9 bg-white border-gray-200 rounded-lg h-10 focus:ring-blue-100 focus:border-blue-400 transition-all"
                                                value={profile.website}
                                                onChange={e => handleChange('website', e.target.value)}
                                                placeholder="https://acme.com"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-gray-700">Industry</Label>
                                        <div className="relative">
                                            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <Input
                                                className="pl-9 bg-white border-gray-200 rounded-lg h-10 focus:ring-blue-100 focus:border-blue-400 transition-all"
                                                value={profile.industry}
                                                onChange={e => handleChange('industry', e.target.value)}
                                                placeholder="e.g. Software Development"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-gray-700">Company Size</Label>
                                        <Select value={profile.size} onValueChange={v => handleChange('size', v)}>
                                            <SelectTrigger className="bg-white border-gray-200 rounded-lg h-10 text-gray-700">
                                                <SelectValue placeholder="Select size" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white border-gray-200 shadow-xl rounded-lg">
                                                <SelectItem value="1-10">1-10 Employees</SelectItem>
                                                <SelectItem value="11-50">11-50 Employees</SelectItem>
                                                <SelectItem value="51-200">51-200 Employees</SelectItem>
                                                <SelectItem value="201-1000">201-1000 Employees</SelectItem>
                                                <SelectItem value="1000+">1000+ Employees</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-gray-100">
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-gray-700">Office Location (HQ)</Label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        className="pl-9 bg-white border-gray-200 rounded-lg h-10 focus:ring-blue-100 focus:border-blue-400 transition-all"
                                        value={profile.location}
                                        onChange={e => handleChange('location', e.target.value)}
                                        placeholder="e.g. Banglore, India"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-gray-700">Company Overview</Label>
                                <Textarea
                                    className="min-h-[140px] bg-white border-gray-200 rounded-xl p-4 focus:ring-blue-100 focus:border-blue-400 transition-all resize-none text-sm"
                                    value={profile.description}
                                    onChange={e => handleChange('description', e.target.value)}
                                    placeholder="Tell us about your company culture, mission, and long-term vision..."
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end pb-12">
                    <Button
                        type="submit"
                        disabled={isSaving}
                        className="h-11 px-8 rounded-xl font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200 hover:shadow-lg transition-all"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Save Profile Changes
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
}
