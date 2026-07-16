"use client"
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Loader2, Plus, Send, Edit, Trash2, Mail } from "lucide-react"
import { toast } from "react-hot-toast"
import api from "@/lib/api"

export default function NewslettersPage() {
    const [newsletters, setNewsletters] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [subject, setSubject] = useState("")
    const [htmlContent, setHtmlContent] = useState("")
    const [editingId, setEditingId] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const fetchNewsletters = async () => {
        try {
            const res = await api.get('/admin/newsletters')
            setNewsletters(res.data)
        } catch (error) {
            console.error(error)
            toast.error("Failed to load newsletters")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchNewsletters()
    }, [])

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            if (editingId) {
                await api.put(`/admin/newsletters/${editingId}`, { subject, htmlContent })
                toast.success("Newsletter updated")
            } else {
                await api.post('/admin/newsletters', { subject, htmlContent })
                toast.success("Newsletter drafted")
            }
            setIsDialogOpen(false)
            fetchNewsletters()
        } catch (error) {
            toast.error("Failed to save newsletter")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this newsletter?")) return
        try {
            await api.delete(`/admin/newsletters/${id}`)
            toast.success("Newsletter deleted")
            fetchNewsletters()
        } catch (error) {
            toast.error("Failed to delete")
        }
    }

    const handlePublish = async (id: string) => {
        if (!confirm("Are you sure you want to PUBLISH and SEND this newsletter to all subscribers?")) return
        try {
            const res = await api.post(`/admin/newsletters/${id}/publish`)
            toast.success(res.data.message || "Newsletter sent successfully!")
            fetchNewsletters()
        } catch (error) {
            toast.error("Failed to publish newsletter")
        }
    }

    const resetForm = () => {
        setSubject("")
        setHtmlContent("")
        setEditingId(null)
    }

    return (
        <div className="container py-8 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Newsletters</h1>
                    <p className="text-muted-foreground mt-1">Compose and send emails to your leads and subscribers.</p>
                </div>
                
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="flex items-center gap-2" onClick={() => { resetForm(); setIsDialogOpen(true); }}>
                            <Plus className="w-4 h-4" /> New Campaign
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                        <DialogHeader>
                            <DialogTitle>{editingId ? "Edit Newsletter" : "Draft Newsletter"}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium mb-1 block">Subject Line</label>
                                <Input 
                                    value={subject}
                                    onChange={e => setSubject(e.target.value)}
                                    placeholder="Check out our latest news!"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">HTML Content</label>
                                <textarea 
                                    className="w-full h-64 border rounded-md p-3 text-sm font-mono focus:ring-1 focus:ring-primary"
                                    value={htmlContent}
                                    onChange={e => setHtmlContent(e.target.value)}
                                    placeholder="<h1>Hello World</h1><p>Welcome to our newsletter.</p>"
                                    required
                                />
                            </div>
                            <Button type="submit" disabled={isSubmitting} className="w-full">
                                {isSubmitting ? "Saving..." : "Save Draft"}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin" /></div>
            ) : newsletters.length === 0 ? (
                <div className="text-center py-12 border border-dashed rounded-xl bg-muted/20">
                    <Mail className="w-12 h-12 mx-auto text-muted-foreground mb-3 opacity-50" />
                    <h3 className="text-lg font-medium">No newsletters yet</h3>
                    <p className="text-sm text-muted-foreground">Draft your first campaign to get started.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {newsletters.map(nl => (
                        <Card key={nl.id} className="hover:border-primary/50 transition-colors">
                            <CardHeader className="flex flex-row items-start justify-between pb-2">
                                <div>
                                    <CardTitle className="text-lg">{nl.subject}</CardTitle>
                                    <CardDescription>Created: {new Date(nl.createdAt).toLocaleDateString()}</CardDescription>
                                </div>
                                <Badge variant={nl.status === 'PUBLISHED' ? "default" : "secondary"}>
                                    {nl.status}
                                </Badge>
                            </CardHeader>
                            <CardContent className="flex justify-between items-center">
                                <div className="text-sm text-muted-foreground">
                                    {nl.sentAt ? `Sent on: ${new Date(nl.sentAt).toLocaleString()}` : "Not sent yet"}
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={() => {
                                        setEditingId(nl.id);
                                        setSubject(nl.subject);
                                        setHtmlContent(nl.htmlContent);
                                        setIsDialogOpen(true);
                                    }} disabled={nl.status === 'PUBLISHED'}>
                                        <Edit className="w-4 h-4 mr-1" /> Edit
                                    </Button>
                                    <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(nl.id)}>
                                        <Trash2 className="w-4 h-4 mr-1" /> Delete
                                    </Button>
                                    {nl.status === 'DRAFT' && (
                                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handlePublish(nl.id)}>
                                            <Send className="w-4 h-4 mr-1" /> Publish
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
