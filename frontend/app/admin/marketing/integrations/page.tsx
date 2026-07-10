"use client"

import * as React from 'react'
import axios from 'axios'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Plus, Facebook, MessageCircle, AlertCircle, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

export default function IntegrationsPage() {
    const [integrations, setIntegrations] = React.useState<any[]>([])
    const [loading, setLoading] = React.useState(true)
    const [isAddOpen, setIsAddOpen] = React.useState(false)
    const [isSaving, setIsSaving] = React.useState(false)

    // Form
    const [platform, setPlatform] = React.useState('META')
    const [name, setName] = React.useState('')
    const [accessToken, setAccessToken] = React.useState('')
    const [pageId, setPageId] = React.useState('')
    const [accountId, setAccountId] = React.useState('')
    const [webhookSecret, setWebhookSecret] = React.useState('')

    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
    const getHeaders = () => {
        const token = localStorage.getItem('token')
        return { headers: { Authorization: `Bearer ${token}` } }
    }

    async function fetchIntegrations() {
        try {
            const res = await axios.get(`${apiBase}/leads/integrations`, getHeaders())
            setIntegrations(res.data || [])
        } catch (error) {
            toast.error('Failed to load integrations')
        } finally {
            setLoading(false)
        }
    }


    React.useEffect(() => {
        fetchIntegrations()
    }, [])


    const handleSave = async () => {
        setIsSaving(true)
        try {
            await axios.post(`${apiBase}/leads/integrations`, {
                platform,
                name,
                accessToken,
                pageId,
                accountId,
                webhookSecret
            }, getHeaders())
            toast.success('Integration configured successfully')
            setIsAddOpen(false)
            fetchIntegrations()
            // reset form
            setName('')
            setAccessToken('')
            setPageId('')
            setAccountId('')
            setWebhookSecret('')
        } catch (error) {
            toast.error('Failed to save integration')
        } finally {
            setIsSaving(false)
        }
    }

    if (loading) {
        return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Marketing Integrations</h1>
                    <p className="text-muted-foreground">Configure connections to Meta Suite and WhatsApp Business API.</p>
                </div>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button><Plus className="w-4 h-4 mr-2" /> Add Connection</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Integration</DialogTitle>
                            <DialogDescription>Enter your API credentials to connect a new marketing platform.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Platform</Label>
                                <Select value={platform} onValueChange={setPlatform}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="META">Meta Ads (Facebook/Instagram)</SelectItem>
                                        <SelectItem value="WHATSAPP">WhatsApp Business API</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Connection Name</Label>
                                <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Main FB Page Ads" />
                            </div>
                            <div className="space-y-2">
                                <Label>Access Token (Secret)</Label>
                                <Input type="password" value={accessToken} onChange={e => setAccessToken(e.target.value)} placeholder="EAAI..." />
                            </div>
                            <div className="space-y-2">
                                <Label>{platform === 'META' ? 'Page ID' : 'Phone Number ID'}</Label>
                                <Input value={pageId} onChange={e => setPageId(e.target.value)} placeholder="1029384756..." />
                            </div>
                            <div className="space-y-2">
                                <Label>{platform === 'META' ? 'Ad Account ID (Optional)' : 'Business Account ID'}</Label>
                                <Input value={accountId} onChange={e => setAccountId(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Webhook Verify Token</Label>
                                <Input value={webhookSecret} onChange={e => setWebhookSecret(e.target.value)} placeholder="Your custom secret token" />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleSave} disabled={isSaving}>
                                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null} Save Connection
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {integrations.map((integration) => (
                    <Card key={integration.id}>
                        <CardHeader className="pb-3 border-b">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    {integration.platform === 'META' ? (
                                        <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
                                            <Facebook className="w-5 h-5" />
                                        </div>
                                    ) : (
                                        <div className="bg-emerald-100 text-emerald-600 p-2 rounded-lg">
                                            <MessageCircle className="w-5 h-5" />
                                        </div>
                                    )}
                                    <div>
                                        <CardTitle className="text-lg">{integration.name}</CardTitle>
                                        <CardDescription>{integration.platform}</CardDescription>
                                    </div>
                                </div>
                                <div className={`px-2 py-1 rounded text-xs font-bold ${integration.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                                    {integration.isActive ? 'ACTIVE' : 'INACTIVE'}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-2 text-sm text-slate-600">
                            <div className="flex justify-between">
                                <span className="font-semibold">ID:</span>
                                <span>{integration.pageId || integration.accountId || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-semibold">Webhook Secret:</span>
                                <span>{integration.webhookSecret ? '••••••••' : 'None'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-semibold">Access Token:</span>
                                <span>{integration.accessToken ? '••••••••' : 'Missing'}</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {integrations.length === 0 && (
                    <div className="col-span-1 md:col-span-2 text-center py-16 bg-slate-50 border border-dashed rounded-xl">
                        <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-slate-900">No Integrations Configured</h3>
                        <p className="text-slate-500 mb-4">Connect your Meta or WhatsApp Business accounts to get started.</p>
                        <Button onClick={() => setIsAddOpen(true)} variant="outline">Add Connection</Button>
                    </div>
                )}
            </div>
        </div>
    )
}
