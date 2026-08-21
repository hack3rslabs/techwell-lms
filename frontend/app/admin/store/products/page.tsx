"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Trash2, ExternalLink, GraduationCap, Package } from "lucide-react"
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

export default function AdminProductsPage() {
    const [products, setProducts] = useState<any[]>([])
    const [categories, setCategories] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    // Form State
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        sku: "",
        brand: "",
        categoryId: "",
        price: "",
        discountPrice: "",
        condition: "NEW",
        stock: "",
        isAffiliate: false,
        affiliateUrl: "",
        affiliateSource: "",
        studentDiscount: "",
        studentDiscountType: "PERCENTAGE"
    })

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const [prodRes, catRes] = await Promise.all([
                api.get('/shop/products'),
                api.get('/shop/categories')
            ])
            setProducts(prodRes.data?.data?.products || [])
            setCategories(catRes.data?.data?.categories || [])
        } catch (error) {
            toast.error("Failed to fetch data")
        } finally {
            setIsLoading(false)
        }
    }

    const handleOpenDialog = (product?: any) => {
        if (product) {
            setEditingId(product.id)
            setFormData({
                name: product.name,
                slug: product.slug,
                sku: product.sku || "",
                brand: product.brand || "",
                categoryId: product.categoryId,
                price: product.price.toString(),
                discountPrice: product.discountPrice ? product.discountPrice.toString() : "",
                condition: product.condition || "NEW",
                stock: product.stock.toString(),
                isAffiliate: product.isAffiliate,
                affiliateUrl: product.affiliateUrl || "",
                affiliateSource: product.affiliateSource || "",
                studentDiscount: product.studentDiscount ? product.studentDiscount.toString() : "",
                studentDiscountType: product.studentDiscountType || "PERCENTAGE"
            })
        } else {
            setEditingId(null)
            setFormData({
                name: "",
                slug: "",
                sku: "",
                brand: "",
                categoryId: categories.length > 0 ? categories[0].id : "",
                price: "",
                discountPrice: "",
                condition: "NEW",
                stock: "",
                isAffiliate: false,
                affiliateUrl: "",
                affiliateSource: "",
                studentDiscount: "",
                studentDiscountType: "PERCENTAGE"
            })
        }
        setIsDialogOpen(true)
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const payload: any = {
                ...formData,
                price: parseFloat(formData.price),
                discountPrice: formData.discountPrice ? parseFloat(formData.discountPrice) : null,
                stock: parseInt(formData.stock),
                studentDiscount: formData.studentDiscount ? parseFloat(formData.studentDiscount) : null,
            }

            if (editingId) {
                await api.put(`/shop/admin/products/${editingId}`, payload)
                toast.success("Product updated")
            } else {
                if (!payload.slug) {
                    payload.slug = payload.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now()
                }
                if (!payload.categoryId) {
                     const catRes = await api.post('/shop/admin/categories', {
                         name: 'General',
                         slug: 'general'
                     })
                     payload.categoryId = catRes.data.data.category.id
                     setCategories([...categories, catRes.data.data.category])
                }
                await api.post('/shop/admin/products', payload)
                toast.success("Product created")
            }
            setIsDialogOpen(false)
            fetchData()
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to save product")
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this product?")) return
        try {
            await api.delete(`/shop/admin/products/${id}`)
            toast.success("Product deleted")
            fetchData()
        } catch (error) {
            toast.error("Failed to delete product")
        }
    }

    return (
        <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-blue-500/10 via-sky-500/10 to-transparent p-6 rounded-2xl border border-blue-500/20">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                        <Package className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                        Products Inventory
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Manage your store's products, pricing, and stock.</p>
                </div>
                <Button onClick={() => handleOpenDialog()} className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 shadow-md transition-all hover:shadow-lg">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product
                </Button>
            </div>

            {isLoading ? (
                <div className="p-8 text-center text-muted-foreground">Loading...</div>
            ) : (
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                            <TableRow>
                                <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Product Details</TableHead>
                                <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Price</TableHead>
                                <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Student Offer</TableHead>
                                <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Stock</TableHead>
                                <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Type</TableHead>
                                <TableHead className="text-right font-semibold text-slate-700 dark:text-slate-300">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                                        <div className="flex flex-col items-center justify-center space-y-3">
                                            <Package className="w-10 h-10 text-slate-300" />
                                            <p>No products found in inventory.</p>
                                            <Button variant="outline" size="sm" onClick={() => handleOpenDialog()}>Add your first product</Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                products.map((product) => (
                                    <TableRow key={product.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <TableCell>
                                            <div className="font-medium text-slate-900 dark:text-slate-100">{product.name}</div>
                                            <div className="text-xs text-muted-foreground mt-1.5 flex flex-wrap gap-2 items-center">
                                                {product.sku && <span className="font-mono bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 px-1.5 py-0.5 rounded text-[10px]">SKU: {product.sku}</span>}
                                                {product.brand && <span className="text-slate-500">{product.brand}</span>}
                                                {product.category && <span className="text-sky-500 bg-sky-50 dark:bg-sky-500/10 px-1.5 py-0.5 rounded">{product.category.name}</span>}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-semibold text-slate-900 dark:text-slate-100">₹{product.discountPrice || product.price}</div>
                                            {product.discountPrice && (
                                                <div className="text-xs line-through text-slate-400 mt-0.5">₹{product.price}</div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {product.studentDiscount ? (
                                                <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
                                                    <GraduationCap className="w-3 h-3 mr-1.5" />
                                                    {product.studentDiscountType === 'PERCENTAGE' ? `${product.studentDiscount}% OFF` : `₹${product.studentDiscount} OFF`}
                                                </Badge>
                                            ) : (
                                                <span className="text-slate-400 text-xs italic">No Offer</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {product.isAffiliate ? (
                                                <Badge variant="outline" className="text-slate-500 bg-slate-50 dark:bg-slate-900">N/A</Badge>
                                            ) : (
                                                <Badge variant={product.stock > 10 ? "default" : product.stock > 0 ? "secondary" : "destructive"} className={product.stock > 10 ? "bg-emerald-500 hover:bg-emerald-600" : product.stock > 0 ? "bg-emerald-500 hover:bg-emerald-600 text-white" : ""}>
                                                    {product.stock} in stock
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {product.isAffiliate ? (
                                                <span className="flex items-center gap-1.5 text-xs font-semibold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-500/10 px-2 py-1 rounded-md w-fit border border-sky-100 dark:border-sky-500/20">
                                                    Affiliate <ExternalLink className="w-3 h-3" />
                                                </span>
                                            ) : (
                                                <span className="text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700">Internal</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(product)} className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)} className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20">
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
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingId ? "Edit Product" : "Add New Product"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSave} className="space-y-6 py-4">
                        
                        {/* Basic Info */}
                        <div>
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Basic Info</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2 col-span-2 sm:col-span-1">
                                    <Label>Product Name *</Label>
                                    <Input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                </div>
                                <div className="space-y-2 col-span-2 sm:col-span-1">
                                    <Label>Slug (Optional)</Label>
                                    <Input value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} placeholder="auto-generated if empty" />
                                </div>
                                <div className="space-y-2">
                                    <Label>SKU (Optional)</Label>
                                    <Input value={formData.sku} onChange={e => setFormData({ ...formData, sku: e.target.value })} placeholder="e.g. LPT-DELL-001" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Brand (Optional)</Label>
                                    <Input value={formData.brand} onChange={e => setFormData({ ...formData, brand: e.target.value })} placeholder="e.g. Dell, Lenovo" />
                                </div>
                            </div>
                        </div>

                        {/* Pricing & Inventory */}
                        <div>
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 border-t pt-4">Pricing & Inventory</h3>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="space-y-2">
                                    <Label>Regular Price (₹) *</Label>
                                    <Input required type="number" min="0" step="0.01" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Discount Price (₹)</Label>
                                    <Input type="number" min="0" step="0.01" value={formData.discountPrice} onChange={e => setFormData({ ...formData, discountPrice: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Condition</Label>
                                    <select 
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                        value={formData.condition} 
                                        onChange={e => setFormData({ ...formData, condition: e.target.value })}
                                    >
                                        <option value="NEW">New</option>
                                        <option value="REFURBISHED">Refurbished</option>
                                        <option value="SPARE">Spare Part</option>
                                    </select>
                                </div>
                                {!formData.isAffiliate && (
                                    <div className="space-y-2">
                                        <Label>Stock Quantity</Label>
                                        <Input required type="number" min="0" value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Student Discounts */}
                        <div>
                            <h3 className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-3 border-t pt-4 flex items-center gap-2">
                                <GraduationCap className="w-4 h-4" /> Student Offer
                            </h3>
                            <div className="grid grid-cols-2 gap-4 bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-lg border border-blue-100 dark:border-blue-900/20">
                                <div className="space-y-2">
                                    <Label>Discount Value (Optional)</Label>
                                    <Input type="number" min="0" step="0.01" value={formData.studentDiscount} onChange={e => setFormData({ ...formData, studentDiscount: e.target.value })} placeholder="e.g. 10" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Discount Type</Label>
                                    <select 
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                        value={formData.studentDiscountType} 
                                        onChange={e => setFormData({ ...formData, studentDiscountType: e.target.value })}
                                    >
                                        <option value="PERCENTAGE">Percentage (%)</option>
                                        <option value="FIXED">Fixed Amount (₹)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Affiliate Options */}
                        <div className="border-t pt-4">
                            <div className="flex items-center gap-3 mb-4">
                                <Switch checked={formData.isAffiliate} onCheckedChange={c => setFormData({ ...formData, isAffiliate: c, stock: c ? "0" : formData.stock })} />
                                <Label>Is Affiliate Product? (Redirect to External Store)</Label>
                            </div>

                            {formData.isAffiliate && (
                                <div className="grid grid-cols-2 gap-4 bg-zinc-50 dark:bg-zinc-900 p-4 rounded-md border">
                                    <div className="space-y-2">
                                        <Label>Affiliate URL *</Label>
                                        <Input required={formData.isAffiliate} value={formData.affiliateUrl} onChange={e => setFormData({ ...formData, affiliateUrl: e.target.value })} placeholder="https://amazon.in/..." />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Platform Source</Label>
                                        <select 
                                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                            value={formData.affiliateSource} 
                                            onChange={e => setFormData({ ...formData, affiliateSource: e.target.value })}
                                        >
                                            <option value="">Select Platform...</option>
                                            <option value="Amazon">Amazon</option>
                                            <option value="Flipkart">Flipkart</option>
                                            <option value="Meesho">Meesho</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button type="submit">Save Product</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
