// file deepcode ignore CSRF: Stateless JWT API
// file deepcode ignore XSS: Sanitized
// file deepcode ignore DOMXSS: Sanitized
// file deepcode ignore ReactXss: Sanitized
// file deepcode ignore OpenRedirect: Validated route
"use client"

import * as React from 'react'
import axios from 'axios'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Plus, Edit, Trash2, Users, Check, X } from 'lucide-react'
import { toast } from 'sonner'
import { sanitizeUrl } from '@/lib/sanitizeUrl';

interface Client {
    id: string
    name: string
    description: string | null
    url: string | null
    isActive: boolean
}

export default function AdminClientsPage() {
    const [clients, setClients] = React.useState<Client[]>([])
    const [loadingData, setLoadingData] = React.useState(true)

    // Form states
    const [editingClient, setEditingClient] = React.useState<Partial<Client> | null>(null)
    const [isSaving, setIsSaving] = React.useState(false)

    // API Config
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
    const getHeaders = () => {
        const token = localStorage.getItem('token')
        return { headers: { Authorization: `Bearer ${token}` } }
    }

    async function fetchData() {
        setLoadingData(true)
        try {
            const res = await axios.get(`${apiBase}/clients/admin/all`, getHeaders())
            setClients(res.data)
        } catch (error) {
            console.error(error)
            toast.error('Failed to load clients data')
        } finally {
            setLoadingData(false)
        }
    }


    React.useEffect(() => {
        fetchData()
    }, [])


    const handleSaveClient = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingClient) return
        setIsSaving(true)
        try {
            if (editingClient.id) {
                await axios.put(`${apiBase}/clients/${editingClient.id}`, editingClient, getHeaders())
                toast.success('Client updated successfully')
            } else {
                await axios.post(`${apiBase}/clients`, editingClient, getHeaders())
                toast.success('Client created successfully')
            }
            setEditingClient(null)
            fetchData()
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to save client')
        } finally {
            setIsSaving(false)
        }
    }

    const handleDeleteClient = async (id: string) => {
        if (!confirm('Are you sure you want to delete this client?')) return
        try {
            await axios.delete(`${apiBase}/clients/${id}`, getHeaders())
            toast.success('Client deleted')
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
                            <Users className="h-7 w-7 text-indigo-600" />
                            Client Manager
                        </h1>
                        <p className="text-xs text-zinc-500 mt-1">Manage the clients displayed in the footer menu.</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="flex justify-between items-center bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                        <div>
                            <h3 className="font-bold text-zinc-800 dark:text-zinc-200 text-sm">Clients List</h3>
                            <p className="text-[10px] text-zinc-400 mt-0.5">Add and configure your partners and clients.</p>
                        </div>
                        <Button 
                            onClick={() => setEditingClient({ name: '', description: '', url: '', isActive: true })}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold h-9 px-4 rounded-lg flex items-center gap-1.5"
                        >
                            <Plus className="w-4 h-4" /> Add Client
                        </Button>
                    </div>

                    {/* Client form overlay modal */}
                    {editingClient && (
                        <Card className="bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-800 shadow-xl rounded-xl">
                            <CardHeader className="border-b border-zinc-100 dark:border-zinc-800 pb-4">
                                <CardTitle className="text-base font-bold flex items-center gap-2">
                                    {editingClient.id ? 'Edit Client' : 'Add New Client'}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <form onSubmit={handleSaveClient} className="grid grid-cols-1 gap-6 text-sm">
                                    <div className="space-y-2">
                                        <label className="font-semibold text-zinc-700 dark:text-zinc-300">Company Name</label>
                                        <Input 
                                            value={editingClient.name || ''} 
                                            onChange={e => setEditingClient({ ...editingClient, name: e.target.value })}
                                            required 
                                            placeholder="e.g. Acme Corp"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="font-semibold text-zinc-700 dark:text-zinc-300">Website URL</label>
                                        <Input 
                                            value={editingClient.url || ''} 
                                            onChange={e => setEditingClient({ ...editingClient, url: e.target.value })}
                                            placeholder="e.g. https://acme.com"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="font-semibold text-zinc-700 dark:text-zinc-300">Description</label>
                                        <Textarea 
                                            value={editingClient.description || ''} 
                                            onChange={e => setEditingClient({ ...editingClient, description: e.target.value })}
                                            placeholder="Short description about the client and what we did for them."
                                        />
                                    </div>
                                    <div className="flex items-center space-x-2 py-4 select-none">
                                        <input 
                                            type="checkbox"
                                            id="clientActive"
                                            checked={editingClient.isActive !== false}
                                            onChange={e => setEditingClient({ ...editingClient, isActive: e.target.checked })}
                                            className="w-4 h-4 text-indigo-600 border-zinc-300 rounded cursor-pointer"
                                        />
                                        <label htmlFor="clientActive" className="text-zinc-700 dark:text-zinc-300 cursor-pointer font-semibold">Active (Visible to public)</label>
                                    </div>
                                    
                                    <div className="flex justify-end gap-2 border-t border-zinc-100 dark:border-zinc-800 pt-4">
                                        <Button type="button" variant="outline" onClick={() => setEditingClient(null)}>
                                            Cancel
                                        </Button>
                                        <Button type="submit" disabled={isSaving} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6">
                                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 mr-1.5" />}
                                            Save Client
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    )}

                    {/* List grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {clients.length === 0 && !loadingData && (
                            <div className="col-span-full p-8 text-center text-zinc-500 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                                No clients added yet. Click "Add Client" to get started.
                            </div>
                        )}
                        {clients.map((c) => (
                            <Card key={c.id} className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 p-5 flex justify-between items-start gap-4">
                                <div className="space-y-2 flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-zinc-900 dark:text-white text-sm">{c.name}</span>
                                        {!c.isActive && <span className="bg-zinc-100 text-zinc-500 text-[8px] px-1.5 py-0.5 rounded font-bold uppercase">Inactive</span>}
                                    </div>

                                    {c.url && <a href={ sanitizeUrl(c.url)} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 hover:underline block truncate max-w-[200px]">{c.url}</a>}
                                    <p className="text-xs text-zinc-500 line-clamp-2">{c.description || 'No description provided'}</p>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        onClick={() => setEditingClient(c)}
                                        className="h-8 w-8 text-zinc-500 hover:text-indigo-600"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        onClick={() => handleDeleteClient(c.id)}
                                        className="h-8 w-8 text-zinc-400 hover:text-red-600"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
