"use client"
import * as React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import {
    Star, Plus, RefreshCcw, Loader2, AlertCircle,
    Edit, Trash2, CheckCircle, XCircle, Image as ImageIcon, ExternalLink
} from "lucide-react"
import api from "@/lib/api"

type Story = {
    id: string
    imagePath: string
    url: string | null
    altText: string
    isActive: boolean
    order: number
    createdAt: string
}

export default function SuccessStoriesPage() {
    const [stories, setStories] = useState<Story[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingStory, setEditingStory] = useState<Story | null>(null)
    const [saving, setSaving] = useState(false)

    // Form state — we use a URL-based approach instead of file upload
    const [formAltText, setFormAltText] = useState("")
    const [formUrl, setFormUrl] = useState("")
    const [formOrder, setFormOrder] = useState("0")
    const [formIsActive, setFormIsActive] = useState(true)
    const [formImageUrl, setFormImageUrl] = useState("") // URL input for image
    const [imageFile, setImageFile] = useState<File | null>(null)

    const fetchStories = async () => {
        setLoading(true)
        try {
            const res = await api.get("/success-stories/admin")
            setStories(Array.isArray(res.data) ? res.data : [])
        } catch (err) {
            // fallback to public endpoint
            try {
                const res2 = await api.get("/success-stories")
                setStories(Array.isArray(res2.data) ? res2.data : [])
            } catch {
                toast({ title: "Failed to load success stories", variant: "destructive" })
            }
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchStories() }, [])

    const openCreate = () => {
        setEditingStory(null)
        setFormAltText("")
        setFormUrl("")
        setFormOrder("0")
        setFormIsActive(true)
        setFormImageUrl("")
        setImageFile(null)
        setIsModalOpen(true)
    }

    const openEdit = (story: Story) => {
        setEditingStory(story)
        setFormAltText(story.altText)
        setFormUrl(story.url || "")
        setFormOrder(String(story.order))
        setFormIsActive(story.isActive)
        setFormImageUrl("")
        setImageFile(null)
        setIsModalOpen(true)
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            const formData = new FormData()
            formData.append("altText", formAltText || "Success Story")
            formData.append("url", formUrl)
            formData.append("order", formOrder)
            formData.append("isActive", String(formIsActive))

            if (imageFile) {
                formData.append("image", imageFile)
            }

            if (editingStory) {
                await api.put(`/success-stories/${editingStory.id}`, formData, {
                    headers: { "Content-Type": "multipart/form-data" }
                })
                toast({ title: "Story updated!" })
            } else {
                if (!imageFile) {
                    toast({ title: "Please select an image file", variant: "destructive" })
                    setSaving(false)
                    return
                }
                await api.post("/success-stories", formData, {
                    headers: { "Content-Type": "multipart/form-data" }
                })
                toast({ title: "Story created!" })
            }
            setIsModalOpen(false)
            fetchStories()
        } catch (err) {
            console.error(err)
            toast({ title: "Failed to save story", variant: "destructive" })
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this success story?")) return
        try {
            await api.delete(`/success-stories/${id}`)
            toast({ title: "Deleted" })
            fetchStories()
        } catch {
            toast({ title: "Delete failed", variant: "destructive" })
        }
    }

    const handleToggle = async (story: Story) => {
        try {
            await api.put(`/success-stories/${story.id}`, {
                altText: story.altText,
                url: story.url,
                order: story.order,
                isActive: !story.isActive
            })
            toast({ title: story.isActive ? "Deactivated" : "Activated!" })
            fetchStories()
        } catch {
            toast({ title: "Update failed", variant: "destructive" })
        }
    }

    const backendBase = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:5000"

    return (
        <div className="space-y-6 p-2 md:p-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight">
                        Success <span className="text-primary">Stories</span>
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Manage showcase banners and student success story images on the platform homepage.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={fetchStories} disabled={loading}>
                        <RefreshCcw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button size="sm" className="bg-primary hover:bg-primary/90" onClick={openCreate}>
                        <Plus className="h-4 w-4 mr-2" /> Add Story
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: "Total", count: stories.length, color: "text-blue-400", bg: "bg-blue-500/10", icon: Star },
                    { label: "Active", count: stories.filter(s => s.isActive).length, color: "text-emerald-400", bg: "bg-emerald-500/10", icon: CheckCircle },
                    { label: "Inactive", count: stories.filter(s => !s.isActive).length, color: "text-amber-400", bg: "bg-amber-500/10", icon: XCircle },
                ].map(({ label, count, color, bg, icon: Icon }) => (
                    <Card key={label} className="glass-card border-white/10">
                        <CardContent className="pt-6 flex items-center gap-3">
                            <div className={`p-2.5 rounded-xl ${bg} ${color}`}><Icon className="w-5 h-5" /></div>
                            <div>
                                <p className="text-2xl font-black">{count}</p>
                                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{label}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Stories Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-24">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : stories.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 opacity-50">
                    <AlertCircle className="h-14 w-14 mb-4 opacity-30" />
                    <p className="font-bold">No stories yet</p>
                    <p className="text-xs text-muted-foreground mt-1">Click "Add Story" to upload your first success story image.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {stories.map(story => (
                        <Card key={story.id} className="glass-card border-white/10 overflow-hidden group hover:border-white/20 transition-all">
                            {/* Preview Image */}
                            <div className="relative h-44 bg-white/5 overflow-hidden">
                                {story.imagePath ? (
                                    <img
                                        src={`${backendBase}${story.imagePath}`}
                                        alt={story.altText}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        <ImageIcon className="h-16 w-16 opacity-20" />
                                    </div>
                                )}
                                <div className="absolute top-2 right-2">
                                    <Badge className={story.isActive
                                        ? "bg-emerald-500/90 text-white border-0 text-[10px] font-bold"
                                        : "bg-gray-800/90 text-gray-300 border-0 text-[10px] font-bold"
                                    }>
                                        {story.isActive ? "Active" : "Inactive"}
                                    </Badge>
                                </div>
                                <div className="absolute top-2 left-2">
                                    <Badge className="bg-black/70 text-white border-0 text-[10px] font-bold">
                                        #{story.order}
                                    </Badge>
                                </div>
                            </div>
                            <CardContent className="pt-4 pb-4">
                                <p className="font-bold text-sm">{story.altText}</p>
                                {story.url && (
                                    <a href={story.url} target="_blank" rel="noopener noreferrer"
                                        className="text-xs text-primary flex items-center gap-1 mt-1 hover:underline">
                                        <ExternalLink className="h-3 w-3" />
                                        {story.url}
                                    </a>
                                )}
                                <div className="flex gap-2 mt-3 pt-3 border-t border-white/10">
                                    <Button
                                        variant="ghost" size="sm"
                                        className={`h-8 text-xs flex-1 ${story.isActive ? 'text-amber-400 hover:bg-amber-500/10' : 'text-emerald-400 hover:bg-emerald-500/10'}`}
                                        onClick={() => handleToggle(story)}
                                    >
                                        {story.isActive ? <XCircle className="h-3.5 w-3.5 mr-1" /> : <CheckCircle className="h-3.5 w-3.5 mr-1" />}
                                        {story.isActive ? "Deactivate" : "Activate"}
                                    </Button>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-white/10" onClick={() => openEdit(story)}>
                                        <Edit className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-400 hover:bg-red-500/10" onClick={() => handleDelete(story.id)}>
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Create / Edit Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="bg-background border-border text-foreground max-w-md shadow-xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black text-foreground">
                            {editingStory ? "Edit Story" : "Add Success Story"}
                        </DialogTitle>
                        <DialogDescription className="text-foreground/70">
                            Upload a success story image to showcase on the homepage.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-3">
                        {!editingStory && (
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-foreground uppercase tracking-wider">Image File *</label>
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={e => setImageFile(e.target.files?.[0] || null)}
                                    className="border-border bg-background text-foreground rounded-xl"
                                />
                            </div>
                        )}
                        {editingStory && (
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-foreground uppercase tracking-wider">Replace Image (optional)</label>
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={e => setImageFile(e.target.files?.[0] || null)}
                                    className="border-border bg-background text-foreground rounded-xl"
                                />
                            </div>
                        )}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-foreground uppercase tracking-wider">Alt Text / Description</label>
                            <Input
                                placeholder="Student name or brief description"
                                value={formAltText}
                                onChange={e => setFormAltText(e.target.value)}
                                className="border-border bg-background text-foreground rounded-xl"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-foreground uppercase tracking-wider">Link URL (optional)</label>
                            <Input
                                placeholder="https://..."
                                value={formUrl}
                                onChange={e => setFormUrl(e.target.value)}
                                className="border-border bg-background text-foreground rounded-xl"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-foreground uppercase tracking-wider">Display Order</label>
                            <Input
                                type="number"
                                placeholder="0"
                                value={formOrder}
                                onChange={e => setFormOrder(e.target.value)}
                                className="border-border bg-background text-foreground rounded-xl"
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <input type="checkbox" id="active" checked={formIsActive} onChange={e => setFormIsActive(e.target.checked)} className="w-4 h-4 accent-primary" />
                            <label htmlFor="active" className="text-sm font-medium">Active (shown on site)</label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="rounded-xl">Cancel</Button>
                        <Button className="rounded-xl bg-primary hover:bg-primary/90" onClick={handleSave} disabled={saving}>
                            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            {editingStory ? "Save Changes" : "Upload Story"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
