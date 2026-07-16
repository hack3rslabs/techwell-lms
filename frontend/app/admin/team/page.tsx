"use client"

import * as React from 'react'
import axios from 'axios'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Plus, Edit, Trash2, Check, X, ShieldAlert, Sparkles, Image as ImageIcon, Linkedin } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/lib/auth-context'

interface TeamMember {
    id: string
    name: string
    designation: string
    description: string | null
    photoUrl: string | null
    linkedinUrl: string | null
    orderIndex: number
    isActive: boolean
}

export default function AdminTeamPage() {
    const { hasPermission } = useAuth()
    const [team, setTeam] = React.useState<TeamMember[]>([])
    const [loadingData, setLoadingData] = React.useState(true)

    const [editingMember, setEditingMember] = React.useState<Partial<TeamMember> | null>(null)
    const [isSaving, setIsSaving] = React.useState(false)

    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
    const getHeaders = () => {
        const token = localStorage.getItem('token')
        return { headers: { Authorization: `Bearer ${token}` } }
    }

    async function fetchData() {
        setLoadingData(true)
        try {
            const res = await axios.get(`${apiBase}/team/admin`, getHeaders())
            setTeam(res.data)
        } catch (error) {
            console.error(error)
            toast.error('Failed to load team data')
        } finally {
            setLoadingData(false)
        }
    }


    React.useEffect(() => {
        if (hasPermission('TEAM_MANAGEMENT')) {
            fetchData()
        } else {
            setLoadingData(false)
        }
    }, [hasPermission])


    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingMember) return
        setIsSaving(true)
        try {
            if (editingMember.id) {
                await axios.put(`${apiBase}/team/admin/${editingMember.id}`, editingMember, getHeaders())
                toast.success('Team member updated successfully')
            } else {
                await axios.post(`${apiBase}/team/admin`, editingMember, getHeaders())
                toast.success('Team member added successfully')
            }
            setEditingMember(null)
            fetchData()
        } catch (error) {
            console.error(error)
            toast.error('Failed to save team member')
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this team member?')) return
        try {
            await axios.delete(`${apiBase}/team/admin/${id}`, getHeaders())
            toast.success('Team member deleted')
            fetchData()
        } catch (error) {
            console.error(error)
            toast.error('Failed to delete team member')
        }
    }

    if (!hasPermission('TEAM_MANAGEMENT')) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <ShieldAlert className="h-16 w-16 text-muted-foreground mb-4" />
                <h2 className="text-2xl font-bold">Access Denied</h2>
                <p className="text-muted-foreground mt-2">You do not have permission to access Team Management.</p>
            </div>
        )
    }

    return (
        <div className="space-y-8 p-6 pb-20 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight italic uppercase">
                        Team <span className="text-primary">Management</span>
                    </h1>
                    <p className="text-muted-foreground text-sm">Add and arrange team members for the public page.</p>
                </div>
                <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg" onClick={() => setEditingMember({
                    name: '', designation: '', description: '', photoUrl: '', linkedinUrl: '', orderIndex: 0, isActive: true
                })}>
                    <Plus className="h-4 w-4 mr-2" /> Add Member
                </Button>
            </div>

            {loadingData ? (
                <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {team.map((member) => (
                        <Card key={member.id} className="glass-card border-border relative group overflow-hidden">
                            {!member.isActive && (
                                <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg z-10">
                                    INACTIVE
                                </div>
                            )}
                            <CardHeader className="pb-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-full bg-muted border border-border overflow-hidden flex items-center justify-center shrink-0">
                                        {member.photoUrl ? (
                                            <img src={member.photoUrl} alt={member.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <ImageIcon className="h-6 w-6 text-muted-foreground" />
                                        )}
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">{member.name}</CardTitle>
                                        <CardDescription className="text-primary font-medium">{member.designation}</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{member.description || 'No description provided.'}</p>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" className="flex-1" onClick={() => setEditingMember(member)}>
                                        <Edit className="h-3 w-3 mr-1" /> Edit
                                    </Button>
                                    <Button variant="destructive" size="sm" onClick={() => handleDelete(member.id)}>
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    
                    {team.length === 0 && (
                        <div className="col-span-full text-center py-12 bg-muted/20 rounded-xl border border-dashed border-border">
                            <p className="text-muted-foreground font-medium">No team members added yet.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Editing Modal */}
            {editingMember && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <Card className="w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200">
                        <CardHeader className="bg-muted/50 border-b border-border">
                            <CardTitle className="text-xl">{editingMember.id ? 'Edit Team Member' : 'New Team Member'}</CardTitle>
                        </CardHeader>
                        <form onSubmit={handleSave}>
                            <CardContent className="space-y-4 pt-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase">Name</label>
                                        <Input required value={editingMember.name || ''} onChange={e => setEditingMember({ ...editingMember, name: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase">Designation</label>
                                        <Input required value={editingMember.designation || ''} onChange={e => setEditingMember({ ...editingMember, designation: e.target.value })} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase">Description</label>
                                    <Textarea rows={3} value={editingMember.description || ''} onChange={e => setEditingMember({ ...editingMember, description: e.target.value })} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase">Photo URL</label>
                                        <Input placeholder="https://..." value={editingMember.photoUrl || ''} onChange={e => setEditingMember({ ...editingMember, photoUrl: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase">LinkedIn URL</label>
                                        <Input placeholder="https://linkedin.com/in/..." value={editingMember.linkedinUrl || ''} onChange={e => setEditingMember({ ...editingMember, linkedinUrl: e.target.value })} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase">Display Order (Lower = First)</label>
                                        <Input type="number" value={editingMember.orderIndex || 0} onChange={e => setEditingMember({ ...editingMember, orderIndex: parseInt(e.target.value) || 0 })} />
                                    </div>
                                    <div className="space-y-2 flex flex-col justify-end">
                                        <label className="flex items-center gap-2 cursor-pointer p-2 border border-border rounded-md bg-muted/30">
                                            <input type="checkbox" className="w-4 h-4" checked={editingMember.isActive !== false} onChange={e => setEditingMember({ ...editingMember, isActive: e.target.checked })} />
                                            <span className="text-sm font-medium">Active (Visible to Public)</span>
                                        </label>
                                    </div>
                                </div>
                            </CardContent>
                            <div className="flex justify-end gap-3 p-6 border-t border-border bg-muted/20">
                                <Button type="button" variant="outline" onClick={() => setEditingMember(null)} disabled={isSaving}>Cancel</Button>
                                <Button type="submit" className="bg-primary text-white" disabled={isSaving}>
                                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
                                    Save
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    )
}
