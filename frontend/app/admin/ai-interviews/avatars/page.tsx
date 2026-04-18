"use client"

import * as React from 'react'
import { useState, useEffect } from 'react'
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Users,
    Plus,
    Edit,
    Trash2,
    ArrowLeft,
    User,
    Smile
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import api from '@/lib/api'

interface Avatar {
    id: string
    name: string
    role: string
    personality: string
    avatarUrl: string
    gender: 'MALE' | 'FEMALE' | 'OTHER'
    voiceId?: string
    provider?: string
    isActive: boolean
}

const _DEFAULT_AVATARS: Avatar[] = [
    {
        id: '1',
        name: 'Alex Chen',
        role: 'Technical Interviewer',
        personality: 'Friendly',
        avatarUrl: '/interviewer_avatar.png',
        gender: 'MALE',
        isActive: true
    },
    {
        id: '2',
        name: 'Sarah Johnson',
        role: 'HR Interviewer',
        personality: 'Professional',
        avatarUrl: '/interviewer_avatar.png',
        gender: 'FEMALE',
        isActive: true
    }
]

export default function AvatarsPage() {
    const [avatars, setAvatars] = useState<Avatar[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingAvatar, setEditingAvatar] = useState<Avatar | null>(null)
    const [formData, setFormData] = useState({
        name: '',
        role: 'Technical Interviewer',
        personality: 'Friendly',
        gender: 'MALE' as 'MALE' | 'FEMALE' | 'OTHER',
        avatarUrl: '',
        voiceId: '',
        provider: 'ELEVEN_LABS'
    })

    useEffect(() => {
        fetchAvatars()
    }, [])

    const fetchAvatars = async () => {
        try {
            const res = await api.get('/avatars')
            setAvatars(res.data.avatars || [])
        } catch (error) {
            console.error('Failed to fetch avatars:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSubmit = async () => {
        try {
            if (editingAvatar) {
                await api.put(`/avatars/${editingAvatar.id}`, formData)
            } else {
                await api.post('/avatars', formData)
            }
            fetchAvatars()
            setIsDialogOpen(false)
            setEditingAvatar(null)
            resetForm()
        } catch (error) {
            console.error('Failed to save avatar:', error)
        }
    }

    const resetForm = () => {
        setFormData({
            name: '',
            role: 'Technical Interviewer',
            personality: 'Friendly',
            gender: 'MALE',
            avatarUrl: '',
            voiceId: '',
            provider: 'ELEVEN_LABS'
        })
    }

    const handleEdit = (avatar: Avatar) => {
        setEditingAvatar(avatar)
        setFormData({
            name: avatar.name,
            role: avatar.role,
            personality: avatar.personality,
            gender: avatar.gender || 'MALE',
            avatarUrl: avatar.avatarUrl,
            voiceId: avatar.voiceId || '',
            provider: avatar.provider || 'ELEVEN_LABS'
        })
        setIsDialogOpen(true)
    }

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this avatar?')) {
            try {
                await api.delete(`/avatars/${id}`)
                fetchAvatars()
            } catch (error) {
                console.error('Failed to delete avatar:', error)
            }
        }
    }

    const toggleActive = async (avatar: Avatar) => {
        try {
            await api.patch(`/avatars/${avatar.id}/toggle`)
            fetchAvatars()
        } catch (error) {
            console.error('Failed to toggle avatar status:', error)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/ai-interviews">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">AI Avatars</h1>
                        <p className="text-muted-foreground">Manage interviewer personas and appearances.</p>
                    </div>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => { setEditingAvatar(null); resetForm() }}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Avatar
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>{editingAvatar ? 'Edit Avatar' : 'Create New Avatar'}</DialogTitle>
                            <DialogDescription>
                                Configure the interviewer persona details.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData(f => ({ ...f, name: e.target.value }))}
                                    placeholder="e.g., Alex Chen"
                                />
                            </div>
                            <div className="flex gap-4">
                                <div className="grid gap-2 flex-1">
                                    <Label htmlFor="gender">Gender</Label>
                                    <Select
                                        value={formData.gender}
                                        onValueChange={(value: Avatar['gender']) => setFormData(f => ({ ...f, gender: value }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Gender" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="MALE">Male</SelectItem>
                                            <SelectItem value="FEMALE">Female</SelectItem>
                                            <SelectItem value="OTHER">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2 flex-1">
                                    <Label htmlFor="role">Role</Label>
                                    <Select
                                        value={formData.role}
                                        onValueChange={(value) => setFormData(f => ({ ...f, role: value }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Technical Interviewer">Technical Interviewer</SelectItem>
                                            <SelectItem value="HR Interviewer">HR Interviewer</SelectItem>
                                            <SelectItem value="Senior Technical">Senior Technical</SelectItem>
                                            <SelectItem value="Behavioral Expert">Behavioral Expert</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="personality">Personality</Label>
                                <Select
                                    value={formData.personality}
                                    onValueChange={(value) => setFormData(f => ({ ...f, personality: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select personality" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Friendly">Friendly</SelectItem>
                                        <SelectItem value="Professional">Professional</SelectItem>
                                        <SelectItem value="Strict">Strict</SelectItem>
                                        <SelectItem value="Encouraging">Encouraging</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="avatarUrl">Avatar Image URL</Label>
                                <Input
                                    id="avatarUrl"
                                    value={formData.avatarUrl}
                                    onChange={(e) => setFormData(f => ({ ...f, avatarUrl: e.target.value }))}
                                    placeholder="https://example.com/avatar.png"
                                />
                            </div>
                            <div className="grid gap-4">
                                <div className="grid gap-2 flex-1">
                                    <Label htmlFor="provider">Voice Provider</Label>
                                    <Select
                                        value={formData.provider}
                                        onValueChange={(value) => setFormData(f => ({ ...f, provider: value }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Provider" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ELEVEN_LABS">ElevenLabs</SelectItem>
                                            <SelectItem value="GOOGLE">Google Cloud</SelectItem>
                                            <SelectItem value="OPENAI">OpenAI TTS</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2 flex-1">
                                    <Label htmlFor="voiceId">Voice ID</Label>
                                    <Input
                                        id="voiceId"
                                        value={formData.voiceId}
                                        onChange={(e) => setFormData(f => ({ ...f, voiceId: e.target.value }))}
                                        placeholder="Voice ID/Name"
                                    />
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleSubmit} disabled={!formData.name}>
                                {editingAvatar ? 'Update' : 'Create'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Avatar Grid */}
            {isLoading ? (
                <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {avatars.map((avatar) => (
                        <Card key={avatar.id} className={cn("transition-all", !avatar.isActive && 'opacity-60 grayscale-[0.5]')}>
                            <CardHeader className="pb-2">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center overflow-hidden border-2 border-background shadow-sm relative">
                                            {avatar.avatarUrl ? (
                                                <Image
                                                    src={avatar.avatarUrl}
                                                    alt={avatar.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <User className="h-8 w-8 text-primary" />
                                            )}
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                {avatar.name}
                                                <span className={cn(
                                                    "text-[10px] px-1.5 py-0.5 rounded-full uppercase font-bold",
                                                    avatar.gender === 'MALE' ? 'bg-blue-100 text-blue-700' :
                                                        avatar.gender === 'FEMALE' ? 'bg-pink-100 text-pink-700' : 'bg-gray-100 text-gray-700'
                                                )}>
                                                    {avatar.gender}
                                                </span>
                                            </CardTitle>
                                            <CardDescription>{avatar.role}</CardDescription>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(avatar)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(avatar.id)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-1.5 text-muted-foreground">
                                            <Smile className="h-4 w-4" />
                                            <span>{avatar.personality}</span>
                                        </div>
                                        {avatar.voiceId && (
                                            <div className="flex items-center gap-1.5 text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground">
                                                <Image src={`/icons/${avatar.provider?.toLowerCase()}.png`} width={12} height={12} alt="" className="hidden" />
                                                <span>{avatar.provider === 'ELEVEN_LABS' ? 'Eleven' : 'Google'}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between pt-2">
                                        <span className={cn(
                                            "text-xs font-medium",
                                            avatar.isActive ? "text-green-600" : "text-muted-foreground"
                                        )}>
                                            {avatar.isActive ? 'Ready for Interviews' : 'Temporarily Disabled'}
                                        </span>
                                        <Button
                                            variant={avatar.isActive ? "default" : "outline"}
                                            size="sm"
                                            className="h-8"
                                            onClick={() => toggleActive(avatar)}
                                        >
                                            {avatar.isActive ? 'Active' : 'Inactive'}
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {avatars.length === 0 && (
                        <div className="col-span-full py-20 text-center border-2 border-dashed rounded-2xl border-muted">
                            <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                            <p className="text-muted-foreground">No custom avatars yet. Click &apos;Add Avatar&apos; to get started.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
