"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, Send, Edit, FileText } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

export default function NewslettersPage() {
    const { user, isAuthenticated } = useAuth()
    const router = useRouter()
    const { toast } = useToast()
    const [newsletters, setNewsletters] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    
    // Form state
    const [subject, setSubject] = useState("")
    const [content, setContent] = useState("")

    const fetchNewsletters = async () => {
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
            const token = localStorage.getItem('token')
            const res = await fetch(`${API_URL}/newsletter`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setNewsletters(data.newsletters || data)
            }
        } catch (error) {
            console.error("Failed to fetch newsletters", error)
            toast({ title: "Error", description: "Failed to fetch newsletters", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (!isAuthenticated) return;
        if (!['ADMIN', 'SUPER_ADMIN'].includes(user?.role ?? '')) {
            router.push('/admin')
            return;
        }
        fetchNewsletters()
    }, [user, isAuthenticated, router])

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this newsletter?")) return;
        
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
            const token = localStorage.getItem('token')
            const res = await fetch(`${API_URL}/newsletter/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) {
                toast({ title: "Success", description: "Newsletter deleted" })
                fetchNewsletters()
            } else {
                toast({ title: "Error", description: "Failed to delete newsletter", variant: "destructive" })
            }
        } catch (error) {
            console.error(error)
            toast({ title: "Error", description: "An error occurred", variant: "destructive" })
        }
    }

    const handlePublish = async (id: string) => {
        if (!confirm("Are you sure you want to send this newsletter to all active leads?")) return;
        
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
            const token = localStorage.getItem('token')
            const res = await fetch(`${API_URL}/newsletter/${id}/publish`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) {
                toast({ title: "Success", description: "Newsletter published & sent successfully" })
                fetchNewsletters()
            } else {
                toast({ title: "Error", description: "Failed to publish newsletter", variant: "destructive" })
            }
        } catch (error) {
            console.error(error)
            toast({ title: "Error", description: "An error occurred", variant: "destructive" })
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!subject || !content) {
            toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" })
            return
        }

        setIsSubmitting(true)
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
            const token = localStorage.getItem('token')
            
            const res = await fetch(`${API_URL}/newsletter`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ subject, content, status: 'DRAFT' })
            })

            if (res.ok) {
                toast({ title: "Success", description: "Newsletter draft created" })
                setIsModalOpen(false)
                setSubject("")
                setContent("")
                fetchNewsletters()
            } else {
                const data = await res.json()
                toast({ title: "Error", description: data.error || "Failed to create draft", variant: "destructive" })
            }
        } catch (error) {
            console.error(error)
            toast({ title: "Error", description: "An error occurred", variant: "destructive" })
        } finally {
            setIsSubmitting(false)
        }
    }

    if (loading) return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>

    return (
        <div className="p-8 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Newsletters</h1>
                    <p className="text-muted-foreground mt-1">Manage email marketing campaigns for leads and subscribers.</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" /> Create Draft
                </Button>
            </div>
            
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Subject</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Sent To</TableHead>
                                <TableHead>Created At</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {newsletters.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                        No newsletters found. Create one to get started.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                newsletters.map((nl) => (
                                    <TableRow key={nl.id}>
                                        <TableCell>
                                            <div className="font-medium flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-muted-foreground" />
                                                {nl.subject}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={nl.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                                                {nl.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {nl.sentCount || 0} users
                                        </TableCell>
                                        <TableCell>
                                            {format(new Date(nl.createdAt), 'MMM d, yyyy')}
                                        </TableCell>
                                        <TableCell className="text-right space-x-2">
                                            {nl.status === 'DRAFT' && (
                                                <Button variant="outline" size="sm" onClick={() => handlePublish(nl.id)}>
                                                    <Send className="w-4 h-4 mr-1" /> Send
                                                </Button>
                                            )}
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(nl.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Create Newsletter Draft</DialogTitle>
                        <DialogDescription>Draft your email content. You can send it later.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="subject">Email Subject</Label>
                            <Input 
                                id="subject" 
                                value={subject} 
                                onChange={(e) => setSubject(e.target.value)} 
                                placeholder="Exciting news from Techwell!"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="content">Email Content (HTML Supported)</Label>
                            <Textarea 
                                id="content" 
                                value={content} 
                                onChange={(e) => setContent(e.target.value)} 
                                placeholder="<p>Hello there,</p>"
                                rows={10}
                                required
                            />
                        </div>
                        <DialogFooter className="mt-6">
                            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Saving...' : 'Save Draft'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
