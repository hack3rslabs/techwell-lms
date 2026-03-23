
"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Plus, Search, Edit, Trash2, Video, User, Briefcase, Linkedin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

interface Skillcast {
    id: string
    title: string
    description: string
    videoUrl: string
    expertName: string
    designation: string
    company: string
    linkedinUrl: string
    experience: string
    thumbnail?: string
}

export default function AdminSkillcastPage() {
    const [skillcasts, setSkillcasts] = useState<Skillcast[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<Skillcast | null>(null)

    // Form Stats
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        videoUrl: "",
        expertName: "",
        designation: "",
        company: "",
        linkedinUrl: "",
        experience: "",
        thumbnail: ""
    })

    useEffect(() => {
        fetchSkillcasts()
    }, [])

    const fetchSkillcasts = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/skillcasts`)
            if (res.ok) {
                const data = await res.json()
                setSkillcasts(Array.isArray(data) ? data : [])
            }
        } catch (error) {
            console.error(error)
            toast.error("Failed to fetch skillcasts")
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const url = editingItem
                ? `${process.env.NEXT_PUBLIC_API_URL}/skillcasts/${editingItem.id}`
                : `${process.env.NEXT_PUBLIC_API_URL}/skillcasts`

            const method = editingItem ? "PUT" : "POST"

            const token = localStorage.getItem("token") // Assuming auth token is stored here

            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            })

            if (res.ok) {
                toast.success(editingItem ? "Skillcast updated" : "Skillcast created")
                fetchSkillcasts()
                setIsDialogOpen(false)
                resetForm()
            } else {
                toast.error("Failed to save skillcast")
            }
        } catch (error) {
            console.error(error)
            toast.error("An error occurred")
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this skillcast?")) return

        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/skillcasts/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            })

            if (res.ok) {
                toast.success("Skillcast deleted")
                fetchSkillcasts()
            } else {
                toast.error("Failed to delete")
            }
        } catch (error) {
            console.error(error)
            toast.error("Error deleting skillcast")
        }
    }

    const handleEdit = (item: any) => {
        setEditingItem(item)
        setFormData({
            title: item.title,
            description: item.description,
            videoUrl: item.videoUrl,
            expertName: item.expertName,
            designation: item.designation,
            company: item.company,
            linkedinUrl: item.linkedinUrl || "",
            experience: item.experience || "",
            thumbnail: item.thumbnail || ""
        })
        setIsDialogOpen(true)
    }

    const resetForm = () => {
        setEditingItem(null)
        setFormData({
            title: "",
            description: "",
            videoUrl: "",
            expertName: "",
            designation: "",
            company: "",
            linkedinUrl: "",
            experience: "",
            thumbnail: ""
        })
    }

    const filteredSkillcasts = skillcasts.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.expertName.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Skillcast Management</h1>
                    <p className="text-muted-foreground">Manage expert interviews and video content.</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                    setIsDialogOpen(open)
                    if (!open) resetForm()
                }}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="w-4 h-4" /> Add Skillcast
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editingItem ? "Edit Skillcast" : "Add New Skillcast"}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2 col-span-2">
                                    <Label>Title</Label>
                                    <Input
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        required
                                        placeholder="e.g., The Future of AI in Tech"
                                    />
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <Label>Description</Label>
                                    <Textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        required
                                        placeholder="Brief summary of the interview..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Video URL</Label>
                                    <Input
                                        value={formData.videoUrl}
                                        onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                                        required
                                        placeholder="YouTube or MP4 URL"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Thumbnail URL (Optional)</Label>
                                    <Input
                                        value={formData.thumbnail}
                                        onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                                        placeholder="https://..."
                                    />
                                </div>

                                <div className="col-span-2 border-t pt-4 mt-2">
                                    <h4 className="font-medium mb-4 flex items-center gap-2">
                                        <User className="w-4 h-4" /> Expert Details
                                    </h4>
                                </div>

                                <div className="space-y-2">
                                    <Label>Expert Name</Label>
                                    <Input
                                        value={formData.expertName}
                                        onChange={(e) => setFormData({ ...formData, expertName: e.target.value })}
                                        required
                                        placeholder="e.g., John Doe"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Designation</Label>
                                    <Input
                                        value={formData.designation}
                                        onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                                        required
                                        placeholder="e.g., CTO"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Company</Label>
                                    <Input
                                        value={formData.company}
                                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                        required
                                        placeholder="e.g., TechCorp"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Experience</Label>
                                    <Input
                                        value={formData.experience}
                                        onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                                        placeholder="e.g., 10+ Years"
                                    />
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <Label>LinkedIn URL (Optional)</Label>
                                    <div className="flex items-center gap-2">
                                        <Linkedin className="w-4 h-4 text-muted-foreground" />
                                        <Input
                                            value={formData.linkedinUrl}
                                            onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                                            placeholder="https://linkedin.com/in/..."
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit">
                                    {editingItem ? "Update Skillcast" : "Create Skillcast"}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Search Filter */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search by title or expert..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <p>Loading...</p>
                ) : filteredSkillcasts.length === 0 ? (
                    <div className="col-span-full text-center py-10 text-muted-foreground">
                        No skillcasts found. Add your first one!
                    </div>
                ) : (
                    filteredSkillcasts.map((item) => (
                        <Card key={item.id} className="overflow-hidden group">
                            <CardHeader className="p-0">
                                <div className="aspect-video relative bg-muted">
                                    {item.thumbnail ? (
                                        <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                            <Video className="w-10 h-10 opacity-20" />
                                        </div>
                                    )}
                                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button size="icon" variant="secondary" className="h-8 w-8" onClick={() => handleEdit(item)}>
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button size="icon" variant="destructive" className="h-8 w-8" onClick={() => handleDelete(item.id)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 space-y-3">
                                <div>
                                    <h3 className="font-semibold line-clamp-1">{item.title}</h3>
                                    <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                                </div>
                                <div className="flex items-center gap-3 pt-2 border-t text-sm">
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                        <User className="w-4 h-4 text-primary" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="font-medium truncate">{item.expertName}</div>
                                        <div className="text-xs text-muted-foreground truncate">{item.designation}, {item.company}</div>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {item.experience && <Badge variant="secondary" className="text-[10px]">{item.experience} Exp</Badge>}
                                    {item.linkedinUrl && <Badge variant="outline" className="text-[10px] gap-1"><Linkedin className="w-3 h-3" /> Linked</Badge>}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
