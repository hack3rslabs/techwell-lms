"use client"

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Loader2, Camera, User, Shield, Video, DollarSign, Mail, MessageSquare, Bot, CreditCard } from 'lucide-react'
import api from '@/lib/api'
import { useAuth } from '@/lib/auth-context'

export default function SettingsPage() {
    const { hasPermission, canWrite } = useAuth()
    
    interface UserProfile {
        name: string
        email: string
        phone?: string
        avatar?: string
        role: string
    }
    const [user, setUser] = React.useState<UserProfile | null>(null)
    const [isLoading, setIsLoading] = React.useState(true)
    const [isSavingProfile, setIsSavingProfile] = React.useState(false)
    const [isSavingSettings, setIsSavingSettings] = React.useState(false)

    // Profile Form
    const [formData, setFormData] = React.useState({
        name: '',
        phone: '',
    })
    const [avatarFile, setAvatarFile] = React.useState<File | null>(null)
    const [avatarPreview, setAvatarPreview] = React.useState<string | null>(null)

    // System Settings State
    const [systemSettings, setSystemSettings] = React.useState({
        platformName: '',
        supportEmail: '',
        primaryColor: '#2563eb',
        enableRegistration: true,
        isMaintenanceMode: false,
        smtpHost: '',
        smtpPort: '',
        smtpUser: '',
        smtpPassword: '',
        razorpayKeyId: '',
        razorpayKeySecret: '',
        zoomAccountId: '',
        zoomClientId: '',
        zoomClientSecret: '',
        googleMeetApiKey: '',
        msTeamsClientId: '',
        msTeamsClientSecret: '',
        stripePublicKey: '',
        stripeSecretKey: '',
        paypalClientId: '',
        paypalSecretKey: '',
        whatsappApiToken: '',
        whatsappPhoneNumberId: '',
        twilioAccountSid: '',
        twilioAuthToken: '',
        twilioPhoneNumber: '',
        n8nWebhookUrl: '',
        n8nAuthToken: '',
        openaiApiKey: '',
        anthropicApiKey: '',
        ragEndpointUrl: ''
    })

    React.useEffect(() => {
        fetchProfile()
    }, [])

    const fetchProfile = async () => {
        try {
            const [userRes, settingsRes] = await Promise.all([
                api.get('/users/me'),
                api.get('/settings') // Requires permissions, handles 403 gracefully if not admin
            ])

            setUser(userRes.data)
            setFormData({
                name: userRes.data.name || '',
                phone: userRes.data.phone || ''
            })
            setAvatarPreview(userRes.data.avatar ? `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000'}${userRes.data.avatar}` : null)

            if (settingsRes.data) {
                setSystemSettings({
                    platformName: settingsRes.data.platformName || '',
                    supportEmail: settingsRes.data.supportEmail || '',
                    primaryColor: settingsRes.data.primaryColor || '#2563eb',
                    enableRegistration: settingsRes.data.enableRegistration ?? true,
                    isMaintenanceMode: settingsRes.data.isMaintenanceMode ?? false,
                    smtpHost: settingsRes.data.smtpHost || '',
                    smtpPort: settingsRes.data.smtpPort || '',
                    smtpUser: settingsRes.data.smtpUser || '',
                    smtpPassword: settingsRes.data.smtpPassword || '',
                    razorpayKeyId: settingsRes.data.razorpayKeyId || '',
                    razorpayKeySecret: settingsRes.data.razorpayKeySecret || '',
                    zoomAccountId: settingsRes.data.zoomAccountId || '',
                    zoomClientId: settingsRes.data.zoomClientId || '',
                    zoomClientSecret: settingsRes.data.zoomClientSecret || '',
                    googleMeetApiKey: settingsRes.data.googleMeetApiKey || '',
                    msTeamsClientId: settingsRes.data.msTeamsClientId || '',
                    msTeamsClientSecret: settingsRes.data.msTeamsClientSecret || '',
                    stripePublicKey: settingsRes.data.stripePublicKey || '',
                    stripeSecretKey: settingsRes.data.stripeSecretKey || '',
                    paypalClientId: settingsRes.data.paypalClientId || '',
                    paypalSecretKey: settingsRes.data.paypalSecretKey || '',
                    whatsappApiToken: settingsRes.data.whatsappApiToken || '',
                    whatsappPhoneNumberId: settingsRes.data.whatsappPhoneNumberId || '',
                    twilioAccountSid: settingsRes.data.twilioAccountSid || '',
                    twilioAuthToken: settingsRes.data.twilioAuthToken || '',
                    twilioPhoneNumber: settingsRes.data.twilioPhoneNumber || '',
                    n8nWebhookUrl: settingsRes.data.n8nWebhookUrl || '',
                    n8nAuthToken: settingsRes.data.n8nAuthToken || '',
                    openaiApiKey: settingsRes.data.openaiApiKey || '',
                    anthropicApiKey: settingsRes.data.anthropicApiKey || '',
                    ragEndpointUrl: settingsRes.data.ragEndpointUrl || ''
                })
            }
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setAvatarFile(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSaveProfile = async () => {
        setIsSavingProfile(true)
        try {
            // 1. Update Details
            await api.put('/users/profile', formData)

            // 2. Upload Avatar if changed
            if (avatarFile) {
                const uploadData = new FormData()
                uploadData.append('avatar', avatarFile)
                await api.post('/users/profile-image', uploadData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                })
            }

            alert('Profile updated successfully!')
            fetchProfile() // Refresh
        } catch (error) {
            console.error(error)
            alert('Failed to update profile.')
        } finally {
            setIsSavingProfile(false)
        }
    }

    const handleSaveSettings = async () => {
        setIsSavingSettings(true)
        try {
            await api.put('/settings', systemSettings)
            alert('Settings updated successfully!')
            fetchProfile() // Refresh to get masked secrets
        } catch (error) {
            console.error(error)
            alert('Failed to update settings.')
        } finally {
            setIsSavingSettings(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-5xl">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
                <p className="text-muted-foreground">Manage your profile, platform branding, and integrations.</p>
            </div>

            <Tabs defaultValue="account" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="account" className="flex gap-2"><User className="h-4 w-4"/> Account</TabsTrigger>
                    {hasPermission('SETTINGS') && (
                        <>
                            <TabsTrigger value="branding" className="flex gap-2"><Shield className="h-4 w-4"/> Branding</TabsTrigger>
                            <TabsTrigger value="security" className="flex gap-2"><Shield className="h-4 w-4"/> Security</TabsTrigger>
                            <TabsTrigger value="integrations" className="flex gap-2"><DollarSign className="h-4 w-4"/> Integrations</TabsTrigger>
                        </>
                    )}
                </TabsList>

                {/* --- ACCOUNT TAB --- */}
                <TabsContent value="account">
                    <Card>
                        <CardHeader>
                            <CardTitle>Personal Profile</CardTitle>
                            <CardDescription>Update your photo and personal details.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex flex-col md:flex-row gap-8 items-start">
                                {/* Avatar Section */}
                                <div className="flex flex-col items-center gap-4">
                                    <Avatar className="h-32 w-32 border-2 border-muted">
                                        <AvatarImage src={avatarPreview || ''} className="object-cover" />
                                        <AvatarFallback className="text-4xl bg-muted">
                                            {user?.name?.charAt(0) || 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="relative">
                                        <input
                                            type="file"
                                            id="avatar-upload"
                                            className="hidden"
                                            accept="image/jpeg,image/png,image/jpg"
                                            onChange={handleFileChange}
                                        />
                                        <Button variant="outline" size="sm" className="cursor-pointer" asChild>
                                            <label htmlFor="avatar-upload">
                                                <Camera className="mr-2 h-4 w-4" />
                                                Change Photo
                                            </label>
                                        </Button>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        JPG, JPEG or PNG. Max 5MB.
                                    </p>
                                </div>

                                {/* Details Section */}
                                <div className="flex-1 space-y-4 w-full max-w-lg">
                                    <div className="grid gap-2">
                                        <Label>Full Name</Label>
                                        <Input
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Email Address</Label>
                                        <Input value={user?.email} disabled className="bg-muted/50" />
                                        <p className="text-[0.8rem] text-muted-foreground">Email cannot be changed.</p>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Phone Number</Label>
                                        <Input
                                            value={formData.phone}
                                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                            placeholder="+91..."
                                        />
                                    </div>

                                    <div className="pt-4">
                                        <Button onClick={handleSaveProfile} disabled={isSavingProfile}>
                                            {isSavingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Save Profile
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* --- BRANDING TAB --- */}
                {hasPermission('SETTINGS') && (
                    <TabsContent value="branding">
                        <Card>
                            <CardHeader>
                                <CardTitle>Platform Branding</CardTitle>
                                <CardDescription>Configure the platform's visual identity.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 max-w-2xl">
                                <div className="grid gap-2">
                                    <Label>Platform Name</Label>
                                    <Input
                                        value={systemSettings.platformName}
                                        onChange={e => setSystemSettings({ ...systemSettings, platformName: e.target.value })}
                                        disabled={!canWrite('SETTINGS')}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Support Email</Label>
                                    <Input
                                        value={systemSettings.supportEmail}
                                        onChange={e => setSystemSettings({ ...systemSettings, supportEmail: e.target.value })}
                                        disabled={!canWrite('SETTINGS')}
                                    />
                                </div>
                                <div className="pt-4">
                                    {canWrite('SETTINGS') && (
                                        <Button onClick={handleSaveSettings} disabled={isSavingSettings}>
                                            {isSavingSettings && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Save Branding
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                )}

                {/* --- SECURITY & ACCESS TAB --- */}
                {hasPermission('SETTINGS') && (
                    <TabsContent value="security">
                        <Card>
                            <CardHeader>
                                <CardTitle>Security & Access Controls</CardTitle>
                                <CardDescription>Manage who can access the platform.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">Allow Public Registration</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Allow new users to sign up from the landing page.
                                        </p>
                                    </div>
                                    <Switch
                                        checked={systemSettings.enableRegistration}
                                        onCheckedChange={(checked) => setSystemSettings({ ...systemSettings, enableRegistration: checked })}
                                        disabled={!canWrite('SETTINGS')}
                                    />
                                </div>
                                <div className="flex items-center justify-between p-4 border rounded-lg border-red-200 bg-red-50/30">
                                    <div className="space-y-0.5">
                                        <Label className="text-base text-red-600">Maintenance Mode</Label>
                                        <p className="text-sm text-red-600/80">
                                            Block all non-admin users from accessing the platform.
                                        </p>
                                    </div>
                                    <Switch
                                        checked={systemSettings.isMaintenanceMode}
                                        onCheckedChange={(checked) => setSystemSettings({ ...systemSettings, isMaintenanceMode: checked })}
                                        disabled={!canWrite('SETTINGS')}
                                    />
                                </div>
                                <div className="pt-2">
                                    {canWrite('SETTINGS') && (
                                        <Button onClick={handleSaveSettings} disabled={isSavingSettings}>
                                            {isSavingSettings && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Save Access Controls
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                )}

                {/* --- INTEGRATIONS TAB --- */}
                {hasPermission('SETTINGS') && (
                    <TabsContent value="integrations">
                        <div className="space-y-6">
                            
                            {/* SMTP */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2"><Mail className="h-5 w-5"/> SMTP Email Server</CardTitle>
                                    <CardDescription>Configure outgoing email server credentials.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4 max-w-2xl">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>SMTP Host</Label>
                                            <Input value={systemSettings.smtpHost} onChange={e => setSystemSettings({...systemSettings, smtpHost: e.target.value})} placeholder="smtp.gmail.com" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>SMTP Port</Label>
                                            <Input value={systemSettings.smtpPort} onChange={e => setSystemSettings({...systemSettings, smtpPort: e.target.value})} placeholder="587" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>SMTP Username</Label>
                                            <Input value={systemSettings.smtpUser} onChange={e => setSystemSettings({...systemSettings, smtpUser: e.target.value})} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>SMTP Password</Label>
                                            <Input type="password" value={systemSettings.smtpPassword} onChange={e => setSystemSettings({...systemSettings, smtpPassword: e.target.value})} placeholder="***" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Razorpay */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2"><DollarSign className="h-5 w-5"/> Razorpay Payment Gateway</CardTitle>
                                    <CardDescription>Process payments via Razorpay.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4 max-w-2xl">
                                    <div className="space-y-2">
                                        <Label>Key ID</Label>
                                        <Input value={systemSettings.razorpayKeyId} onChange={e => setSystemSettings({...systemSettings, razorpayKeyId: e.target.value})} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Key Secret</Label>
                                        <Input type="password" value={systemSettings.razorpayKeySecret} onChange={e => setSystemSettings({...systemSettings, razorpayKeySecret: e.target.value})} placeholder="***" />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Zoom */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2"><Video className="h-5 w-5"/> Zoom Conferencing</CardTitle>
                                    <CardDescription>Server-to-Server OAuth credentials.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4 max-w-2xl">
                                    <div className="space-y-2">
                                        <Label>Account ID</Label>
                                        <Input value={systemSettings.zoomAccountId} onChange={e => setSystemSettings({...systemSettings, zoomAccountId: e.target.value})} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Client ID</Label>
                                        <Input value={systemSettings.zoomClientId} onChange={e => setSystemSettings({...systemSettings, zoomClientId: e.target.value})} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Client Secret</Label>
                                        <Input type="password" value={systemSettings.zoomClientSecret} onChange={e => setSystemSettings({...systemSettings, zoomClientSecret: e.target.value})} placeholder="***" />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Additional Meetings */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2"><Video className="h-5 w-5"/> Additional Meetings</CardTitle>
                                    <CardDescription>Configure Google Meet and MS Teams.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4 max-w-2xl">
                                    <div className="space-y-2">
                                        <Label>Google Meet API Key</Label>
                                        <Input value={systemSettings.googleMeetApiKey} onChange={e => setSystemSettings({...systemSettings, googleMeetApiKey: e.target.value})} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>MS Teams Client ID</Label>
                                        <Input value={systemSettings.msTeamsClientId} onChange={e => setSystemSettings({...systemSettings, msTeamsClientId: e.target.value})} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>MS Teams Client Secret</Label>
                                        <Input type="password" value={systemSettings.msTeamsClientSecret} onChange={e => setSystemSettings({...systemSettings, msTeamsClientSecret: e.target.value})} placeholder="***" />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Additional Payments */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5"/> Stripe & PayPal</CardTitle>
                                    <CardDescription>Configure international payment gateways.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4 max-w-2xl">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Stripe Public Key</Label>
                                            <Input value={systemSettings.stripePublicKey} onChange={e => setSystemSettings({...systemSettings, stripePublicKey: e.target.value})} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Stripe Secret Key</Label>
                                            <Input type="password" value={systemSettings.stripeSecretKey} onChange={e => setSystemSettings({...systemSettings, stripeSecretKey: e.target.value})} placeholder="***" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>PayPal Client ID</Label>
                                            <Input value={systemSettings.paypalClientId} onChange={e => setSystemSettings({...systemSettings, paypalClientId: e.target.value})} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>PayPal Secret Key</Label>
                                            <Input type="password" value={systemSettings.paypalSecretKey} onChange={e => setSystemSettings({...systemSettings, paypalSecretKey: e.target.value})} placeholder="***" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Messaging */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5"/> SMS & WhatsApp</CardTitle>
                                    <CardDescription>Twilio and WhatsApp Cloud API credentials.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4 max-w-2xl">
                                    <div className="space-y-2">
                                        <Label>WhatsApp Phone Number ID</Label>
                                        <Input value={systemSettings.whatsappPhoneNumberId} onChange={e => setSystemSettings({...systemSettings, whatsappPhoneNumberId: e.target.value})} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>WhatsApp API Token</Label>
                                        <Input type="password" value={systemSettings.whatsappApiToken} onChange={e => setSystemSettings({...systemSettings, whatsappApiToken: e.target.value})} placeholder="***" />
                                    </div>
                                    <div className="space-y-2 pt-2 border-t">
                                        <Label>Twilio Account SID</Label>
                                        <Input value={systemSettings.twilioAccountSid} onChange={e => setSystemSettings({...systemSettings, twilioAccountSid: e.target.value})} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Twilio Auth Token</Label>
                                        <Input type="password" value={systemSettings.twilioAuthToken} onChange={e => setSystemSettings({...systemSettings, twilioAuthToken: e.target.value})} placeholder="***" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Twilio Phone Number</Label>
                                        <Input value={systemSettings.twilioPhoneNumber} onChange={e => setSystemSettings({...systemSettings, twilioPhoneNumber: e.target.value})} />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* AI & Automation */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2"><Bot className="h-5 w-5"/> AI & Automation (n8n / RAG)</CardTitle>
                                    <CardDescription>Configure AI Agents and Workflow Automation Webhooks.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4 max-w-2xl">
                                    <div className="space-y-2">
                                        <Label>OpenAI API Key</Label>
                                        <Input type="password" value={systemSettings.openaiApiKey} onChange={e => setSystemSettings({...systemSettings, openaiApiKey: e.target.value})} placeholder="***" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Anthropic API Key</Label>
                                        <Input type="password" value={systemSettings.anthropicApiKey} onChange={e => setSystemSettings({...systemSettings, anthropicApiKey: e.target.value})} placeholder="***" />
                                    </div>
                                    <div className="space-y-2 pt-2 border-t">
                                        <Label>n8n Webhook URL</Label>
                                        <Input value={systemSettings.n8nWebhookUrl} onChange={e => setSystemSettings({...systemSettings, n8nWebhookUrl: e.target.value})} placeholder="https://n8n.example.com/webhook/..." />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>n8n Auth Token</Label>
                                        <Input type="password" value={systemSettings.n8nAuthToken} onChange={e => setSystemSettings({...systemSettings, n8nAuthToken: e.target.value})} placeholder="***" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Custom RAG Endpoint URL</Label>
                                        <Input value={systemSettings.ragEndpointUrl} onChange={e => setSystemSettings({...systemSettings, ragEndpointUrl: e.target.value})} placeholder="https://rag-api.example.com/query" />
                                    </div>
                                    
                                    <div className="pt-4">
                                        {canWrite('SETTINGS') && (
                                            <Button onClick={handleSaveSettings} disabled={isSavingSettings}>
                                                {isSavingSettings && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                Save Integrations
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                        </div>
                    </TabsContent>
                )}
            </Tabs>
        </div>
    )
}
