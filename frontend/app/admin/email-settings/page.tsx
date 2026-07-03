"use client"

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

import {
    Mail,
    Server,
    Plus
} from 'lucide-react'
import api from '@/lib/api'

interface EmailConfig {
    id: string
    provider: string
    name: string
    isActive: boolean
    host?: string
    port?: number
    user?: string
    fromEmail?: string
    serviceId?: string
    templateId?: string
    publicKey?: string
}

export default function EmailSettingsPage() {
    const [configs, setConfigs] = React.useState<EmailConfig[]>([])
    const [_isLoading, setIsLoading] = React.useState(true)
    const [showAddForm, setShowAddForm] = React.useState(false)
    const [testEmail, setTestEmail] = React.useState('')

    // Form State
    const [formData, setFormData] = React.useState({
        provider: 'EMAILJS',
        name: '',
        host: '',
        port: 587,
        user: '',
        pass: '',
        fromEmail: '',
        serviceId: '',
        templateId: '',
        publicKey: '',
        privateKey: ''
    })

    React.useEffect(() => {
        fetchConfigs()
    }, [])

    const fetchConfigs = async () => {
        try {
            const res = await api.get('/email-settings/config')
            setConfigs(res.data)
        } catch {
            // Error logged if needed
        } finally {
            setIsLoading(false)
        }
    }

    const handleSave = async () => {
        try {
            await api.post('/email-settings/config', formData)
            setShowAddForm(false)
            fetchConfigs()
            resetForm()
        } catch (_error) {
            alert('Failed to save configuration')
        }
    }

    const handleActivate = async (id: string) => {
        try {
            await api.put(`/email-settings/config/${id}/activate`)
            fetchConfigs()
        } catch (_error) {
            alert('Failed to activate')
        }
    }

    const handleTest = async (id: string) => {
        if (!testEmail) return alert('Please enter a test email address')
        try {
            const res = await api.post('/email-settings/test', { id, toEmail: testEmail })
            alert(res.data.message || 'Test email sent!')
        } catch (error) {
            const err = error as { response?: { data?: { details?: string } }, message: string }
            alert('Test Failed: ' + (err.response?.data?.details || err.message))
        }
    }

    const resetForm = () => {
        setFormData({
            provider: 'EMAILJS',
            name: '',
            host: '',
            port: 587,
            user: '',
            pass: '',
            fromEmail: '',
            serviceId: '',
            templateId: '',
            publicKey: '',
            privateKey: ''
        })
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <Mail className="h-8 w-8 text-primary" />
                    Email Services
                </h1>
                <p className="text-muted-foreground">Configure transactional and marketing email providers.</p>
            </div>

            <div className="flex gap-4 items-center p-4 bg-muted/30 rounded-lg border">
                <Input
                    placeholder="Enter email to test..."
                    value={testEmail}
                    onChange={e => setTestEmail(e.target.value)}
                    className="max-w-xs bg-background"
                />
                <span className="text-sm text-muted-foreground">Use this email for &quot;Test Connection&quot; buttons below.</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* List of Configs */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold">Providers</h2>
                        <Button onClick={() => setShowAddForm(true)} size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Add New
                        </Button>
                    </div>

                    {configs.map(config => (
                        <Card key={config.id} className={config.isActive ? 'border-primary shadow-sm' : ''}>
                            <CardHeader className="pb-2">
                                <CardTitle className="flex justify-between items-center text-lg">
                                    <span className="flex items-center gap-2">
                                        {config.provider === 'SMTP' ? <Server className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
                                        {config.name || config.provider}
                                    </span>
                                    {config.isActive && <Badge>Active</Badge>}
                                </CardTitle>
                                <CardDescription>
                                    {config.provider === 'SMTP' ? `${config.host}:${config.port}` : `Service ID: ${config.serviceId}`}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex gap-2 justify-end pt-0">
                                <Button variant="outline" size="sm" onClick={() => handleTest(config.id)}>Test</Button>
                                {!config.isActive && (
                                    <Button size="sm" onClick={() => handleActivate(config.id)}>Activate</Button>
                                )}
                            </CardContent>
                        </Card>
                    ))}

                    {configs.length === 0 && !showAddForm && (
                        <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                            No email providers configured.
                        </div>
                    )}
                </div>

                {/* Add/Edit Form */}
                {showAddForm && (
                    <Card className="border-t-4 border-t-primary">
                        <CardHeader>
                            <CardTitle>Add Email Provider</CardTitle>
                            <CardDescription>Configure SMTP or EmailJS Settings</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Provider Type</Label>
                                <select
                                    className="w-full h-10 px-3 rounded-md border bg-background"
                                    value={formData.provider}
                                    onChange={e => setFormData({ ...formData, provider: e.target.value })}
                                >
                                    <option value="EMAILJS">EmailJS (Frontend/API)</option>
                                    <option value="SMTP">SMTP (Standard)</option>
                                    <option value="SENDGRID">SendGrid</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label>Display Name</Label>
                                <Input
                                    placeholder="e.g. Marketing EmailJS"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            {formData.provider === 'SMTP' ? (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Host</Label>
                                            <Input placeholder="smtp.gmail.com" value={formData.host} onChange={e => setFormData({ ...formData, host: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Port</Label>
                                            <Input type="number" placeholder="587" value={formData.port} onChange={e => setFormData({ ...formData, port: parseInt(e.target.value) })} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Username</Label>
                                        <Input value={formData.user} onChange={e => setFormData({ ...formData, user: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Password</Label>
                                        <Input type="password" value={formData.pass} onChange={e => setFormData({ ...formData, pass: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>From Email</Label>
                                        <Input placeholder="noreply@techwell.co.in" value={formData.fromEmail} onChange={e => setFormData({ ...formData, fromEmail: e.target.value })} />
                                    </div>
                                </>
                            ) : formData.provider === 'EMAILJS' ? (
                                <>
                                    <div className="space-y-2">
                                        <Label>Service ID</Label>
                                        <Input placeholder="service_xyz" value={formData.serviceId} onChange={e => setFormData({ ...formData, serviceId: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Template ID</Label>
                                        <Input placeholder="template_abc" value={formData.templateId} onChange={e => setFormData({ ...formData, templateId: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Public Key (User ID)</Label>
                                        <Input placeholder="user_123" value={formData.publicKey} onChange={e => setFormData({ ...formData, publicKey: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Private Key</Label>
                                        <Input type="password" placeholder="Access Token for API" value={formData.privateKey} onChange={e => setFormData({ ...formData, privateKey: e.target.value })} />
                                        <p className="text-xs text-muted-foreground">Required for backend sending. Found in Account &gt; Security.</p>
                                    </div>
                                </>
                            ) : (
                                <div className="p-4 bg-muted text-center">Provider not fully supported in UI yet</div>
                            )}

                            <div className="flex gap-2 justify-end pt-4">
                                <Button variant="ghost" onClick={() => setShowAddForm(false)}>Cancel</Button>
                                <Button onClick={handleSave}>Save Configuration</Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
