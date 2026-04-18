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

// ✅ FIXED IMPORTS
import {
    Loader2,
    Building2,
    Camera,
    Globe,
    Briefcase,
    MapPin,
    Save
} from "lucide-react"

export default function EmployerProfilePage() {
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [profile, setProfile] = useState({
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
            setProfile(prev => ({ ...prev, logo: res.data.url }))
            toast.success('Logo uploaded successfully')
        } catch {
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
        <div className="max-w-4xl mx-auto space-y-8">
            {/* UI unchanged */}
        </div>
    )
}