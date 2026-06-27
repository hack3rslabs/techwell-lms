"use client"

import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Trash2, Loader2, Link2, ExternalLink } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import api from '@/lib/api'

export default function AdsManagerPage() {
    const [ads, setAds] = React.useState<any[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [isDialogOpen, setIsDialogOpen] = React.useState(false)
    const [isSubmitting, setIsSubmitting] = React.useState(false)

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
            console.error('Failed to fetch ads:', error)
        } finally {
            setIsLoading(false)
        }
    }, [])

    React.useEffect(() => {
        fetchAds()
    }, [fetchAds])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            const payload = {
                ...formData,
                isPermanent: formData.isPermanent === 'true',
                autoRenewal: formData.autoRenewal === 'true'
            }
            await api.post('/ads', payload)
            setIsDialogOpen(false)
            setFormData({ title: '', businessName: '', contactInfo: '', imageUrl: '', targetUrl: '', position: 'RIGHT_1', status: 'ACTIVE', durationDays: '7', isPermanent: 'false', autoRenewal: 'false' })
            fetchAds()
        } catch (error) {
            console.error('Failed to create ad:', error)
            alert('Failed to create Ad.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this ad?')) return
        try {
            await api.delete(`/ads/${id}`)
            fetchAds()
        } catch (error) {
            console.error('Failed to delete ad:', error)
        }
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Ads Manager</h1>
                    <p className="text-muted-foreground mt-2">Manage promotional banners across the application.</p>
                </div>
                <Button onClick={() => setIsDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Ad
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Active Banners</CardTitle>
                    <CardDescription>Banners displayed on the public events page.</CardDescription>
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
                                                <div className="w-16 h-16 rounded overflow-hidden border bg-slate-50 flex items-center justify-center">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
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
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(ad.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
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
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Ad Banner</DialogTitle>
                        <DialogDescription>Add a new promotional banner to the platform.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label>Title / Internal Name</Label>
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
                        <div className="space-y-2">
                            <Label>Image URL</Label>
                            <Input required type="url" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} placeholder="https://example.com/banner.jpg" />
                            <p className="text-xs text-muted-foreground">For best results, use vertical banners for sidebars.</p>
                        </div>
                        <div className="space-y-2">
                            <Label>Target Link (Optional)</Label>
                            <Input type="url" value={formData.targetUrl} onChange={e => setFormData({...formData, targetUrl: e.target.value})} placeholder="Where should this ad click to?" />
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
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Create Ad
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
