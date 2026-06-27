"use client"

import * as React from 'react'
import axios from 'axios'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Plus, Edit, Trash2, Globe, Server, Check, X, ShieldAlert, Sparkles, Laptop, Users, Building } from 'lucide-react'
import { toast } from 'sonner'
import AdminTeamPage from '../team/page'
import AdminClientsPage from '../clients/page'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

interface Product {
    id: string
    name: string
    slug: string
    description: string
    category: string
    price: number | null
    features: string[] | any
    brochureUrl: string | null
    demoUrl: string | null
    isActive: boolean
}

interface Service {
    id: string
    name: string
    slug: string
    description: string
    category: string
    features: string[] | any
    isActive: boolean
}

export default function AdminCMSPage() {

    const [activeTab, setActiveTab] = React.useState<'products' | 'services' | 'team' | 'clients'>('products')
    const [products, setProducts] = React.useState<Product[]>([])
    const [services, setServices] = React.useState<Service[]>([])
    const [loadingData, setLoadingData] = React.useState(true)
    const [showOurTeam, setShowOurTeam] = React.useState(false)

    // Form states
    const [editingProduct, setEditingProduct] = React.useState<Partial<Product> | null>(null)
    const [editingService, setEditingService] = React.useState<Partial<Service> | null>(null)
    const [isSaving, setIsSaving] = React.useState(false)

    // API Config
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
    const getHeaders = () => {
        const token = localStorage.getItem('token')
        return { headers: { Authorization: `Bearer ${token}` } }
    }

    React.useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoadingData(true)
        try {
            const [pRes, sRes, setRes] = await Promise.all([
                axios.get(`${apiBase}/products/admin/all`, getHeaders()),
                axios.get(`${apiBase}/services/admin/all`, getHeaders()),
                axios.get(`${apiBase}/settings/public`)
            ])
            setProducts(pRes.data)
            setServices(sRes.data)
            setShowOurTeam(setRes.data?.showOurTeam || false)
        } catch (error) {
            console.error(error)
            toast.error('Failed to load CMS data')
        } finally {
            setLoadingData(false)
        }
    }

    const handleToggleTeamVisibility = async (checked: boolean) => {
        try {
            setShowOurTeam(checked)
            await axios.put(`${apiBase}/settings`, { showOurTeam: checked }, getHeaders())
            toast.success(checked ? 'Team page is now PUBLIC' : 'Team page is now HIDDEN')
        } catch (error) {
            toast.error('Failed to update team visibility setting')
            setShowOurTeam(!checked)
        }
    }

    // Product Handlers
    const handleSaveProduct = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingProduct) return
        setIsSaving(true)
        try {
            // Format features array if comma-separated string
            let formattedFeatures = editingProduct.features
            if (typeof formattedFeatures === 'string') {
                formattedFeatures = formattedFeatures.split('\n').map(f => f.trim()).filter(Boolean)
            }

            const payload = {
                ...editingProduct,
                features: formattedFeatures
            }

            if (editingProduct.id) {
                await axios.put(`${apiBase}/products/${editingProduct.id}`, payload, getHeaders())
                toast.success('Product updated successfully')
            } else {
                await axios.post(`${apiBase}/products`, payload, getHeaders())
                toast.success('Product created successfully')
            }
            setEditingProduct(null)
            fetchData()
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to save product')
        } finally {
            setIsSaving(false)
        }
    }

    const handleDeleteProduct = async (id: string) => {
        if (!confirm('Are you sure you want to delete this product?')) return
        try {
            await axios.delete(`${apiBase}/products/${id}`, getHeaders())
            toast.success('Product deleted')
            fetchData()
        } catch (error) {
            toast.error('Deletion failed')
        }
    }

    // Service Handlers
    const handleSaveService = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingService) return
        setIsSaving(true)
        try {
            let formattedFeatures = editingService.features
            if (typeof formattedFeatures === 'string') {
                formattedFeatures = formattedFeatures.split('\n').map(f => f.trim()).filter(Boolean)
            }

            const payload = {
                ...editingService,
                features: formattedFeatures
            }

            if (editingService.id) {
                await axios.put(`${apiBase}/services/${editingService.id}`, payload, getHeaders())
                toast.success('Service updated successfully')
            } else {
                await axios.post(`${apiBase}/services`, payload, getHeaders())
                toast.success('Service created successfully')
            }
            setEditingService(null)
            fetchData()
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to save service')
        } finally {
            setIsSaving(false)
        }
    }

    const handleDeleteService = async (id: string) => {
        if (!confirm('Are you sure you want to delete this service?')) return
        try {
            await axios.delete(`${apiBase}/services/${id}`, getHeaders())
            toast.success('Service deleted')
            fetchData()
        } catch (error) {
            toast.error('Deletion failed')
        }
    }

    if (loadingData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-950">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 py-10 px-4 md:px-8">
            <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
                            <Globe className="h-7 w-7 text-indigo-600" />
                            Ecosystem CMS Manager
                        </h1>
                        <p className="text-xs text-zinc-500 mt-1">Manage corporate products, consulting services, brochures, and demo listings.</p>
                    </div>

                    <div className="flex gap-2">
                        <Button 
                            onClick={() => setActiveTab('products')} 
                            variant={activeTab === 'products' ? 'default' : 'outline'}
                            className="text-xs font-semibold h-9 rounded-lg"
                        >
                            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                            SaaS Products
                        </Button>
                        <Button 
                            onClick={() => setActiveTab('services')} 
                            variant={activeTab === 'services' ? 'default' : 'outline'}
                            className="text-xs font-semibold h-9 rounded-lg"
                        >
                            <Laptop className="w-3.5 h-3.5 mr-1.5" />
                            Consulting Services
                        </Button>
                        <Button 
                            onClick={() => setActiveTab('team')} 
                            variant={activeTab === 'team' ? 'default' : 'outline'}
                            className="text-xs font-semibold h-9 rounded-lg"
                        >
                            <Users className="w-3.5 h-3.5 mr-1.5" />
                            Team
                        </Button>
                        <Button 
                            onClick={() => setActiveTab('clients')} 
                            variant={activeTab === 'clients' ? 'default' : 'outline'}
                            className="text-xs font-semibold h-9 rounded-lg"
                        >
                            <Building className="w-3.5 h-3.5 mr-1.5" />
                            Clients
                        </Button>
                    </div>
                </div>

                {activeTab === 'team' && (
                    <div className="space-y-6">
                        <Card className="glass-card border-border">
                            <CardHeader className="py-4 border-b border-border/50 bg-muted/20">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                                            <Globe className="h-4 w-4 text-indigo-500" />
                                            Public Visibility
                                        </CardTitle>
                                        <CardDescription className="text-xs mt-1">
                                            Toggle to show or hide the "Our Team" section on the public About Us page.
                                        </CardDescription>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Switch 
                                            id="show-team" 
                                            checked={showOurTeam}
                                            onCheckedChange={handleToggleTeamVisibility}
                                        />
                                        <Label htmlFor="show-team" className="font-bold text-sm">
                                            {showOurTeam ? 'Visible' : 'Hidden'}
                                        </Label>
                                    </div>
                                </div>
                            </CardHeader>
                        </Card>
                        <div className="-mx-4 md:-mx-8">
                            <AdminTeamPage />
                        </div>
                    </div>
                )}

                {activeTab === 'clients' && (
                    <div className="-mx-4 md:-mx-8">
                        <AdminClientsPage />
                    </div>
                )}

                {/* SaaS Products CMS */}
                {activeTab === 'products' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                            <div>
                                <h3 className="font-bold text-zinc-800 dark:text-zinc-200 text-sm">Product Catalog</h3>
                                <p className="text-[10px] text-zinc-400 mt-0.5">Control billing platforms, school apps, and LMS parameters.</p>
                            </div>
                            <Button 
                                onClick={() => setEditingProduct({ name: '', slug: '', description: '', category: 'LMS', price: null, features: '', brochureUrl: '', demoUrl: '', isActive: true })}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold h-9 px-4 rounded-lg flex items-center gap-1.5"
                            >
                                <Plus className="w-4 h-4" /> Add Product
                            </Button>
                        </div>

                        {/* Product form overlay modal */}
                        {editingProduct && (
                            <Card className="bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-800 shadow-xl rounded-xl">
                                <CardHeader className="border-b border-zinc-100 dark:border-zinc-800 pb-4">
                                    <CardTitle className="text-base font-bold flex items-center gap-2">
                                        {editingProduct.id ? 'Edit Product Details' : 'Configure New SaaS Product'}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <form onSubmit={handleSaveProduct} className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                                        <div className="space-y-2">
                                            <label className="font-semibold text-zinc-700 dark:text-zinc-300">Product Name</label>
                                            <Input 
                                                value={editingProduct.name || ''} 
                                                onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
                                                required 
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="font-semibold text-zinc-700 dark:text-zinc-300">URL Slug</label>
                                            <Input 
                                                value={editingProduct.slug || ''} 
                                                onChange={e => setEditingProduct({ ...editingProduct, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                                                required 
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="font-semibold text-zinc-700 dark:text-zinc-300">Category</label>
                                            <select 
                                                className="w-full h-10 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-lg px-3 text-xs"
                                                value={editingProduct.category || 'LMS'}
                                                onChange={e => setEditingProduct({ ...editingProduct, category: e.target.value })}
                                            >
                                                <option value="LMS">LMS Platforms</option>
                                                <option value="ERP">TWIIS ERP Solution</option>
                                                <option value="COLLEGE_MGMT">College Systems</option>
                                                <option value="SCHOOL_MGMT">School Systems</option>
                                                <option value="ASSET_MGMT">Asset Management</option>
                                                <option value="BILLING">Billing & Ledger Book</option>
                                                <option value="CUSTOM">Custom Product</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="font-semibold text-zinc-700 dark:text-zinc-300">Starting Price (INR)</label>
                                            <Input 
                                                type="number" 
                                                value={editingProduct.price || ''} 
                                                onChange={e => setEditingProduct({ ...editingProduct, price: e.target.value ? parseFloat(e.target.value) : null })}
                                                placeholder="e.g. 45000"
                                            />
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="font-semibold text-zinc-700 dark:text-zinc-300">Description</label>
                                            <Textarea 
                                                value={editingProduct.description || ''} 
                                                onChange={e => setEditingProduct({ ...editingProduct, description: e.target.value })}
                                                required 
                                            />
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="font-semibold text-zinc-700 dark:text-zinc-300">Product Features (One per line)</label>
                                            <Textarea 
                                                value={Array.isArray(editingProduct.features) ? editingProduct.features.join('\n') : editingProduct.features || ''} 
                                                onChange={e => setEditingProduct({ ...editingProduct, features: e.target.value })}
                                                placeholder="Feature 1&#10;Feature 2"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="font-semibold text-zinc-700 dark:text-zinc-300">Demo Url</label>
                                            <Input 
                                                value={editingProduct.demoUrl || ''} 
                                                onChange={e => setEditingProduct({ ...editingProduct, demoUrl: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="font-semibold text-zinc-700 dark:text-zinc-300">Brochure Download Url</label>
                                            <Input 
                                                value={editingProduct.brochureUrl || ''} 
                                                onChange={e => setEditingProduct({ ...editingProduct, brochureUrl: e.target.value })}
                                            />
                                        </div>
                                        <div className="flex items-center space-x-2 py-4 select-none">
                                            <input 
                                                type="checkbox"
                                                id="prodActive"
                                                checked={editingProduct.isActive !== false}
                                                onChange={e => setEditingProduct({ ...editingProduct, isActive: e.target.checked })}
                                                className="w-4 h-4 text-indigo-600 border-zinc-300 rounded cursor-pointer"
                                            />
                                            <label htmlFor="prodActive" className="text-zinc-700 dark:text-zinc-300 cursor-pointer font-semibold">Active Catalog Listing</label>
                                        </div>
                                        
                                        <div className="flex justify-end gap-2 md:col-span-2 border-t border-zinc-100 dark:border-zinc-800 pt-4">
                                            <Button type="button" variant="outline" onClick={() => setEditingProduct(null)}>
                                                Cancel
                                            </Button>
                                            <Button type="submit" disabled={isSaving} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6">
                                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 mr-1.5" />}
                                                Save Product
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        )}

                        {/* List grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {products.map((p) => (
                                <Card key={p.id} className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 p-5 flex justify-between items-center gap-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-zinc-900 dark:text-white text-sm">{p.name}</span>
                                            {!p.isActive && <span className="bg-zinc-100 text-zinc-500 text-[8px] px-1.5 py-0.5 rounded font-bold uppercase">Inactive</span>}
                                        </div>
                                        <p className="text-[10px] text-zinc-400 capitalize">Category: {p.category}</p>
                                    </div>
                                    <div className="flex gap-1">
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            onClick={() => setEditingProduct(p)}
                                            className="h-8 w-8 text-zinc-500 hover:text-indigo-600"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            onClick={() => handleDeleteProduct(p.id)}
                                            className="h-8 w-8 text-zinc-400 hover:text-red-600"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {/* IT Services CMS */}
                {activeTab === 'services' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                            <div>
                                <h3 className="font-bold text-zinc-800 dark:text-zinc-200 text-sm">Consulting Services Catalog</h3>
                                <p className="text-[10px] text-zinc-400 mt-0.5">Control cybersecurity audits, managed infrastructure, and branding support.</p>
                            </div>
                            <Button 
                                onClick={() => setEditingService({ name: '', slug: '', description: '', category: 'IT_INFRASTRUCTURE', features: '', isActive: true })}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold h-9 px-4 rounded-lg flex items-center gap-1.5"
                            >
                                <Plus className="w-4 h-4" /> Add Service
                            </Button>
                        </div>

                        {/* Service form modal */}
                        {editingService && (
                            <Card className="bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-800 shadow-xl rounded-xl">
                                <CardHeader className="border-b border-zinc-100 dark:border-zinc-800 pb-4">
                                    <CardTitle className="text-base font-bold flex items-center gap-2">
                                        {editingService.id ? 'Edit Service Details' : 'Configure New Service Offer'}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <form onSubmit={handleSaveService} className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                                        <div className="space-y-2">
                                            <label className="font-semibold text-zinc-700 dark:text-zinc-300">Service Name</label>
                                            <Input 
                                                value={editingService.name || ''} 
                                                onChange={e => setEditingService({ ...editingService, name: e.target.value })}
                                                required 
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="font-semibold text-zinc-700 dark:text-zinc-300">URL Slug</label>
                                            <Input 
                                                value={editingService.slug || ''} 
                                                onChange={e => setEditingService({ ...editingService, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                                                required 
                                            />
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="font-semibold text-zinc-700 dark:text-zinc-300">Category</label>
                                            <select 
                                                className="w-full h-10 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-lg px-3 text-xs"
                                                value={editingService.category || 'IT_INFRASTRUCTURE'}
                                                onChange={e => setEditingService({ ...editingService, category: e.target.value })}
                                            >
                                                <option value="IT_INFRASTRUCTURE">IT Infrastructure Solutions</option>
                                                <option value="CLOUD_SOLUTIONS">Cloud (AWS/Azure) Migration</option>
                                                <option value="CYBER_SECURITY">Cyber Security audits</option>
                                                <option value="SOFTWARE_DEVELOPMENT">Bespoke Software Development</option>
                                                <option value="DIGITAL_SERVICES">Digital Solutions & Branding</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="font-semibold text-zinc-700 dark:text-zinc-300">Description</label>
                                            <Textarea 
                                                value={editingService.description || ''} 
                                                onChange={e => setEditingService({ ...editingService, description: e.target.value })}
                                                required 
                                            />
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="font-semibold text-zinc-700 dark:text-zinc-300">Included Solutions (One per line)</label>
                                            <Textarea 
                                                value={Array.isArray(editingService.features) ? editingService.features.join('\n') : editingService.features || ''} 
                                                onChange={e => setEditingService({ ...editingService, features: e.target.value })}
                                                placeholder="Solution bullet 1&#10;Solution bullet 2"
                                            />
                                        </div>
                                        <div className="flex items-center space-x-2 py-4 select-none md:col-span-2">
                                            <input 
                                                type="checkbox"
                                                id="servActive"
                                                checked={editingService.isActive !== false}
                                                onChange={e => setEditingService({ ...editingService, isActive: e.target.checked })}
                                                className="w-4 h-4 text-indigo-600 border-zinc-300 rounded cursor-pointer"
                                            />
                                            <label htmlFor="servActive" className="text-zinc-700 dark:text-zinc-300 cursor-pointer font-semibold">Active Catalog Listing</label>
                                        </div>
                                        
                                        <div className="flex justify-end gap-2 md:col-span-2 border-t border-zinc-100 dark:border-zinc-800 pt-4">
                                            <Button type="button" variant="outline" onClick={() => setEditingService(null)}>
                                                Cancel
                                            </Button>
                                            <Button type="submit" disabled={isSaving} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6">
                                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 mr-1.5" />}
                                                Save Service
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        )}

                        {/* List grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {services.map((s) => (
                                <Card key={s.id} className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 p-5 flex justify-between items-center gap-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-zinc-900 dark:text-white text-sm">{s.name}</span>
                                            {!s.isActive && <span className="bg-zinc-100 text-zinc-500 text-[8px] px-1.5 py-0.5 rounded font-bold uppercase">Inactive</span>}
                                        </div>
                                        <p className="text-[10px] text-zinc-400 capitalize">Category: {s.category.replace('_', ' ')}</p>
                                    </div>
                                    <div className="flex gap-1">
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            onClick={() => setEditingService(s)}
                                            className="h-8 w-8 text-zinc-500 hover:text-indigo-600"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            onClick={() => handleDeleteService(s.id)}
                                            className="h-8 w-8 text-zinc-400 hover:text-red-600"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
