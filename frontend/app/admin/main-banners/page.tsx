"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Trash2, Image as ImageIcon, Sparkles, Target, Building2, TrendingUp, Store, GraduationCap } from "lucide-react"
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

const iconMap: Record<string, any> = {
    Sparkles,
    Target,
    Building2,
    TrendingUp,
    Store,
    GraduationCap
};

export default function MainBannersPage() {
    const [banners, setBanners] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    // Form State
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [formData, setFormData] = useState({
        titleLine1: "",
        titleLine1Highlight: "",
        titleLine2: "",
        titleLine2Highlight: "",
        description: "",
        image: "",
        badgeText: "",
        badgeIcon: "Sparkles",
        primaryCtaText: "",
        primaryCtaLink: "",
        secondaryCtaText: "",
        secondaryCtaLink: "",
        isActive: true,
        displayOrder: "0"
    })

    useEffect(() => {
        fetchBanners()
    }, [])

    const fetchBanners = async () => {
        try {
            const res = await api.get('/main-banners')
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
                titleLine1: banner.titleLine1,
                titleLine1Highlight: banner.titleLine1Highlight || "",
                titleLine2: banner.titleLine2 || "",
                titleLine2Highlight: banner.titleLine2Highlight || "",
                description: banner.description || "",
                image: banner.image,
                badgeText: banner.badgeText || "",
                badgeIcon: banner.badgeIcon || "Sparkles",
                primaryCtaText: banner.primaryCtaText || "",
                primaryCtaLink: banner.primaryCtaLink || "",
                secondaryCtaText: banner.secondaryCtaText || "",
                secondaryCtaLink: banner.secondaryCtaLink || "",
                isActive: banner.isActive,
                displayOrder: banner.displayOrder ? banner.displayOrder.toString() : "0"
            })
        } else {
            setEditingId(null)
            setFormData({
                titleLine1: "",
                titleLine1Highlight: "",
                titleLine2: "",
                titleLine2Highlight: "",
                description: "",
                image: "",
                badgeText: "",
                badgeIcon: "Sparkles",
                primaryCtaText: "",
                primaryCtaLink: "",
                secondaryCtaText: "",
                secondaryCtaLink: "",
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
                await api.put(`/main-banners/${editingId}`, payload)
                toast.success("Banner updated")
            } else {
                await api.post('/main-banners', payload)
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
            await api.delete(`/main-banners/${id}`)
            toast.success("Banner deleted")
            fetchBanners()
        } catch (error) {
            toast.error("Failed to delete banner")
        }
    }

    return (
        <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-sky-500/10 via-sky-500/10 to-transparent p-6 rounded-2xl border border-sky-500/20">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                        <ImageIcon className="w-8 h-8 text-sky-600 dark:text-sky-400" />
                        Main Banners
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Manage hero slider banners displayed on the main website homepage.</p>
                </div>
                <Button onClick={() => handleOpenDialog()} className="bg-sky-600 hover:bg-sky-700 text-white rounded-full px-6 shadow-md transition-all hover:shadow-lg">
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
                                <TableHead className="w-[120px] font-semibold text-slate-700 dark:text-slate-300">Image</TableHead>
                                <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Title</TableHead>
                                <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Badge</TableHead>
                                <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Status</TableHead>
                                <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Order</TableHead>
                                <TableHead className="text-right font-semibold text-slate-700 dark:text-slate-300">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {banners.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                                        <div className="flex flex-col items-center justify-center space-y-3">
                                            <ImageIcon className="w-10 h-10 text-slate-300" />
                                            <p>No banners found. Create one to display on the main homepage.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                banners.map((banner) => {
                                    const IconComponent = iconMap[banner.badgeIcon] || Sparkles;
                                    return (
                                        <TableRow key={banner.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <TableCell>
                                                <div className="w-24 h-12 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm relative">
                                                    {banner.image ? (
                                                        <img src={banner.image} alt={banner.titleLine1} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex flex-col items-center justify-center text-[10px] text-slate-400">
                                                            <ImageIcon className="w-4 h-4 mb-0.5 opacity-50" />
                                                            <span>No Img</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium text-slate-900 dark:text-slate-100">{banner.titleLine1} <span className="text-sky-500">{banner.titleLine1Highlight}</span></div>
                                                <div className="text-xs text-slate-500 line-clamp-1 mt-0.5" title={banner.description}>{banner.description || "No description provided"}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded inline-block">
                                                    <IconComponent className="w-3 h-3 text-sky-500" />
                                                    <span className="text-xs font-medium">{banner.badgeText || "No Badge"}</span>
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
                                    )
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>
            )}

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingId ? "Edit Main Banner" : "Add New Main Banner"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSave} className="space-y-6 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Title Line 1 *</Label>
                                <Input required value={formData.titleLine1} onChange={e => setFormData({ ...formData, titleLine1: e.target.value })} placeholder="e.g. Building" />
                            </div>
                            <div className="space-y-2">
                                <Label>Title Line 1 Highlight</Label>
                                <Input value={formData.titleLine1Highlight} onChange={e => setFormData({ ...formData, titleLine1Highlight: e.target.value })} placeholder="e.g. Careers." />
                            </div>
                            <div className="space-y-2">
                                <Label>Title Line 2</Label>
                                <Input value={formData.titleLine2} onChange={e => setFormData({ ...formData, titleLine2: e.target.value })} placeholder="e.g. Scaling" />
                            </div>
                            <div className="space-y-2">
                                <Label>Title Line 2 Highlight</Label>
                                <Input value={formData.titleLine2Highlight} onChange={e => setFormData({ ...formData, titleLine2Highlight: e.target.value })} placeholder="e.g. Enterprises." />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Input value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Brief text displayed under title" />
                        </div>
                        <div className="space-y-2">
                            <Label>Image URL * (Transparent PNG recommended for Hero Section)</Label>
                            <Input required value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })} placeholder="/images/hero/..." />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Badge Text</Label>
                                <Input value={formData.badgeText} onChange={e => setFormData({ ...formData, badgeText: e.target.value })} placeholder="The Ultimate Tech Ecosystem" />
                            </div>
                            <div className="space-y-2">
                                <Label>Badge Icon</Label>
                                <Select value={formData.badgeIcon} onValueChange={v => setFormData({ ...formData, badgeIcon: v })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select icon" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Sparkles">Sparkles</SelectItem>
                                        <SelectItem value="Target">Target</SelectItem>
                                        <SelectItem value="Building2">Building</SelectItem>
                                        <SelectItem value="TrendingUp">Trending</SelectItem>
                                        <SelectItem value="Store">Store</SelectItem>
                                        <SelectItem value="GraduationCap">Graduation</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 border-t pt-4">
                            <div className="space-y-2">
                                <Label>Primary CTA Text</Label>
                                <Input value={formData.primaryCtaText} onChange={e => setFormData({ ...formData, primaryCtaText: e.target.value })} placeholder="Start Your Career" />
                            </div>
                            <div className="space-y-2">
                                <Label>Primary CTA Link</Label>
                                <Input value={formData.primaryCtaLink} onChange={e => setFormData({ ...formData, primaryCtaLink: e.target.value })} placeholder="/courses" />
                            </div>
                            <div className="space-y-2">
                                <Label>Secondary CTA Text</Label>
                                <Input value={formData.secondaryCtaText} onChange={e => setFormData({ ...formData, secondaryCtaText: e.target.value })} placeholder="Enterprise Solutions" />
                            </div>
                            <div className="space-y-2">
                                <Label>Secondary CTA Link</Label>
                                <Input value={formData.secondaryCtaLink} onChange={e => setFormData({ ...formData, secondaryCtaLink: e.target.value })} placeholder="/contact" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 border-t pt-4">
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
