"use client"

import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Trash2, Loader2, ExternalLink, Download, Edit, Image as ImageIcon } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import api from '@/lib/api'
import { toast } from 'sonner'

export default function AdsManagerPage() {
    const [ads, setAds] = React.useState<any[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [isDialogOpen, setIsDialogOpen] = React.useState(false)
    const [isPreviewDialogOpen, setIsPreviewDialogOpen] = React.useState(false)
    const [previewAd, setPreviewAd] = React.useState<any>(null)
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const [editId, setEditId] = React.useState<string | null>(null)
    const [uploadingImage, setUploadingImage] = React.useState(false)

    const [formData, setFormData] = React.useState({
        title: '',
        businessName: '',
        contactInfo: '',
        imageUrl: '',
        targetUrl: '',
        position: 'RIGHT_1',
        status: 'ACTIVE',
        durationDays: '7',
        isPermanent: 'false',
        autoRenewal: 'false'
    })

    const fetchAds = React.useCallback(async () => {
        setIsLoading(true)
        try {
            const res = await api.get('/ads')
            setAds(res.data.ads || [])
        } catch (error) {
            toast.error('Failed to fetch ads')
            console.error('Failed to fetch ads:', error)
        } finally {
            setIsLoading(false)
        }
    }, [])

    React.useEffect(() => {
        fetchAds()
    }, [fetchAds])

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // 1. File Size Validation (Max 2MB)
        const maxSize = 2 * 1024 * 1024
        if (file.size > maxSize) {
            toast.error('File size exceeds 2MB limit.')
            return
        }

        // 2. Pixel Quality Validation (Create Image object)
        const img = new Image()
        img.onload = async () => {
            // Validate pixels (e.g. max width 2000px, max height 2000px to ensure quality but not oversized)
            if (img.width > 2000 || img.height > 2000) {
                toast.error(`Image dimensions (${img.width}x${img.height}) are too large. Max 2000x2000 allowed.`)
                return
            }

            // Upload
            try {
                setUploadingImage(true)
                const formDataFile = new FormData()
                formDataFile.append('file', file)
                const res = await api.post('/upload', formDataFile, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                })
                
                if (res.data.url) {
                    setFormData(prev => ({ ...prev, imageUrl: res.data.url }))
                    toast.success('Image uploaded successfully')
                } else {
                    toast.error('Upload failed: No URL returned')
                }
            } catch (error) {
                console.error(error)
                toast.error('Image upload failed.')
            } finally {
                setUploadingImage(false)
            }
        }
        img.onerror = () => {
            toast.error('Invalid image file.')
        }
        img.src = URL.createObjectURL(file)
    }

    const handleTargetUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const maxSize = 2 * 1024 * 1024
        if (file.size > maxSize) {
            toast.error('File size exceeds 2MB limit.')
            return
        }

        try {
            setUploadingImage(true)
            const formDataFile = new FormData()
            formDataFile.append('file', file)
            const res = await api.post('/upload', formDataFile, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            
            if (res.data.url) {
                setFormData(prev => ({ ...prev, targetUrl: res.data.url }))
                toast.success('Target image uploaded successfully')
            } else {
                toast.error('Upload failed: No URL returned')
            }
        } catch (error) {
            console.error(error)
            toast.error('Image upload failed.')
        } finally {
            setUploadingImage(false)
        }
    }

    const openCreateDialog = () => {
        setEditId(null)
        setFormData({ title: '', businessName: '', contactInfo: '', imageUrl: '', targetUrl: '', position: 'RIGHT_1', status: 'ACTIVE', durationDays: '7', isPermanent: 'false', autoRenewal: 'false' })
        setIsDialogOpen(true)
    }

    const openEditDialog = (ad: any) => {
        setEditId(ad.id)
        setFormData({
            title: ad.title || '',
            businessName: ad.businessName || '',
            contactInfo: ad.contactInfo || '',
            imageUrl: ad.imageUrl || '',
            targetUrl: ad.targetUrl || '',
            position: ad.position || 'RIGHT_1',
            status: ad.status || 'ACTIVE',
            durationDays: String(ad.durationDays) || '7',
            isPermanent: String(ad.isPermanent) || 'false',
            autoRenewal: String(ad.autoRenewal) || 'false'
        })
        setIsDialogOpen(true)
    }

    const openPreview = (ad: any) => {
        setPreviewAd(ad)
        setIsPreviewDialogOpen(true)
    }

    const exportToCSV = () => {
        if (ads.length === 0) {
            toast.error('No ads to export.')
            return
        }
        const headers = ['ID', 'Title', 'Business', 'Position', 'Status', 'Views', 'Clicks', 'Target URL']
        const rows = ads.map(ad => [
            ad.id,
            `"${ad.title || ''}"`,
            `"${ad.businessName || ''}"`,
            ad.position,
            ad.status,
            ad.views || 0,
            ad.clicks || 0,
            `"${ad.targetUrl || ''}"`
        ])
        const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', 'Ads_Report.csv')
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.imageUrl) {
            toast.error('Please upload an image first.')
            return
        }

        setIsSubmitting(true)
        try {
            const payload = {
                ...formData,
                isPermanent: formData.isPermanent === 'true',
                autoRenewal: formData.autoRenewal === 'true'
            }
            if (editId) {
                await api.put(`/ads/${editId}`, payload)
                toast.success('Ad updated successfully')
            } else {
                await api.post('/ads', payload)
                toast.success('Ad created successfully')
            }
            
            setIsDialogOpen(false)
            fetchAds()
        } catch (error) {
            console.error('Failed to save ad:', error)
            toast.error('Failed to save Ad.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this ad?')) return
        try {
            await api.delete(`/ads/${id}`)
            toast.success('Ad deleted')
            fetchAds()
        } catch (error) {
            console.error('Failed to delete ad:', error)
            toast.error('Failed to delete ad')
        }
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Ads Manager</h1>
                    <p className="text-muted-foreground mt-2">Manage promotional banners across the application.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={exportToCSV}>
                        <Download className="w-4 h-4 mr-2" />
                        Export Report
                    </Button>
                    <Button onClick={openCreateDialog}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Ad
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Active Banners</CardTitle>
                    <CardDescription>Banners displayed on the public events page and sidebars.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="py-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
                    ) : ads.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">No ads created yet.</div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Preview</TableHead>
                                        <TableHead>Title & Business</TableHead>
                                        <TableHead>Position</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Stats (V / C)</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {ads.map((ad) => (
                                        <TableRow key={ad.id}>
                                            <TableCell>
                                                <div 
                                                    className="w-16 h-16 rounded overflow-hidden border bg-slate-50 flex items-center justify-center cursor-pointer hover:opacity-80 transition"
                                                    onClick={() => openPreview(ad)}
                                                >
                                                    { }
                                                    <img src={ad.imageUrl} alt={ad.title} className="max-w-full max-h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">{ad.title}</div>
                                                {ad.businessName && <div className="text-sm text-muted-foreground">{ad.businessName}</div>}
                                                {ad.contactInfo && <div className="text-xs text-muted-foreground">{ad.contactInfo}</div>}
                                                {ad.targetUrl && (
                                                    <a href={ad.targetUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline flex items-center gap-1 mt-1">
                                                        <ExternalLink className="w-3 h-3" /> Link
                                                    </a>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-xs font-medium bg-slate-100 px-2 py-1 rounded">
                                                    {ad.position.replace('_', ' ')}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <span className={`text-xs font-medium px-2 py-1 rounded ${ad.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                                                    {ad.status}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    <span className="font-semibold text-slate-700">{ad.views || 0}</span> views
                                                </div>
                                                <div className="text-sm">
                                                    <span className="font-semibold text-primary">{ad.clicks || 0}</span> clicks
                                                </div>
                                                <div className="text-xs text-muted-foreground mt-1">
                                                    CTR: {((ad.views > 0 ? (ad.clicks / ad.views) * 100 : 0)).toFixed(1)}%
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(ad)} className="text-blue-500 hover:text-blue-600 hover:bg-blue-50">
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(ad.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editId ? 'Edit Ad Banner' : 'Create New Ad Banner'}</DialogTitle>
                        <DialogDescription>Fill in the details for the promotional banner.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label>Title / Internal Name *</Label>
                            <Input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Summer Bootcamp Drive" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Business Name</Label>
                                <Input value={formData.businessName} onChange={e => setFormData({...formData, businessName: e.target.value})} placeholder="e.g. ABC Corp" />
                            </div>
                            <div className="space-y-2">
                                <Label>Contact Info</Label>
                                <Input value={formData.contactInfo} onChange={e => setFormData({...formData, contactInfo: e.target.value})} placeholder="e.g. Phone or Email" />
                            </div>
                        </div>
                        
                        <div className="space-y-2 border p-4 rounded-lg bg-slate-50">
                            <Label>Upload Banner Image *</Label>
                            <div className="flex items-center gap-4">
                                <Input 
                                    type="file" 
                                    accept="image/png, image/jpeg, image/gif, image/webp" 
                                    onChange={handleImageUpload} 
                                    disabled={uploadingImage}
                                />
                                {uploadingImage && <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Max file size: 2MB. Validations applied for pixel dimensions (max 2000px).
                            </p>
                            
                            {formData.imageUrl && (
                                <div className="mt-4 border rounded p-2 bg-white flex justify-center">
{/* snyk-ignore  */}
                                    <img src={formData.imageUrl} alt="Ad Preview" className="max-h-32 object-contain" />
                                </div>
                            )}
                        </div>

                        <div className="space-y-2 border p-4 rounded-lg bg-slate-50">
                            <Label>Target File (Optional)</Label>
                            <p className="text-xs text-muted-foreground mb-2">Upload a flyer or image that should open when users click the ad.</p>
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-4">
                                    <Input 
                                        type="file" 
                                        accept="image/png, image/jpeg, image/gif, image/webp, application/pdf" 
                                        onChange={handleTargetUpload} 
                                        disabled={uploadingImage}
                                    />
                                    {uploadingImage && <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />}
                                </div>
                                <div className="flex items-center gap-2 w-full">
                                    <span className="text-xs text-muted-foreground whitespace-nowrap">OR enter manual URL:</span>
                                    <Input type="url" value={formData.targetUrl} onChange={e => setFormData({...formData, targetUrl: e.target.value})} placeholder="https://..." />
                                </div>
                            </div>
                            
                            {formData.targetUrl && formData.targetUrl.startsWith('http') && (
                                <div className="mt-2 text-xs text-green-600 truncate">
                                    Linked to: {formData.targetUrl}
                                </div>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Position</Label>
                                <Select value={formData.position} onValueChange={v => setFormData({...formData, position: v})}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="LEFT_1">Left 1</SelectItem>
                                        <SelectItem value="LEFT_2">Left 2</SelectItem>
                                        <SelectItem value="RIGHT_1">Right 1</SelectItem>
                                        <SelectItem value="RIGHT_2">Right 2</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select value={formData.status} onValueChange={v => setFormData({...formData, status: v})}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ACTIVE">Active</SelectItem>
                                        <SelectItem value="INACTIVE">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Permanent Ad?</Label>
                                <Select value={formData.isPermanent} onValueChange={v => setFormData({...formData, isPermanent: v})}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="true">Yes</SelectItem>
                                        <SelectItem value="false">No</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Duration</Label>
                                <Select disabled={formData.isPermanent === 'true'} value={formData.durationDays} onValueChange={v => setFormData({...formData, durationDays: v})}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="7">7 Days</SelectItem>
                                        <SelectItem value="15">15 Days</SelectItem>
                                        <SelectItem value="30">30 Days</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Auto-Renewal</Label>
                                <Select disabled={formData.isPermanent === 'true'} value={formData.autoRenewal} onValueChange={v => setFormData({...formData, autoRenewal: v})}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="true">ON</SelectItem>
                                        <SelectItem value="false">OFF</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="pt-4 flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={isSubmitting || uploadingImage}>
                                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                {editId ? 'Save Changes' : 'Create Ad'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
                <DialogContent className="max-w-2xl text-center">
                    <DialogHeader>
                        <DialogTitle>Ad Preview: {previewAd?.title}</DialogTitle>
                    </DialogHeader>
                    {previewAd?.imageUrl && (
                        <div className="mt-4 flex justify-center border rounded p-4 bg-slate-50">
                            <img src={previewAd.imageUrl} alt="Ad Full Preview" className="max-w-full max-h-[60vh] object-contain" />
                        </div>
                    )}
                    <div className="mt-4 flex justify-center gap-4 text-sm text-muted-foreground">
                        <div>Position: <strong>{previewAd?.position}</strong></div>
                        {previewAd?.targetUrl && (
                            <div>Link: <a href={previewAd.targetUrl} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">Test Link</a></div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
