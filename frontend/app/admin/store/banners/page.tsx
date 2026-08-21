"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Trash2, Image as ImageIcon } from "lucide-react"
import api from "@/lib/api"
import { toast } from "sonner"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"

export default function AdminBannersPage() {
    const [banners, setBanners] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    // Form State
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        imageUrl: "",
        targetUrl: "",
        ctaText: "Shop Now",
        isActive: true,
        displayOrder: "0"
    })

    useEffect(() => {
        fetchBanners()
    }, [])

    const fetchBanners = async () => {
        try {
            const res = await api.get('/shop/admin/banners')
            setBanners(res.data?.data?.banners || [])
        } catch (error) {
            toast.error("Failed to fetch banners")
        } finally {
            setIsLoading(false)
        }
    }

    const handleOpenDialog = (banner?: any) => {
        if (banner) {
            setEditingId(banner.id)
            setFormData({
                title: banner.title,
                description: banner.description || "",
                imageUrl: banner.imageUrl,
                targetUrl: banner.targetUrl || "",
                ctaText: banner.ctaText || "Shop Now",
                isActive: banner.isActive,
                displayOrder: banner.displayOrder ? banner.displayOrder.toString() : "0"
            })
        } else {
            setEditingId(null)
            setFormData({
                title: "",
                description: "",
                imageUrl: "",
                targetUrl: "",
                ctaText: "Shop Now",
                isActive: true,
                displayOrder: "0"
            })
        }
        setIsDialogOpen(true)
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const payload = {
                ...formData,
                displayOrder: parseInt(formData.displayOrder) || 0
            }

            if (editingId) {
                await api.put(`/shop/admin/banners/${editingId}`, payload)
                toast.success("Banner updated")
            } else {
                await api.post('/shop/admin/banners', payload)
                toast.success("Banner created")
            }
            setIsDialogOpen(false)
            fetchBanners()
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to save banner")
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this banner?")) return
        try {
            await api.delete(`/shop/admin/banners/${id}`)
            toast.success("Banner deleted")
            fetchBanners()
        } catch (error) {
            toast.error("Failed to delete banner")
        }
    }

    return (
        <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-emerald-500/10 via-emerald-500/10 to-transparent p-6 rounded-2xl border border-emerald-500/20">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                        <ImageIcon className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                        Shop Banners
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Manage promotional banners displayed on the storefront.</p>
                </div>
                <Button onClick={() => handleOpenDialog()} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-6 shadow-md transition-all hover:shadow-lg">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Banner
                </Button>
            </div>

            {isLoading ? (
                <div className="p-8 text-center text-muted-foreground">Loading...</div>
            ) : (
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                            <TableRow>
                                <TableHead className="w-[120px] font-semibold text-slate-700 dark:text-slate-300">Image Preview</TableHead>
                                <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Banner Details</TableHead>
                                <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Target URL</TableHead>
                                <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Status</TableHead>
                                <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Display Order</TableHead>
                                <TableHead className="text-right font-semibold text-slate-700 dark:text-slate-300">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {banners.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                                        <div className="flex flex-col items-center justify-center space-y-3">
                                            <ImageIcon className="w-10 h-10 text-slate-300" />
                                            <p>No banners found. Create one to display on the shop homepage.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                banners.map((banner) => (
                                    <TableRow key={banner.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <TableCell>
                                            <div className="w-24 h-12 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm relative">
                                                {banner.imageUrl ? (
                                                    <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex flex-col items-center justify-center text-[10px] text-slate-400">
                                                        <ImageIcon className="w-4 h-4 mb-0.5 opacity-50" />
                                                        <span>No Img</span>
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium text-slate-900 dark:text-slate-100">{banner.title}</div>
                                            <div className="text-xs text-slate-500 line-clamp-1 mt-0.5" title={banner.description}>{banner.description || "No description provided"}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded inline-block truncate max-w-[200px]" title={banner.targetUrl}>
                                                {banner.targetUrl || "N/A"}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={banner.isActive ? "default" : "secondary"} className={banner.isActive ? "bg-emerald-500 hover:bg-emerald-600" : "text-slate-500"}>
                                                {banner.isActive ? "🟢 Active" : "⚫ Hidden"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                                {banner.displayOrder}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(banner)} className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(banner.id)} className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            )}

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle>{editingId ? "Edit Banner" : "Add New Banner"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSave} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Banner Title *</Label>
                            <Input required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Student Exclusive Laptops" />
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Input value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Brief text displayed under title" />
                        </div>
                        <div className="space-y-2">
                            <Label>Image URL *</Label>
                            <Input required value={formData.imageUrl} onChange={e => setFormData({ ...formData, imageUrl: e.target.value })} placeholder="https://..." />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Target URL</Label>
                                <Input value={formData.targetUrl} onChange={e => setFormData({ ...formData, targetUrl: e.target.value })} placeholder="/shop/search?category=laptops" />
                            </div>
                            <div className="space-y-2">
                                <Label>CTA Button Text</Label>
                                <Input value={formData.ctaText} onChange={e => setFormData({ ...formData, ctaText: e.target.value })} placeholder="Shop Now" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Display Order</Label>
                                <Input type="number" value={formData.displayOrder} onChange={e => setFormData({ ...formData, displayOrder: e.target.value })} />
                            </div>
                            <div className="flex items-center gap-3 pt-8">
                                <Switch checked={formData.isActive} onCheckedChange={c => setFormData({ ...formData, isActive: c })} />
                                <Label>Active</Label>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button type="submit">Save Banner</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
