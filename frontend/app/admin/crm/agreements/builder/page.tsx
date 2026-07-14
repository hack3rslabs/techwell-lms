"use client"

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Save, ArrowLeft, Send, Plus } from 'lucide-react'
import api from '@/lib/api'
import { toast } from 'react-hot-toast'
import dynamic from 'next/dynamic'
import { useAuth } from '@/lib/auth-context'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

// Dynamically import react-quill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill-new'), {
  ssr: false
});
import 'react-quill-new/dist/quill.snow.css';

export default function AgreementBuilder() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const agreementId = searchParams.get('id')

    const [loading, setLoading] = useState(false)
    const [customers, setCustomers] = useState<any[]>([])
    const [isAddClientOpen, setIsAddClientOpen] = useState(false)
    const { hasPermission } = useAuth()
    
    // Quick Add Client Form
    const [newClient, setNewClient] = useState({
        name: '',
        companyName: '',
        email: '',
        phone: ''
    })
    
    const [formData, setFormData] = useState({
        customerId: '',
        title: '',
        vertical: 'SOFTWARE_DEVELOPMENT',
        totalValue: 0,
        taxPercentage: 18,
        content: `<h2>Service Agreement</h2>
<p>This Agreement is entered into by and between Techwell and the Client.</p>
<h3>1. Scope of Work</h3>
<p>...</p>
<h3>2. Deliverables</h3>
<p>...</p>
<h3>3. Payment Terms</h3>
<p>...</p>`
    })

    async function fetchCustomers() {
        try {
            const res = await api.get('/crm/customers')
            setCustomers(res.data)
        } catch (error) {
            console.error("Failed to fetch customers")
        }
    }

    async function fetchAgreement(id: string) {
        try {
            const res = await api.get(`/crm/agreements/${id}`)
            const agr = res.data
            setFormData({
                customerId: agr.customerId,
                title: agr.title || '',
                vertical: agr.vertical || 'SOFTWARE_DEVELOPMENT',
                totalValue: agr.totalValue || 0,
                taxPercentage: agr.taxPercentage || 18,
                content: agr.content || ''
            })
        } catch (error) {
            toast.error("Failed to load agreement")
        }
    }



    useEffect(() => {
        fetchCustomers()
        if (agreementId) {
            fetchAgreement(agreementId)
        }
    }, [agreementId])


    const handleCreateClient = async () => {
        if (!newClient.name || !newClient.email) {
            toast.error("Name and Email are required")
            return
        }
        try {
            const res = await api.post('/crm/customers', newClient)
            toast.success("Client added successfully")
            setCustomers([...customers, res.data])
            setFormData(prev => ({ ...prev, customerId: res.data.id }))
            setIsAddClientOpen(false)
            setNewClient({ name: '', companyName: '', email: '', phone: '' })
        } catch (error) {
            toast.error("Failed to add client")
        }
    }


    const handleSave = async (status: string) => {
        if (!formData.customerId || !formData.title) {
            toast.error("Please fill required fields (Customer & Title)")
            return
        }

        try {
            setLoading(true)
            const payload = { ...formData, status }

            if (agreementId) {
                await api.put(`/crm/agreements/${agreementId}`, payload)
                toast.success("Agreement updated successfully")
                router.push(`/admin/crm/agreements/${agreementId}`)
            } else {
                const res = await api.post('/crm/agreements', payload)
                toast.success("Agreement created successfully")
                router.push(`/admin/crm/agreements/${res.data.id}`)
            }
        } catch (error: any) {
            console.error(error)
            toast.error(error.response?.data?.error || "Failed to save agreement")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6 pb-20">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            {agreementId ? 'Edit Agreement' : 'Create New Agreement'}
                        </h1>
                        <p className="text-muted-foreground">Draft and configure terms for the client.</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {((!agreementId && hasPermission('CENTRAL_CRM', 'create')) || (agreementId && hasPermission('CENTRAL_CRM', 'update'))) && (
                        <Button variant="outline" onClick={() => handleSave('DRAFT')} disabled={loading}>
                            <Save className="mr-2 h-4 w-4" /> Save as Draft
                        </Button>
                    )}
                    {agreementId && hasPermission('CENTRAL_CRM', 'update') && (
                        <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => handleSave('SENT')} disabled={loading}>
                            <Send className="mr-2 h-4 w-4" /> Save & Send to Client
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Side: Meta Configuration */}
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Agreement Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label>Select Client</Label>
                                    {!agreementId && hasPermission('CENTRAL_CRM', 'create') && (
                                        <Dialog open={isAddClientOpen} onOpenChange={setIsAddClientOpen}>
                                            <DialogTrigger asChild>
                                                <Button variant="ghost" size="sm" className="h-6 px-2 text-primary">
                                                    <Plus className="h-3 w-3 mr-1" /> Add New
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Add New Client</DialogTitle>
                                                    <DialogDescription>Quickly add a new client to build an agreement for them.</DialogDescription>
                                                </DialogHeader>
                                                <div className="space-y-4 py-4">
                                                    <div className="space-y-2">
                                                        <Label>Client Name *</Label>
                                                        <Input value={newClient.name} onChange={e => setNewClient(prev => ({...prev, name: e.target.value}))} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Company Name</Label>
                                                        <Input value={newClient.companyName} onChange={e => setNewClient(prev => ({...prev, companyName: e.target.value}))} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Email *</Label>
                                                        <Input type="email" value={newClient.email} onChange={e => setNewClient(prev => ({...prev, email: e.target.value}))} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Phone</Label>
                                                        <Input value={newClient.phone} onChange={e => setNewClient(prev => ({...prev, phone: e.target.value}))} />
                                                    </div>
                                                    <Button className="w-full" onClick={handleCreateClient}>Save Client</Button>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    )}
                                </div>
                                <Select
                                    value={formData.customerId}
                                    onValueChange={(val) => setFormData(prev => ({ ...prev, customerId: val }))}
                                    disabled={!!agreementId}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a client..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {customers.map(c => (
                                            <SelectItem key={c.id} value={c.id}>{c.name} {c.companyName ? `(${c.companyName})` : ''}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            <div className="space-y-2">
                                <Label>Agreement Title</Label>
                                <Input 
                                    placeholder="e.g. Mobile App Development Contract" 
                                    value={formData.title}
                                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Vertical / Service</Label>
                                <Select
                                    value={formData.vertical}
                                    onValueChange={(val) => setFormData(prev => ({ ...prev, vertical: val }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select vertical..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="SOFTWARE_DEVELOPMENT">Software Development</SelectItem>
                                        <SelectItem value="WEB_DEVELOPMENT">Web Development</SelectItem>
                                        <SelectItem value="AI_SOLUTIONS">AI Solutions</SelectItem>
                                        <SelectItem value="IT_CONSULTING">IT Consulting</SelectItem>
                                        <SelectItem value="CYBER_SECURITY">Cyber Security</SelectItem>
                                        <SelectItem value="AMC_SUPPORT">AMC & IT Support</SelectItem>
                                        <SelectItem value="OTHER">Other Custom Service</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Total Value (₹)</Label>
                                    <Input 
                                        type="number"
                                        value={formData.totalValue}
                                        onChange={(e) => setFormData(prev => ({ ...prev, totalValue: Number(e.target.value) }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Tax (%)</Label>
                                    <Input 
                                        type="number"
                                        value={formData.taxPercentage}
                                        onChange={(e) => setFormData(prev => ({ ...prev, taxPercentage: Number(e.target.value) }))}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Side: Rich Text Document */}
                <div className="lg:col-span-2">
                    <Card className="h-full flex flex-col">
                        <CardHeader>
                            <CardTitle>Document Content</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 min-h-[500px]">
                            <ReactQuill 
                                theme="snow" 
                                value={formData.content} 
                                onChange={(val) => setFormData(prev => ({ ...prev, content: val }))}
                                className="h-[400px] mb-12"
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
