"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Loader2, Plus, Edit, Trash2 } from 'lucide-react'
import api, { productApi, clientApi, teamApi, settingsApi } from '@/lib/api'
import { Switch } from '@/components/ui/switch'

export default function CMSManagerPage() {
    const [activeTab, setActiveTab] = useState('products')
    const [products, setProducts] = useState<any[]>([])
    const [team, setTeam] = useState<any[]>([])
    const [clients, setClients] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [showOurTeam, setShowOurTeam] = useState(false)

    // Form states
    const [productForm, setProductForm] = useState({ id: '', name: '', slug: '', description: '', category: '', price: '', demoUrl: '', brochureUrl: '', isActive: true })
    const [clientForm, setClientForm] = useState({ id: '', name: '', description: '', url: '', logoUrl: '', isActive: true })
    const [teamForm, setTeamForm] = useState({ id: '', name: '', designation: '', description: '', photoUrl: '', linkedinUrl: '', orderIndex: 0, isActive: true })
    const [isEditing, setIsEditing] = useState(false)
    const [teamPhotoFile, setTeamPhotoFile] = useState<File | null>(null)

    async function loadData() {
        setIsLoading(true)
        try {
            const [prodRes, cliRes, teamRes, settingsRes] = await Promise.all([
                productApi.getAdminAll().catch(() => ({ data: [] })),
                clientApi.getAdminAll().catch(() => ({ data: [] })),
                teamApi.getAdminAll().catch(() => ({ data: [] })),
                settingsApi.getAll().catch(() => ({ data: { showOurTeam: false } }))
            ])
            setProducts(prodRes.data || [])
            setClients(cliRes.data || [])
            setTeam(teamRes.data || [])
            setShowOurTeam(settingsRes.data?.showOurTeam || false)
        } catch (error) {
            console.error('Error loading CMS data:', error)
        } finally {
            setIsLoading(false)
        }
    }


    useEffect(() => {
        loadData()
    }, [])


    const handleProductSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        try {
            if (isEditing && productForm.id) {
                await productApi.update(productForm.id, productForm)
            } else {
                await productApi.create(productForm)
            }
            setProductForm({ id: '', name: '', slug: '', description: '', category: '', price: '', demoUrl: '', brochureUrl: '', isActive: true })
            setIsEditing(false)
            loadData()
        } catch (error) {
            console.error('Failed to save product', error)
        } finally {
            setIsSaving(false)
        }
    }

    const handleClientSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        try {
            if (isEditing && clientForm.id) {
                await clientApi.update(clientForm.id, clientForm)
            } else {
                await clientApi.create(clientForm)
            }
            setClientForm({ id: '', name: '', description: '', url: '', logoUrl: '', isActive: true })
            setIsEditing(false)
            loadData()
        } catch (error) {
            console.error('Failed to save client', error)
        } finally {
            setIsSaving(false)
        }
    }

    const deleteProduct = async (id: string) => {
        if (!confirm('Are you sure?')) return
        await productApi.delete(id)
        loadData()
    }

    const deleteClient = async (id: string) => {
        if (!confirm('Are you sure?')) return
        await clientApi.delete(id)
        loadData()
    }

    const editProduct = (p: any) => {
        setProductForm(p)
        setIsEditing(true)
    }

    const editClient = (c: any) => {
        setClientForm(c)
        setIsEditing(true)
    }

    const handleTeamSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        try {
            let photoUrl = teamForm.photoUrl;
            if (teamPhotoFile) {
                const formData = new FormData();
                formData.append('file', teamPhotoFile);
                const uploadRes = await api.post('/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                photoUrl = uploadRes.data.url;
            }

            const dataToSave = { ...teamForm, photoUrl };

            if (isEditing && teamForm.id) {
                await teamApi.update(teamForm.id, dataToSave)
            } else {
                await teamApi.create(dataToSave)
            }
            setTeamForm({ id: '', name: '', designation: '', description: '', photoUrl: '', linkedinUrl: '', orderIndex: 0, isActive: true })
            setTeamPhotoFile(null)
            setIsEditing(false)
            loadData()
        } catch (error) {
            console.error('Failed to save team member', error)
        } finally {
            setIsSaving(false)
        }
    }

    const toggleTeamMemberStatus = async (id: string, currentStatus: boolean) => {
        try {
            await teamApi.update(id, { isActive: !currentStatus })
            loadData()
        } catch (error) {
            console.error('Failed to toggle status', error)
        }
    }

    const deleteTeam = async (id: string) => {
        if (!confirm('Are you sure?')) return
        await teamApi.delete(id)
        loadData()
    }

    const editTeam = (t: any) => {
        setTeamForm(t)
        setIsEditing(true)
    }

    const toggleTeamVisibility = async (checked: boolean) => {
        try {
            await settingsApi.update({ showOurTeam: checked })
            setShowOurTeam(checked)
        } catch (error) {
            console.error('Failed to update team visibility', error)
        }
    }

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-8">CMS Manager</h1>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-8">
                    <TabsTrigger value="products">Products</TabsTrigger>
                    <TabsTrigger value="clients">Clients</TabsTrigger>
                    <TabsTrigger value="team">Team Members</TabsTrigger>
                </TabsList>

                {/* Products Tab */}
                <TabsContent value="products">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <Card className="col-span-1">
                            <CardHeader>
                                <CardTitle>{isEditing ? 'Edit Product' : 'Add Product'}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleProductSubmit} className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium">Name</label>
                                        <Input required value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-')})} />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Slug</label>
                                        <Input required value={productForm.slug} onChange={e => setProductForm({...productForm, slug: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Category</label>
                                        <Input required value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Description</label>
                                        <Textarea required value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">URL</label>
                                        <Input value={productForm.demoUrl} onChange={e => setProductForm({...productForm, demoUrl: e.target.value})} placeholder="https://..." />
                                    </div>
                                    <Button type="submit" disabled={isSaving} className="w-full">
                                        {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                        {isEditing ? 'Update Product' : 'Create Product'}
                                    </Button>
                                    {isEditing && (
                                        <Button variant="outline" className="w-full mt-2" onClick={() => { setIsEditing(false); setProductForm({ id: '', name: '', slug: '', description: '', category: '', price: '', demoUrl: '', brochureUrl: '', isActive: true }) }}>
                                            Cancel
                                        </Button>
                                    )}
                                </form>
                            </CardContent>
                        </Card>

                        <Card className="col-span-1 md:col-span-2">
                            <CardHeader>
                                <CardTitle>Products List</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Category</TableHead>
                                            <TableHead>URL</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {isLoading ? (
                                            <TableRow><TableCell colSpan={4} className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></TableCell></TableRow>
                                        ) : products.map(p => (
                                            <TableRow key={p.id}>
                                                <TableCell className="font-medium">{p.name}</TableCell>
                                                <TableCell><Badge>{p.category}</Badge></TableCell>
                                                <TableCell>{p.demoUrl && <a href={p.demoUrl} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">Link</a>}</TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        <Button size="sm" variant="outline" onClick={() => editProduct(p)}><Edit className="w-4 h-4" /></Button>
                                                        <Button size="sm" variant="destructive" onClick={() => deleteProduct(p.id)}><Trash2 className="w-4 h-4" /></Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Clients Tab */}
                <TabsContent value="clients">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <Card className="col-span-1">
                            <CardHeader>
                                <CardTitle>{isEditing ? 'Edit Client' : 'Add Client'}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleClientSubmit} className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium">Name</label>
                                        <Input required value={clientForm.name} onChange={e => setClientForm({...clientForm, name: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">URL</label>
                                        <Input value={clientForm.url} onChange={e => setClientForm({...clientForm, url: e.target.value})} placeholder="https://..." />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Description</label>
                                        <Textarea value={clientForm.description} onChange={e => setClientForm({...clientForm, description: e.target.value})} />
                                    </div>
                                    <Button type="submit" disabled={isSaving} className="w-full">
                                        {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                        {isEditing ? 'Update Client' : 'Create Client'}
                                    </Button>
                                    {isEditing && (
                                        <Button variant="outline" className="w-full mt-2" onClick={() => { setIsEditing(false); setClientForm({ id: '', name: '', description: '', url: '', logoUrl: '', isActive: true }) }}>
                                            Cancel
                                        </Button>
                                    )}
                                </form>
                            </CardContent>
                        </Card>

                        <Card className="col-span-1 md:col-span-2">
                            <CardHeader>
                                <CardTitle>Clients List</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>URL</TableHead>
                                            <TableHead>Description</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {isLoading ? (
                                            <TableRow><TableCell colSpan={4} className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></TableCell></TableRow>
                                        ) : clients.map(c => (
                                            <TableRow key={c.id}>
                                                <TableCell className="font-medium">{c.name}</TableCell>
                                                <TableCell>{c.url && <a href={c.url} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">{c.url}</a>}</TableCell>
                                                <TableCell>{c.description}</TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        <Button size="sm" variant="outline" onClick={() => editClient(c)}><Edit className="w-4 h-4" /></Button>
                                                        <Button size="sm" variant="destructive" onClick={() => deleteClient(c.id)}><Trash2 className="w-4 h-4" /></Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Team Tab */}
                <TabsContent value="team">
                    <div className="flex items-center justify-between mb-6 bg-card p-4 rounded-xl border">
                        <div>
                            <h3 className="font-semibold text-lg">Team Section Visibility</h3>
                            <p className="text-sm text-muted-foreground">Toggle this to show or hide the team section on the public About Us page.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-medium">{showOurTeam ? 'Enabled' : 'Disabled'}</span>
                            <Switch checked={showOurTeam} onCheckedChange={toggleTeamVisibility} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <Card className="col-span-1">
                            <CardHeader>
                                <CardTitle>{isEditing ? 'Edit Team Member' : 'Add Team Member'}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleTeamSubmit} className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium">Name</label>
                                        <Input required value={teamForm.name} onChange={e => setTeamForm({...teamForm, name: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Designation / Role</label>
                                        <Input required value={teamForm.designation} onChange={e => setTeamForm({...teamForm, designation: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Photo (500x500 px, max 2MB)</label>
                                        <Input type="file" accept="image/jpeg,image/png" onChange={e => setTeamPhotoFile(e.target.files?.[0] || null)} />
                                        {teamForm.photoUrl && !teamPhotoFile && (
                                            <p className="text-xs text-muted-foreground mt-1">Current photo URL: {teamForm.photoUrl}</p>
                                        )}
                                        <p className="text-xs text-muted-foreground mt-1">JPG or PNG format for best quality.</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">LinkedIn URL</label>
                                        <Input value={teamForm.linkedinUrl} onChange={e => setTeamForm({...teamForm, linkedinUrl: e.target.value})} placeholder="https://linkedin.com/in/..." />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Description</label>
                                        <Textarea value={teamForm.description} onChange={e => setTeamForm({...teamForm, description: e.target.value})} />
                                    </div>
                                    <Button type="submit" disabled={isSaving} className="w-full">
                                        {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                        {isEditing ? 'Update Member' : 'Add Member'}
                                    </Button>
                                    {isEditing && (
                                        <Button variant="outline" className="w-full mt-2" onClick={() => { setIsEditing(false); setTeamForm({ id: '', name: '', designation: '', description: '', photoUrl: '', linkedinUrl: '', orderIndex: 0, isActive: true }) }}>
                                            Cancel
                                        </Button>
                                    )}
                                </form>
                            </CardContent>
                        </Card>

                        <Card className="col-span-1 md:col-span-2">
                            <CardHeader>
                                <CardTitle>Team List</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Member</TableHead>
                                            <TableHead>Designation</TableHead>
                                            <TableHead>LinkedIn</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {isLoading ? (
                                            <TableRow><TableCell colSpan={4} className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></TableCell></TableRow>
                                        ) : team.map(t => (
                                            <TableRow key={t.id}>
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-3">
                                                        {t.photoUrl ? (
                                                            <img src={t.photoUrl} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">{t.name.charAt(0)}</div>
                                                        )}
                                                        {t.name}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{t.designation}</TableCell>
                                                <TableCell>{t.linkedinUrl && <a href={t.linkedinUrl} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">Profile</a>}</TableCell>
                                                <TableCell>
                                                    <Switch checked={t.isActive} onCheckedChange={() => toggleTeamMemberStatus(t.id, t.isActive)} />
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        <Button size="sm" variant="outline" onClick={() => editTeam(t)}><Edit className="w-4 h-4" /></Button>
                                                        <Button size="sm" variant="destructive" onClick={() => deleteTeam(t.id)}><Trash2 className="w-4 h-4" /></Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
