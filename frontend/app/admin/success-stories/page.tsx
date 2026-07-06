"use client"

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { Loader2, Plus, Edit, Trash2, Image as ImageIcon } from 'lucide-react'
import api from '@/lib/api'

interface SuccessStory {
    id: string
    imagePath: string
    url: string | null
    altText: string | null
    isActive: boolean
    order: number
    createdAt: string
}

export default function AdminSuccessStoriesPage() {
    const [stories, setStories] = React.useState<SuccessStory[]>([])
    const [isLoading, setIsLoading] = React.useState(true)

    // Modals
    const [isAddOpen, setIsAddOpen] = React.useState(false)
    const [editingStoryId, setEditingStoryId] = React.useState<string | null>(null)
    const [isSaving, setIsSaving] = React.useState(false)

    // Form State
    const [formData, setFormData] = React.useState({
        url: '',
        altText: '',
        isActive: true,
        order: '0'
    })
    const [imageFile, setImageFile] = React.useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = React.useState<string | null>(null)

    const fetchStories = React.useCallback(async () => {
        setIsLoading(true)
        try {
            const res = await api.get('/success-stories/admin')
            setStories(res.data || [])
        } catch (error) {
            console.error('Failed to fetch success stories:', error)
            toast.error('Failed to load success stories')
        } finally {
            setIsLoading(false)
        }
    }, [])

    React.useEffect(() => {
        fetchStories()
    }, [fetchStories])

    const resetForm = () => {
        setFormData({
            url: '',
            altText: '',
            isActive: true,
            order: '0'
        })
        setImageFile(null)
        setPreviewUrl(null)
        setEditingStoryId(null)
    }

    const handleEdit = (story: SuccessStory) => {
        setFormData({
            url: story.url || '',
            altText: story.altText || '',
            isActive: story.isActive,
            order: story.order.toString()
        })
        setImageFile(null)
        setPreviewUrl(`${process.env.NEXT_PUBLIC_API_URL}${story.imagePath}`)
        setEditingStoryId(story.id)
        setIsAddOpen(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this success story?')) return
        try {
            await api.delete(`/success-stories/${id}`)
            toast.success('Story deleted successfully')
            fetchStories()
        } catch (error) {
            console.error('Delete error', error)
            toast.error('Failed to delete story')
        }
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingStoryId && !imageFile) {
            toast.error("Please select an image file")
            return
        }

        setIsSaving(true)
        try {
            const data = new FormData()
            data.append('url', formData.url)
            data.append('altText', formData.altText)
            data.append('isActive', formData.isActive.toString())
            data.append('order', formData.order)
            
            if (imageFile) {
                data.append('image', imageFile)
            }

            if (editingStoryId) {
                await api.put(`/success-stories/${editingStoryId}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                })
                toast.success('Story updated successfully')
            } else {
                await api.post('/success-stories', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                })
                toast.success('Story created successfully')
            }
            setIsAddOpen(false)
            fetchStories()
        } catch (error) {
            console.error('Save error', error)
            toast.error('Failed to save story')
        } finally {
            setIsSaving(false)
        }
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            setImageFile(file)
            setPreviewUrl(URL.createObjectURL(file))
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Success Stories</h1>
                    <p className="text-muted-foreground">Manage student success stories, reviews, and testimonials.</p>
                </div>
                <Button onClick={() => { resetForm(); setIsAddOpen(true); }} className="bg-indigo-600 hover:bg-indigo-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Story
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Success Stories</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead>Image Preview</TableHead>
                                <TableHead>Alt Text / Details</TableHead>
                                <TableHead>Redirect URL</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Order</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center">
                                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-indigo-500 mb-2" />
                                        Fetching stories...
                                    </TableCell>
                                </TableRow>
                            ) : stories.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                                        No success stories found. Add one to get started.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                stories.map((story) => (
                                    <TableRow key={story.id}>
                                        <TableCell>
                                            <div className="w-24 h-16 border rounded bg-muted/30 flex items-center justify-center overflow-hidden">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img 
                                                    src={`${process.env.NEXT_PUBLIC_API_URL}${story.imagePath}`} 
                                                    alt={story.altText || "Story"} 
                                                    className="w-full h-full object-contain"
                                                />
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{story.altText || "N/A"}</div>
                                            <div className="text-xs text-muted-foreground mt-1">
                                                Added: {format(new Date(story.createdAt), 'dd MMM yyyy')}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {story.url ? (
                                                <a href={story.url} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline text-sm truncate max-w-[200px] block">
                                                    {story.url}
                                                </a>
                                            ) : (
                                                <span className="text-muted-foreground text-sm">None</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={story.isActive ? 'default' : 'secondary'} className={story.isActive ? 'bg-emerald-500 hover:bg-emerald-600' : ''}>
                                                {story.isActive ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {story.order}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => handleEdit(story)}>
                                                    <Edit className="w-4 h-4 text-slate-500" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(story.id)}>
                                                    <Trash2 className="w-4 h-4 text-red-500" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Add / Edit Modal */}
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingStoryId ? 'Edit Success Story' : 'Add Success Story'}</DialogTitle>
                        <DialogDescription>Upload a screenshot of a review and provide an optional link.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSave} className="space-y-6 py-4">
                        
                        <div className="space-y-2">
                            <Label>Review Screenshot (Image)</Label>
                            <Input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleImageChange} 
                                required={!editingStoryId} 
                            />
                            {previewUrl && (
                                <div className="mt-4 w-full h-40 border rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img 
                                        src={previewUrl} 
                                        alt="Preview" 
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label>Redirect URL (e.g. Google Review Link)</Label>
                            <Input 
                                type="url" 
                                value={formData.url} 
                                onChange={e => setFormData({...formData, url: e.target.value})} 
                                placeholder="https://g.page/review/..." 
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Alt Text</Label>
                            <Input 
                                type="text" 
                                value={formData.altText} 
                                onChange={e => setFormData({...formData, altText: e.target.value})} 
                                placeholder="E.g. 5-star Google Review" 
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Display Order</Label>
                                <Input 
                                    type="number" 
                                    value={formData.order} 
                                    onChange={e => setFormData({...formData, order: e.target.value})} 
                                />
                            </div>
                            
                            <div className="flex flex-col justify-center space-y-2">
                                <Label>Status</Label>
                                <div className="flex items-center space-x-2">
                                    <Switch 
                                        checked={formData.isActive} 
                                        onCheckedChange={(checked) => setFormData({...formData, isActive: checked})} 
                                    />
                                    <Label className="font-normal">{formData.isActive ? 'Active' : 'Inactive'}</Label>
                                </div>
                            </div>
                        </div>
                        
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={isSaving} className="bg-indigo-600 hover:bg-indigo-700">
                                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Story
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
