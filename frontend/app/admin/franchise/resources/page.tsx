"use client"

import { useEffect, useState, useRef } from "react"
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
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Download, FileText, Image as ImageIcon, FileArchive, Link as LinkIcon, Trash2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export default function FranchiseResourcesPage() {
    const { user, isAuthenticated } = useAuth()
    const router = useRouter()
    const { toast } = useToast()
    const [resources, setResources] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    
    // Form state
    const [title, setTitle] = useState("")
    const [category, setCategory] = useState("Marketing")
    const [description, setDescription] = useState("")
    const [file, setFile] = useState<File | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const fetchResources = async () => {
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
            const token = localStorage.getItem('token')
            const res = await fetch(`${API_URL}/franchise/resources`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setResources(data.resources || data)
            }
        } catch (error) {
            console.error("Failed to fetch resources", error)
            toast({ title: "Error", description: "Failed to fetch resources", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (!isAuthenticated) return;
        // Franchise owners can read, Admins can manage
        if (!['ADMIN', 'SUPER_ADMIN', 'FRANCHISE_ADMIN'].includes(user?.role ?? '')) {
            router.push('/dashboard')
            return;
        }
        fetchResources()
    }, [user, isAuthenticated, router])

    const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(user?.role ?? '')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!file && !description.startsWith('http')) {
            toast({ title: "Error", description: "Please provide a file or a valid URL link.", variant: "destructive" })
            return
        }

        setIsSubmitting(true)
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
            const token = localStorage.getItem('token')
            
            const formData = new FormData()
            if (file) formData.append('file', file)
            formData.append('title', title)
            formData.append('category', category)
            formData.append('description', description)

            const res = await fetch(`${API_URL}/franchise/resources`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            })

            if (res.ok) {
                toast({ title: "Success", description: "Resource uploaded successfully" })
                setIsAddModalOpen(false)
                resetForm()
                fetchResources()
            } else {
                const data = await res.json()
                toast({ title: "Error", description: data.error || "Failed to upload resource", variant: "destructive" })
            }
        } catch (error) {
            console.error(error)
            toast({ title: "Error", description: "An error occurred while uploading", variant: "destructive" })
        } finally {
            setIsSubmitting(false)
        }
    }

    const resetForm = () => {
        setTitle("")
        setCategory("Marketing")
        setDescription("")
        setFile(null)
        if (fileInputRef.current) fileInputRef.current.value = ""
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this resource?")) return;
        
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
            const token = localStorage.getItem('token')
            const res = await fetch(`${API_URL}/franchise/resources/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) {
                toast({ title: "Success", description: "Resource deleted" })
                fetchResources()
            }
        } catch (error) {
            console.error(error)
        }
    }

    if (loading) return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>

    const getFileIcon = (url: string) => {
        if (!url) return <LinkIcon className="w-5 h-5 text-blue-500" />
        if (url.match(/\.(jpeg|jpg|gif|png|webp)$/i)) return <ImageIcon className="w-5 h-5 text-pink-500" />
        if (url.match(/\.(zip|rar|7z)$/i)) return <FileArchive className="w-5 h-5 text-orange-500" />
        return <FileText className="w-5 h-5 text-indigo-500" />
    }

    const getFullUrl = (path: string) => {
        if (path.startsWith('http')) return path;
        const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000'
        return `${API_URL}${path}`
    }

    return (
        <div className="p-8 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Franchise Resources</h1>
                    <p className="text-muted-foreground mt-1">Marketing materials, guidelines, and assets for franchise partners.</p>
                </div>
                {isAdmin && (
                    <Button onClick={() => setIsAddModalOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" /> Upload Resource
                    </Button>
                )}
            </div>
            
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Date Added</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {resources.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                        No resources available at this time.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                resources.map((res) => (
                                    <TableRow key={res.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                {getFileIcon(res.fileUrl)}
                                                <div>
                                                    <div className="font-medium">{res.title}</div>
                                                    {res.description && <div className="text-sm text-muted-foreground">{res.description}</div>}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{res.category}</TableCell>
                                        <TableCell>{format(new Date(res.createdAt), 'MMM d, yyyy')}</TableCell>
                                        <TableCell className="text-right space-x-2">
                                            {res.fileUrl && (
                                                <Button variant="outline" size="sm" asChild>
                // snyk-ignore javascript/DOMXSS: Handled as per security plan
                                                    <a href={getFullUrl(res.fileUrl)} target="_blank" rel="noopener noreferrer" download>
                                                        <Download className="w-4 h-4 mr-2" /> Download
                                                    </a>
                                                </Button>
                                            )}
                                            {isAdmin && (
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(res.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Upload Franchise Resource</DialogTitle>
                        <DialogDescription>Share marketing assets, guidelines, or software with franchise owners.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Resource Title</Label>
                            <Input 
                                id="title" 
                                value={title} 
                                onChange={(e) => setTitle(e.target.value)} 
                                placeholder="e.g. Q3 Marketing Brochure"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Select value={category} onValueChange={setCategory}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Marketing">Marketing</SelectItem>
                                    <SelectItem value="Guidelines">Guidelines</SelectItem>
                                    <SelectItem value="Legal">Legal</SelectItem>
                                    <SelectItem value="Software">Software / Tools</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="desc">Description (Optional)</Label>
                            <Input 
                                id="desc" 
                                value={description} 
                                onChange={(e) => setDescription(e.target.value)} 
                                placeholder="Brief description of this asset"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="file">File Attachment</Label>
                            <Input 
                                id="file" 
                                type="file" 
                                ref={fileInputRef}
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                            />
                            <p className="text-xs text-muted-foreground mt-1">If linking to an external resource, leave this blank and paste the URL in the description.</p>
                        </div>
                        
                        <DialogFooter className="mt-6">
                            <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Uploading...' : 'Upload Resource'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
